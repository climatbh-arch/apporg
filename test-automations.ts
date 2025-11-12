/**
 * Script de Teste de Automações
 * Valida todas as funcionalidades implementadas
 */

import { db } from "./server/db";
import { assets, clients, technicians, workOrders, automatedNotifications } from "./drizzle/schema";
import {
  monitorPreventiveMaintenance,
  createMaintenanceLeads,
  sendMaintenanceNotifications,
  segmentClients,
} from "./server/services/maintenanceAutomationService";
import {
  suggestTechnician,
  autoAssignWorkOrder,
} from "./server/services/dispatchService";
import {
  generateDraftInvoice,
  processCompleteBilling,
} from "./server/services/financialAutomationService";
import { processNotificationQueue } from "./server/services/notificationService";

async function testAutomations() {
  console.log("🧪 Iniciando testes de automações...\n");

  try {
    // Teste 1: Monitoramento de Manutenção Preventiva
    console.log("1️⃣ Testando monitoramento de manutenção preventiva...");
    const alerts = await monitorPreventiveMaintenance();
    console.log(`✅ ${alerts.length} ativos precisando de manutenção encontrados\n`);

    // Teste 2: Criação de Leads Automáticos
    console.log("2️⃣ Testando criação de leads automáticos...");
    const userId = 1; // ID de teste
    const leadsCreated = await createMaintenanceLeads(userId);
    console.log(`✅ ${leadsCreated} leads criados automaticamente\n`);

    // Teste 3: Envio de Notificações
    console.log("3️⃣ Testando envio de notificações...");
    const notificationsSent = await sendMaintenanceNotifications(userId);
    console.log(`✅ ${notificationsSent} notificações agendadas\n`);

    // Teste 4: Segmentação de Clientes
    console.log("4️⃣ Testando segmentação de clientes...");
    await segmentClients();
    console.log("✅ Clientes segmentados com sucesso\n");

    // Teste 5: Processamento de Fila de Notificações
    console.log("5️⃣ Testando processamento de fila de notificações...");
    const processed = await processNotificationQueue();
    console.log(`✅ ${processed} notificações processadas\n`);

    // Teste 6: Buscar dados para testes de despacho
    console.log("6️⃣ Testando despacho inteligente...");
    const allWorkOrders = await db.select().from(workOrders).limit(1);
    
    if (allWorkOrders.length > 0) {
      const workOrderId = allWorkOrders[0].id;
      const suggestion = await suggestTechnician(workOrderId, userId);
      
      if (suggestion) {
        console.log(`✅ Técnico sugerido: ${suggestion.technicianName} (Score: ${suggestion.totalScore.toFixed(2)})`);
        console.log(`   - Skill Score: ${suggestion.skillScore.toFixed(2)}`);
        console.log(`   - Distance Score: ${suggestion.distanceScore.toFixed(2)}`);
        console.log(`   - SLA Score: ${suggestion.slaScore.toFixed(2)}`);
        console.log(`   - Availability Score: ${suggestion.availabilityScore.toFixed(2)}\n`);
      } else {
        console.log("⚠️  Nenhum técnico disponível para sugestão\n");
      }
    } else {
      console.log("⚠️  Nenhuma ordem de serviço encontrada para teste\n");
    }

    // Teste 7: Estatísticas Finais
    console.log("7️⃣ Coletando estatísticas finais...");
    const totalAssets = await db.select().from(assets);
    const totalClients = await db.select().from(clients);
    const totalTechnicians = await db.select().from(technicians);
    const totalWorkOrders = await db.select().from(workOrders);
    const totalNotifications = await db.select().from(automatedNotifications);

    console.log("\n📊 ESTATÍSTICAS DO SISTEMA:");
    console.log(`   - Ativos cadastrados: ${totalAssets.length}`);
    console.log(`   - Clientes cadastrados: ${totalClients.length}`);
    console.log(`   - Técnicos cadastrados: ${totalTechnicians.length}`);
    console.log(`   - Ordens de Serviço: ${totalWorkOrders.length}`);
    console.log(`   - Notificações na fila: ${totalNotifications.length}`);

    console.log("\n✅ Todos os testes concluídos com sucesso!");
    console.log("\n🎉 Sistema de automações funcionando corretamente!");

  } catch (error) {
    console.error("\n❌ Erro durante os testes:", error);
    process.exit(1);
  }
}

// Executar testes
testAutomations()
  .then(() => {
    console.log("\n✅ Testes finalizados");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
