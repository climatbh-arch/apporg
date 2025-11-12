import { Router } from "express";
import { db } from "../db";
import { automatedNotifications, assets, quotes, maintenanceContracts } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";
import {
  runDailyAutomations,
  runWeeklySegmentation,
  runManualAutomation,
} from "../services/scheduledTasks";
import { processNotificationQueue } from "../services/notificationService";

const router = Router();

// GET /api/automations/stats - Estatísticas de automação
router.get("/stats", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Contar ativos que precisam de manutenção
    const maintenanceAlerts = await db
      .select()
      .from(assets)
      .where(
        and(
          eq(assets.userId, userId),
          eq(assets.status, "active")
        )
      );

    const maintenanceAlertsCount = maintenanceAlerts.filter(
      (asset) =>
        asset.nextMaintenanceDate &&
        new Date(asset.nextMaintenanceDate) <= thirtyDaysFromNow
    ).length;

    // Contar leads criados automaticamente (últimos 30 dias)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const leadsCreated = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.userId, userId),
          gte(quotes.createdAt, thirtyDaysAgo)
        )
      );

    const leadsCreatedCount = leadsCreated.filter((quote) =>
      quote.notes?.includes("Lead gerado automaticamente")
    ).length;

    // Contar notificações enviadas (últimas 24 horas)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const notificationsSent = await db
      .select()
      .from(automatedNotifications)
      .where(
        and(
          eq(automatedNotifications.userId, userId),
          eq(automatedNotifications.status, "sent"),
          gte(automatedNotifications.sentAt, twentyFourHoursAgo)
        )
      );

    // Contar contratos recorrentes ativos
    const activeContracts = await db
      .select()
      .from(maintenanceContracts)
      .where(
        and(
          eq(maintenanceContracts.userId, userId),
          eq(maintenanceContracts.status, "active")
        )
      );

    res.json({
      maintenanceAlertsCount,
      leadsCreatedCount,
      notificationsSentCount: notificationsSent.length,
      recurringInvoicesCount: activeContracts.length,
    });
  } catch (error) {
    console.error("Error fetching automation stats:", error);
    res.status(500).json({ error: "Failed to fetch automation stats" });
  }
});

// POST /api/automations/run-daily - Executar automações diárias
router.post("/run-daily", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await runDailyAutomations(userId);

    // Buscar estatísticas atualizadas
    const alerts = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, userId));

    const leadsCreated = await db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, userId));

    const recentLeads = leadsCreated.filter((quote) =>
      quote.notes?.includes("Lead gerado automaticamente")
    );

    const notificationsSent = await db
      .select()
      .from(automatedNotifications)
      .where(
        and(
          eq(automatedNotifications.userId, userId),
          eq(automatedNotifications.status, "sent")
        )
      );

    res.json({
      success: true,
      message: "Daily automations executed successfully",
      leadsCreated: recentLeads.length,
      notificationsSent: notificationsSent.length,
    });
  } catch (error) {
    console.error("Error running daily automations:", error);
    res.status(500).json({ error: "Failed to run daily automations" });
  }
});

// POST /api/automations/segment-clients - Segmentar clientes
router.post("/segment-clients", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await runWeeklySegmentation();

    res.json({
      success: true,
      message: "Client segmentation completed successfully",
    });
  } catch (error) {
    console.error("Error segmenting clients:", error);
    res.status(500).json({ error: "Failed to segment clients" });
  }
});

// GET /api/notifications - Listar notificações
router.get("/notifications", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notifications = await db
      .select()
      .from(automatedNotifications)
      .where(eq(automatedNotifications.userId, userId))
      .orderBy(automatedNotifications.createdAt)
      .limit(100);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /api/notifications/process - Processar fila de notificações
router.post("/notifications/process", async (req, res) => {
  try {
    const processed = await processNotificationQueue();

    res.json({
      success: true,
      processed,
      message: `${processed} notifications processed successfully`,
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    res.status(500).json({ error: "Failed to process notifications" });
  }
});

export default router;
