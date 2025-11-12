/**
 * Tarefas Agendadas (Cron Jobs)
 * Executa automações periódicas do sistema
 */

import {
  monitorPreventiveMaintenance,
  createMaintenanceLeads,
  sendMaintenanceNotifications,
  segmentClients,
} from "./maintenanceAutomationService";
import { processNotificationQueue } from "./notificationService";
import { generateRecurringInvoices } from "./financialAutomationService";

/**
 * Executa todas as automações diárias
 * Deve ser agendado para rodar diariamente às 8h
 */
export async function runDailyAutomations(userId: number): Promise<void> {
  console.log("Starting daily automations...");

  try {
    // 1. Monitorar ativos que precisam de manutenção preventiva
    console.log("Monitoring preventive maintenance...");
    const alerts = await monitorPreventiveMaintenance();
    console.log(`Found ${alerts.length} assets needing maintenance`);

    // 2. Criar leads automáticos de MP
    console.log("Creating maintenance leads...");
    const leadsCreated = await createMaintenanceLeads(userId);
    console.log(`Created ${leadsCreated} maintenance leads`);

    // 3. Enviar notificações de MP
    console.log("Sending maintenance notifications...");
    const notificationsSent = await sendMaintenanceNotifications(userId);
    console.log(`Sent ${notificationsSent} maintenance notifications`);

    // 4. Processar fila de notificações
    console.log("Processing notification queue...");
    const notificationsProcessed = await processNotificationQueue();
    console.log(`Processed ${notificationsProcessed} notifications`);

    // 5. Gerar faturas recorrentes
    console.log("Generating recurring invoices...");
    const invoicesGenerated = await generateRecurringInvoices();
    console.log(`Generated ${invoicesGenerated} recurring invoices`);

    console.log("Daily automations completed successfully!");
  } catch (error) {
    console.error("Error running daily automations:", error);
    throw error;
  }
}

/**
 * Executa segmentação de clientes
 * Deve ser agendado para rodar semanalmente
 */
export async function runWeeklySegmentation(): Promise<void> {
  console.log("Starting weekly client segmentation...");

  try {
    await segmentClients();
    console.log("Client segmentation completed successfully!");
  } catch (error) {
    console.error("Error running client segmentation:", error);
    throw error;
  }
}

/**
 * Processa fila de notificações
 * Deve ser agendado para rodar a cada 5 minutos
 */
export async function runNotificationProcessor(): Promise<void> {
  try {
    const processed = await processNotificationQueue();
    if (processed > 0) {
      console.log(`Processed ${processed} notifications`);
    }
  } catch (error) {
    console.error("Error processing notifications:", error);
  }
}

/**
 * Configuração de intervalos para execução automática
 */
export function setupScheduledTasks(userId: number): void {
  console.log("Setting up scheduled tasks...");

  // Processar notificações a cada 5 minutos
  setInterval(
    () => {
      runNotificationProcessor();
    },
    5 * 60 * 1000
  );

  // Executar automações diárias às 8h (verificar a cada hora)
  setInterval(
    () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() < 60) {
        runDailyAutomations(userId);
      }
    },
    60 * 60 * 1000
  );

  // Executar segmentação semanal aos domingos às 2h
  setInterval(
    () => {
      const now = new Date();
      if (now.getDay() === 0 && now.getHours() === 2 && now.getMinutes() < 60) {
        runWeeklySegmentation();
      }
    },
    60 * 60 * 1000
  );

  console.log("Scheduled tasks configured successfully!");
}

/**
 * Função auxiliar para executar manualmente as automações
 * Útil para testes e execução sob demanda
 */
export async function runManualAutomation(
  userId: number,
  taskType: "daily" | "weekly" | "notifications"
): Promise<void> {
  console.log(`Running manual automation: ${taskType}`);

  switch (taskType) {
    case "daily":
      await runDailyAutomations(userId);
      break;
    case "weekly":
      await runWeeklySegmentation();
      break;
    case "notifications":
      await runNotificationProcessor();
      break;
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
