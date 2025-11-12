/**
 * Serviço de Notificações Automatizadas
 * Gerencia envio de notificações via Email, SMS e WhatsApp
 */

import { db } from "../db";
import {
  automatedNotifications,
  workOrders,
  clients,
  technicians,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import nodemailer from "nodemailer";

// Configuração do Twilio (para WhatsApp e SMS)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Configuração do Email
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@apporg.com";

/**
 * Envia notificação por email
 */
async function sendEmail(
  to: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.warn("Email credentials not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: message,
      html: message.replace(/\n/g, "<br>"),
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Envia notificação por WhatsApp via Twilio
 */
async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.warn("Twilio WhatsApp credentials not configured");
      return false;
    }

    // Importação dinâmica do Twilio
    const twilio = await import("twilio");
    const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Formatar número para WhatsApp (deve incluir código do país)
    const formattedNumber = to.startsWith("+") ? to : `+55${to}`;

    await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`,
      body: message,
    });

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    return false;
  }
}

/**
 * Envia notificação por SMS via Twilio
 */
async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.warn("Twilio SMS credentials not configured");
      return false;
    }

    const twilio = await import("twilio");
    const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const formattedNumber = to.startsWith("+") ? to : `+55${to}`;

    await client.messages.create({
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber,
      body: message,
    });

    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}

/**
 * Processa a fila de notificações pendentes
 */
export async function processNotificationQueue(): Promise<number> {
  const pendingNotifications = await db
    .select()
    .from(automatedNotifications)
    .where(eq(automatedNotifications.status, "pending"));

  let processedCount = 0;

  for (const notification of pendingNotifications) {
    let success = false;

    try {
      switch (notification.channel) {
        case "email":
          success = await sendEmail(
            notification.recipientContact,
            notification.subject || "Notificação",
            notification.message
          );
          break;

        case "whatsapp":
          success = await sendWhatsApp(
            notification.recipientContact,
            notification.message
          );
          break;

        case "sms":
          success = await sendSMS(
            notification.recipientContact,
            notification.message
          );
          break;

        default:
          console.warn(`Unknown channel: ${notification.channel}`);
      }

      // Atualizar status da notificação
      await db
        .update(automatedNotifications)
        .set({
          status: success ? "sent" : "failed",
          sentAt: success ? new Date() : null,
          errorMessage: success ? null : "Failed to send notification",
          updatedAt: new Date(),
        })
        .where(eq(automatedNotifications.id, notification.id));

      if (success) processedCount++;
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);

      await db
        .update(automatedNotifications)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(automatedNotifications.id, notification.id));
    }
  }

  return processedCount;
}

/**
 * Envia notificação de confirmação de agendamento
 */
export async function sendSchedulingConfirmation(
  workOrderId: number
): Promise<void> {
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder || !workOrder.clientWhatsapp) return;

  const scheduledDate = workOrder.scheduledDate
    ? new Date(workOrder.scheduledDate).toLocaleDateString("pt-BR")
    : "a definir";

  const message = `Olá ${workOrder.clientName}!

Confirmamos o agendamento do seu serviço:

📋 OS: ${workOrder.workOrderNumber}
📅 Data: ${scheduledDate}
👨‍🔧 Técnico: ${workOrder.technician || "A definir"}

Você receberá uma notificação quando o técnico estiver a caminho.

Obrigado!`;

  await db.insert(automatedNotifications).values({
    userId: workOrder.userId,
    notificationType: "scheduling_confirmation",
    recipientType: "client",
    recipientId: workOrder.clientId,
    recipientContact: workOrder.clientWhatsapp,
    channel: "whatsapp",
    subject: "Confirmação de Agendamento",
    message,
    status: "pending",
    scheduledFor: new Date(),
    relatedEntityType: "workOrder",
    relatedEntityId: workOrderId,
  });
}

/**
 * Envia notificação de ETA (tempo estimado de chegada)
 */
export async function sendETANotification(
  workOrderId: number,
  estimatedMinutes: number
): Promise<void> {
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder || !workOrder.clientWhatsapp) return;

  const message = `Olá ${workOrder.clientName}!

O técnico ${workOrder.technician} está a caminho! 

⏱️ Tempo estimado de chegada: ${estimatedMinutes} minutos
📋 OS: ${workOrder.workOrderNumber}

Aguardamos você!`;

  await db.insert(automatedNotifications).values({
    userId: workOrder.userId,
    notificationType: "eta_notification",
    recipientType: "client",
    recipientId: workOrder.clientId,
    recipientContact: workOrder.clientWhatsapp,
    channel: "whatsapp",
    subject: "Técnico a Caminho",
    message,
    status: "pending",
    scheduledFor: new Date(),
    relatedEntityType: "workOrder",
    relatedEntityId: workOrderId,
  });
}

/**
 * Envia pesquisa de satisfação (NPS) 24h após conclusão
 */
export async function scheduleNPSSurvey(workOrderId: number): Promise<void> {
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder || !workOrder.clientWhatsapp) return;

  // Agendar para 24 horas depois
  const scheduledFor = new Date();
  scheduledFor.setHours(scheduledFor.getHours() + 24);

  const message = `Olá ${workOrder.clientName}!

Esperamos que o serviço realizado tenha atendido suas expectativas! 

Gostaríamos de saber sua opinião:

Em uma escala de 0 a 10, quanto você recomendaria nossos serviços?

Sua opinião é muito importante para nós! 🌟`;

  await db.insert(automatedNotifications).values({
    userId: workOrder.userId,
    notificationType: "nps_survey",
    recipientType: "client",
    recipientId: workOrder.clientId,
    recipientContact: workOrder.clientWhatsapp,
    channel: "whatsapp",
    subject: "Pesquisa de Satisfação",
    message,
    status: "pending",
    scheduledFor,
    relatedEntityType: "workOrder",
    relatedEntityId: workOrderId,
  });
}

/**
 * Notifica técnico sobre nova OS atribuída
 */
export async function notifyTechnicianAssignment(
  workOrderId: number
): Promise<void> {
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder || !workOrder.technicianId) return;

  const [technician] = await db
    .select()
    .from(technicians)
    .where(eq(technicians.id, workOrder.technicianId));

  if (!technician || !technician.phone) return;

  const scheduledDate = workOrder.scheduledDate
    ? new Date(workOrder.scheduledDate).toLocaleDateString("pt-BR")
    : "a definir";

  const message = `Nova OS atribuída!

📋 OS: ${workOrder.workOrderNumber}
👤 Cliente: ${workOrder.clientName}
📅 Data: ${scheduledDate}
📍 Endereço: ${workOrder.notes || "Ver sistema"}

Acesse o app para mais detalhes.`;

  await db.insert(automatedNotifications).values({
    userId: workOrder.userId,
    notificationType: "technician_assignment",
    recipientType: "technician",
    recipientId: technician.id,
    recipientContact: technician.phone,
    channel: "sms",
    subject: "Nova OS Atribuída",
    message,
    status: "pending",
    scheduledFor: new Date(),
    relatedEntityType: "workOrder",
    relatedEntityId: workOrderId,
  });
}
