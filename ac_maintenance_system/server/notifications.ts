import { ENV } from "./_core/env";

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: "quote" | "schedule" | "reminder" | "confirmation";
}

interface SMSNotification {
  phone: string;
  message: string;
  type: "schedule" | "reminder" | "confirmation";
}

interface WhatsAppNotification {
  phone: string;
  message: string;
  type: "quote" | "schedule" | "reminder" | "confirmation";
}

/**
 * Enviar notificação por email
 * Em produção, integrar com serviço de email (SendGrid, Mailgun, etc.)
 */
export async function sendEmailNotification(notification: EmailNotification) {
  try {
    // Mock: Em produção, usar API de email
    console.log("📧 Email enviado:", {
      to: notification.to,
      subject: notification.subject,
      type: notification.type,
    });

    // Exemplo de integração com SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(ENV.sendgridApiKey);
    // await sgMail.send({
    //   to: notification.to,
    //   from: 'noreply@acmaintenance.com',
    //   subject: notification.subject,
    //   html: notification.body,
    // });

    return { success: true, messageId: `email-${Date.now()}` };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}

/**
 * Enviar notificação por SMS
 * Em produção, integrar com Twilio
 */
export async function sendSMSNotification(notification: SMSNotification) {
  try {
    // Mock: Em produção, usar Twilio
    console.log("📱 SMS enviado:", {
      phone: notification.phone,
      message: notification.message,
      type: notification.type,
    });

    // Exemplo de integração com Twilio:
    // const twilio = require('twilio')(ENV.twilioAccountSid, ENV.twilioAuthToken);
    // const message = await twilio.messages.create({
    //   body: notification.message,
    //   from: ENV.twilioPhoneNumber,
    //   to: notification.phone,
    // });

    return { success: true, messageId: `sms-${Date.now()}` };
  } catch (error) {
    console.error("Erro ao enviar SMS:", error);
    throw error;
  }
}

/**
 * Enviar notificação por WhatsApp
 * Em produção, integrar com Twilio WhatsApp API
 */
export async function sendWhatsAppNotification(notification: WhatsAppNotification) {
  try {
    // Mock: Em produção, usar Twilio WhatsApp
    console.log("💬 WhatsApp enviado:", {
      phone: notification.phone,
      message: notification.message,
      type: notification.type,
    });

    // Exemplo de integração com Twilio WhatsApp:
    // const twilio = require('twilio')(ENV.twilioAccountSid, ENV.twilioAuthToken);
    // const message = await twilio.messages.create({
    //   body: notification.message,
    //   from: `whatsapp:${ENV.twilioWhatsAppNumber}`,
    //   to: `whatsapp:${notification.phone}`,
    // });

    return { success: true, messageId: `whatsapp-${Date.now()}` };
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error);
    throw error;
  }
}

/**
 * Templates de email
 */
export const emailTemplates = {
  quoteApproval: (clientName: string, quoteId: number, total: number) => ({
    subject: `Orçamento #${quoteId} - AC Maintenance`,
    body: `
      <h2>Olá ${clientName},</h2>
      <p>Seu orçamento foi criado com sucesso!</p>
      <p><strong>Orçamento #${quoteId}</strong></p>
      <p><strong>Valor Total:</strong> R$ ${total.toFixed(2)}</p>
      <p>Clique no link abaixo para visualizar e aprovar o orçamento:</p>
      <a href="https://acmaintenance.com/quotes/${quoteId}">Ver Orçamento</a>
      <p>Atenciosamente,<br/>AC Maintenance</p>
    `,
  }),

  scheduleConfirmation: (clientName: string, date: string, time: string) => ({
    subject: `Agendamento Confirmado - AC Maintenance`,
    body: `
      <h2>Olá ${clientName},</h2>
      <p>Seu agendamento foi confirmado!</p>
      <p><strong>Data:</strong> ${new Date(date).toLocaleDateString("pt-BR")}</p>
      <p><strong>Horário:</strong> ${time}</p>
      <p>Nosso técnico chegará no horário marcado.</p>
      <p>Atenciosamente,<br/>AC Maintenance</p>
    `,
  }),

  maintenanceReminder: (clientName: string, date: string) => ({
    subject: `Lembrete de Manutenção - AC Maintenance`,
    body: `
      <h2>Olá ${clientName},</h2>
      <p>Lembrete: Sua manutenção preventiva está agendada para:</p>
      <p><strong>${new Date(date).toLocaleDateString("pt-BR")}</strong></p>
      <p>Confirme sua disponibilidade respondendo este email.</p>
      <p>Atenciosamente,<br/>AC Maintenance</p>
    `,
  }),

  workOrderCompletion: (clientName: string, orderId: number, total: number) => ({
    subject: `Ordem de Serviço #${orderId} Finalizada`,
    body: `
      <h2>Olá ${clientName},</h2>
      <p>Sua ordem de serviço foi finalizada com sucesso!</p>
      <p><strong>Ordem #${orderId}</strong></p>
      <p><strong>Valor:</strong> R$ ${total.toFixed(2)}</p>
      <p>Obrigado por confiar em nossos serviços!</p>
      <p>Atenciosamente,<br/>AC Maintenance</p>
    `,
  }),
};

/**
 * Templates de SMS
 */
export const smsTemplates = {
  scheduleConfirmation: (date: string, time: string) =>
    `Seu agendamento foi confirmado para ${new Date(date).toLocaleDateString("pt-BR")} às ${time}. Obrigado!`,

  maintenanceReminder: (date: string) =>
    `Lembrete: Sua manutenção está agendada para ${new Date(date).toLocaleDateString("pt-BR")}. Confirme sua disponibilidade.`,

  workOrderCompletion: (orderId: number) =>
    `Sua ordem de serviço #${orderId} foi finalizada! Obrigado por usar nossos serviços.`,
};

/**
 * Notificar cliente sobre orçamento
 */
export async function notifyQuoteCreated(
  clientEmail: string,
  clientName: string,
  quoteId: number,
  total: number
) {
  const template = emailTemplates.quoteApproval(clientName, quoteId, total);
  return sendEmailNotification({
    to: clientEmail,
    subject: template.subject,
    body: template.body,
    type: "quote",
  });
}

/**
 * Notificar cliente sobre agendamento
 */
export async function notifyScheduleConfirmation(
  clientEmail: string,
  clientPhone: string,
  clientName: string,
  date: string,
  time: string,
  useWhatsApp: boolean = false
) {
  const emailTemplate = emailTemplates.scheduleConfirmation(clientName, date, time);
  const smsMessage = smsTemplates.scheduleConfirmation(date, time);

  await sendEmailNotification({
    to: clientEmail,
    subject: emailTemplate.subject,
    body: emailTemplate.body,
    type: "schedule",
  });

  if (useWhatsApp) {
    await sendWhatsAppNotification({
      phone: clientPhone,
      message: smsMessage,
      type: "schedule",
    });
  } else {
    await sendSMSNotification({
      phone: clientPhone,
      message: smsMessage,
      type: "schedule",
    });
  }
}

/**
 * Notificar cliente sobre conclusão de ordem
 */
export async function notifyWorkOrderCompletion(
  clientEmail: string,
  clientName: string,
  orderId: number,
  total: number
) {
  const template = emailTemplates.workOrderCompletion(clientName, orderId, total);
  return sendEmailNotification({
    to: clientEmail,
    subject: template.subject,
    body: template.body,
    type: "confirmation",
  });
}
