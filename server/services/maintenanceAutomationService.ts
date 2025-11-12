/**
 * Serviço de Automação de Manutenção Preventiva
 * Implementa a lógica de monitoramento e follow-up automático
 */

import { db } from "../db";
import { assets, quotes, automatedNotifications, clients } from "../../drizzle/schema";
import { lte, eq, and } from "drizzle-orm";

interface MaintenanceAlert {
  assetId: number;
  clientId: number;
  clientName: string;
  clientContact: string;
  assetInfo: string;
  daysUntilMaintenance: number;
}

/**
 * Monitora ativos que precisam de manutenção preventiva
 * Executa diariamente via cron job
 */
export async function monitorPreventiveMaintenance(): Promise<MaintenanceAlert[]> {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Buscar ativos que precisam de MP nos próximos 30 dias
  const assetsNeedingMaintenance = await db
    .select()
    .from(assets)
    .where(
      and(
        eq(assets.status, "active"),
        lte(assets.nextMaintenanceDate, thirtyDaysFromNow)
      )
    );

  const alerts: MaintenanceAlert[] = [];

  for (const asset of assetsNeedingMaintenance) {
    if (!asset.nextMaintenanceDate) continue;

    const daysUntil = Math.ceil(
      (asset.nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Buscar informações do cliente
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, asset.clientId));

    if (!client) continue;

    alerts.push({
      assetId: asset.id,
      clientId: client.id,
      clientName: client.name,
      clientContact: client.whatsapp || client.phone || client.email || "",
      assetInfo: `${asset.brand} ${asset.model} - ${asset.serialNumber}`,
      daysUntilMaintenance: daysUntil,
    });
  }

  return alerts;
}

/**
 * Cria leads automáticos de follow-up para manutenção preventiva
 */
export async function createMaintenanceLeads(userId: number): Promise<number> {
  const alerts = await monitorPreventiveMaintenance();
  let createdCount = 0;

  for (const alert of alerts) {
    // Verificar se já existe um orçamento pendente para este ativo
    const existingQuotes = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.clientId, alert.clientId),
          eq(quotes.status, "draft")
        )
      );

    // Se já existe um orçamento pendente, não criar outro
    if (existingQuotes.length > 0) continue;

    // Criar novo orçamento de MP
    const quoteNumber = `MP-${Date.now()}-${alert.assetId}`;
    
    await db.insert(quotes).values({
      userId,
      quoteNumber,
      clientId: alert.clientId,
      clientName: alert.clientName,
      clientEmail: "",
      clientPhone: alert.clientContact,
      serviceDescription: `Manutenção Preventiva - ${alert.assetInfo}\nPróxima manutenção em ${alert.daysUntilMaintenance} dias`,
      status: "draft",
      subtotal: "0",
      totalValue: "0",
      notes: "Lead gerado automaticamente pelo sistema de MP",
    });

    createdCount++;
  }

  return createdCount;
}

/**
 * Envia notificações automáticas para clientes sobre MP
 */
export async function sendMaintenanceNotifications(userId: number): Promise<number> {
  const alerts = await monitorPreventiveMaintenance();
  let sentCount = 0;

  for (const alert of alerts) {
    // Verificar se já foi enviada notificação recentemente (últimos 7 dias)
    const recentNotifications = await db
      .select()
      .from(automatedNotifications)
      .where(
        and(
          eq(automatedNotifications.relatedEntityType, "asset"),
          eq(automatedNotifications.relatedEntityId, alert.assetId),
          eq(automatedNotifications.notificationType, "maintenance_reminder")
        )
      );

    const hasRecentNotification = recentNotifications.some((notif) => {
      if (!notif.createdAt) return false;
      const daysSince = Math.ceil(
        (Date.now() - notif.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince < 7;
    });

    if (hasRecentNotification) continue;

    // Determinar o canal (priorizar WhatsApp se disponível)
    const channel = alert.clientContact.includes("@") ? "email" : "whatsapp";

    // Criar mensagem personalizada
    const message = `Olá ${alert.clientName}! 

Lembramos que a manutenção preventiva do seu equipamento ${alert.assetInfo} está programada para daqui a ${alert.daysUntilMaintenance} dias.

A manutenção preventiva é essencial para:
✓ Garantir o melhor desempenho do equipamento
✓ Evitar problemas futuros
✓ Prolongar a vida útil do aparelho

Entre em contato conosco para agendar o serviço!`;

    // Criar notificação na fila
    await db.insert(automatedNotifications).values({
      userId,
      notificationType: "maintenance_reminder",
      recipientType: "client",
      recipientId: alert.clientId,
      recipientContact: alert.clientContact,
      channel,
      subject: "Lembrete de Manutenção Preventiva",
      message,
      status: "pending",
      scheduledFor: new Date(),
      relatedEntityType: "asset",
      relatedEntityId: alert.assetId,
    });

    sentCount++;
  }

  return sentCount;
}

/**
 * Atualiza a data da próxima manutenção após conclusão de uma OS
 */
export async function updateNextMaintenanceDate(
  assetId: number,
  maintenanceIntervalDays: number = 90
): Promise<void> {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + maintenanceIntervalDays);

  await db
    .update(assets)
    .set({
      nextMaintenanceDate: nextDate,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, assetId));
}

/**
 * Cria automaticamente um ativo quando um orçamento de instalação é aprovado
 */
export async function createAssetFromQuote(
  quoteId: number,
  userId: number,
  assetData: {
    serialNumber: string;
    brand: string;
    model: string;
    capacity?: string;
    physicalLocation?: string;
  }
): Promise<number> {
  // Buscar o orçamento
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId));

  if (!quote) {
    throw new Error("Orçamento não encontrado");
  }

  // Criar o ativo
  const [newAsset] = await db
    .insert(assets)
    .values({
      userId,
      clientId: quote.clientId,
      serialNumber: assetData.serialNumber,
      brand: assetData.brand,
      model: assetData.model,
      capacity: assetData.capacity,
      physicalLocation: assetData.physicalLocation,
      installationDate: new Date(),
      warrantyDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
      assetType: "air_conditioner",
      status: "active",
    })
    .returning();

  return newAsset.id;
}

/**
 * Segmenta clientes automaticamente baseado em critérios
 */
export async function segmentClients(): Promise<void> {
  // Buscar todos os clientes com seus ativos
  const allClients = await db.select().from(clients);

  for (const client of allClients) {
    const clientAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.clientId, client.id));

    let segmentation = "standard";

    // Clientes com contratos recorrentes
    if (client.contractType === "recurring") {
      segmentation = "premium";
    }

    // Clientes com múltiplos ativos
    if (clientAssets.length >= 5) {
      segmentation = "enterprise";
    }

    // Clientes com ativos de alta capacidade (>60.000 BTUs)
    const hasHighCapacity = clientAssets.some((asset) => {
      const capacity = parseInt(asset.capacity || "0");
      return capacity >= 60000;
    });

    if (hasHighCapacity) {
      segmentation = "high_value";
    }

    // Atualizar segmentação do cliente
    await db
      .update(clients)
      .set({
        segmentation,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, client.id));
  }
}
