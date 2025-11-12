/**
 * Serviço de Automação Financeira
 * Implementa faturamento automatizado e integração com sistemas fiscais
 */

import { db } from "../db";
import {
  workOrders,
  workOrderItems,
  payments,
  products,
  maintenanceContracts,
} from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";

interface InvoiceData {
  workOrderId: number;
  workOrderNumber: string;
  clientId: number;
  clientName: string;
  laborTotal: number;
  materialsTotal: number;
  totalValue: number;
  items: InvoiceItem[];
}

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: "labor" | "material" | "service";
}

/**
 * Gera fatura preliminar automaticamente após conclusão da OS
 */
export async function generateDraftInvoice(
  workOrderId: number
): Promise<InvoiceData | null> {
  // Buscar a OS
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder) {
    throw new Error("Ordem de serviço não encontrada");
  }

  // Verificar se a OS está concluída e tem assinatura
  if (
    workOrder.status !== "completed" ||
    !workOrder.clientSignature ||
    !workOrder.checkOutTime
  ) {
    return null;
  }

  // Buscar itens da OS
  const items = await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, workOrderId));

  // Calcular totais
  let laborTotal = parseFloat(workOrder.laborTotal || "0");
  let materialsTotal = 0;

  const invoiceItems: InvoiceItem[] = [];

  // Adicionar mão de obra
  if (laborTotal > 0) {
    invoiceItems.push({
      name: "Mão de Obra",
      quantity: parseFloat(workOrder.laborHours || "1"),
      unitPrice: parseFloat(workOrder.laborCostPerHour || "0"),
      totalPrice: laborTotal,
      type: "labor",
    });
  }

  // Adicionar materiais
  for (const item of items) {
    const itemTotal = parseFloat(item.totalPrice);
    materialsTotal += itemTotal;

    invoiceItems.push({
      name: item.itemName,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      totalPrice: itemTotal,
      type: item.itemType === "material" ? "material" : "service",
    });
  }

  const totalValue = laborTotal + materialsTotal;

  // Atualizar totais na OS
  await db
    .update(workOrders)
    .set({
      materialsTotal: materialsTotal.toFixed(2),
      totalValue: totalValue.toFixed(2),
      status: "ready_for_billing",
      updatedAt: new Date(),
    })
    .where(eq(workOrders.id, workOrderId));

  return {
    workOrderId,
    workOrderNumber: workOrder.workOrderNumber,
    clientId: workOrder.clientId,
    clientName: workOrder.clientName,
    laborTotal,
    materialsTotal,
    totalValue,
    items: invoiceItems,
  };
}

/**
 * Cria registro de pagamento automaticamente
 */
export async function createPaymentFromInvoice(
  invoiceData: InvoiceData,
  userId: number,
  dueDate?: Date
): Promise<number> {
  const paymentDueDate = dueDate || new Date();
  if (!dueDate) {
    paymentDueDate.setDate(paymentDueDate.getDate() + 30); // 30 dias padrão
  }

  const [payment] = await db
    .insert(payments)
    .values({
      userId,
      workOrderId: invoiceData.workOrderId,
      clientId: invoiceData.clientId,
      clientName: invoiceData.clientName,
      amount: invoiceData.totalValue.toFixed(2),
      paymentMethod: "to_define",
      status: "pending",
      dueDate: paymentDueDate,
      notes: `Fatura gerada automaticamente para OS ${invoiceData.workOrderNumber}`,
    })
    .returning();

  return payment.id;
}

/**
 * Processa baixa automática de estoque
 */
export async function processStockDeduction(workOrderId: number): Promise<void> {
  // Buscar itens da OS
  const items = await db
    .select()
    .from(workOrderItems)
    .where(
      and(
        eq(workOrderItems.workOrderId, workOrderId),
        eq(workOrderItems.itemType, "material")
      )
    );

  for (const item of items) {
    // Buscar produto no estoque pelo nome
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.name, item.itemName));

    if (product) {
      const currentStock = product.stock || 0;
      const quantityUsed = parseFloat(item.quantity);
      const newStock = Math.max(0, currentStock - quantityUsed);

      // Atualizar estoque
      await db
        .update(products)
        .set({
          stock: newStock,
          updatedAt: new Date(),
        })
        .where(eq(products.id, product.id));

      console.log(
        `Stock updated for ${product.name}: ${currentStock} -> ${newStock}`
      );
    }
  }
}

/**
 * Processa faturamento completo (invoice + payment + stock)
 */
export async function processCompleteBilling(
  workOrderId: number,
  userId: number
): Promise<{
  invoice: InvoiceData | null;
  paymentId: number | null;
  stockProcessed: boolean;
}> {
  try {
    // 1. Gerar fatura
    const invoice = await generateDraftInvoice(workOrderId);

    if (!invoice) {
      return {
        invoice: null,
        paymentId: null,
        stockProcessed: false,
      };
    }

    // 2. Criar pagamento
    const paymentId = await createPaymentFromInvoice(invoice, userId);

    // 3. Processar baixa de estoque
    await processStockDeduction(workOrderId);

    return {
      invoice,
      paymentId,
      stockProcessed: true,
    };
  } catch (error) {
    console.error("Error processing billing:", error);
    throw error;
  }
}

/**
 * Gera faturas recorrentes para contratos de manutenção
 */
export async function generateRecurringInvoices(): Promise<number> {
  const today = new Date();

  // Buscar contratos ativos que precisam de faturamento
  const activeContracts = await db
    .select()
    .from(maintenanceContracts)
    .where(eq(maintenanceContracts.status, "active"));

  let generatedCount = 0;

  for (const contract of activeContracts) {
    // Verificar se já existe pagamento pendente para este contrato
    const existingPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.clientId, contract.clientId),
          eq(payments.status, "pending")
        )
      );

    // Se já existe pagamento pendente, não gerar outro
    if (existingPayments.length > 0) continue;

    // Calcular próxima data de vencimento baseado na frequência
    let dueDate = new Date(today);
    switch (contract.frequency) {
      case "monthly":
        dueDate.setMonth(dueDate.getMonth() + 1);
        break;
      case "quarterly":
        dueDate.setMonth(dueDate.getMonth() + 3);
        break;
      case "semiannual":
        dueDate.setMonth(dueDate.getMonth() + 6);
        break;
      case "annual":
        dueDate.setFullYear(dueDate.getFullYear() + 1);
        break;
      default:
        dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Criar pagamento recorrente
    await db.insert(payments).values({
      userId: contract.userId,
      clientId: contract.clientId,
      clientName: "", // TODO: Buscar nome do cliente
      amount: contract.value,
      paymentMethod: "recurring",
      status: "pending",
      dueDate,
      notes: `Fatura recorrente - Contrato ${contract.contractNumber} (${contract.frequency})`,
    });

    generatedCount++;
  }

  return generatedCount;
}

/**
 * Integração com sistema de Nota Fiscal (Mock)
 * Em produção, integrar com API de NF-e/NFS-e
 */
export async function issueElectronicInvoice(
  invoiceData: InvoiceData
): Promise<{
  success: boolean;
  invoiceNumber?: string;
  accessKey?: string;
  error?: string;
}> {
  try {
    // TODO: Implementar integração real com API de NF-e/NFS-e
    // Exemplos: Focus NFe, eNotas, Bling, etc.

    console.log("Issuing electronic invoice for:", invoiceData);

    // Mock: Simular emissão de nota fiscal
    const mockInvoiceNumber = `NFe-${Date.now()}`;
    const mockAccessKey = `${Date.now()}${Math.random()
      .toString(36)
      .substring(7)}`;

    // Em produção, fazer chamada à API:
    /*
    const response = await fetch('https://api.nfe-provider.com/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NFE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: {
          name: invoiceData.clientName,
          // ... outros dados do cliente
        },
        items: invoiceData.items,
        total: invoiceData.totalValue
      })
    });
    
    const data = await response.json();
    return {
      success: true,
      invoiceNumber: data.number,
      accessKey: data.accessKey
    };
    */

    return {
      success: true,
      invoiceNumber: mockInvoiceNumber,
      accessKey: mockAccessKey,
    };
  } catch (error) {
    console.error("Error issuing electronic invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Integração com ERP/Sistema Contábil (Mock)
 * Em produção, integrar com SAP, TOTVS, etc.
 */
export async function syncWithERP(paymentId: number): Promise<boolean> {
  try {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    // TODO: Implementar integração real com ERP
    console.log("Syncing payment with ERP:", payment);

    // Mock: Simular sincronização
    /*
    const response = await fetch('https://api.erp-system.com/accounts-receivable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ERP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: payment.clientId,
        amount: payment.amount,
        due_date: payment.dueDate,
        reference: payment.workOrderId
      })
    });
    
    return response.ok;
    */

    return true;
  } catch (error) {
    console.error("Error syncing with ERP:", error);
    return false;
  }
}
