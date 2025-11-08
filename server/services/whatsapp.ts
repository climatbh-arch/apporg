import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    console.warn('[Twilio] Credentials not configured');
    return null;
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }

  return client;
}

export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient();
    if (!client || !twilioPhoneNumber) {
      return {
        success: false,
        error: 'Twilio não está configurado. Configure as variáveis de ambiente.',
      };
    }

    // Formatar número de telefone para WhatsApp (adicionar +55 se necessário)
    let formattedPhone = toPhoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    const message_obj = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:+${formattedPhone}`,
    });

    return {
      success: true,
      messageId: message_obj.sid,
    };
  } catch (error: any) {
    console.error('[Twilio] Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar mensagem WhatsApp',
    };
  }
}

export function formatWorkOrderMessage(
  workOrderId: number,
  clientName: string,
  serviceType: string,
  value: number
): string {
  const serviceTypeLabel = {
    installation: 'Instalação',
    maintenance: 'Manutenção',
    gas_charge: 'Carga de Gás',
    cleaning: 'Limpeza',
    repair: 'Reparo',
    inspection: 'Inspeção',
  }[serviceType] || serviceType;

  return `Olá ${clientName}! 👋

Seu orçamento foi criado com sucesso!

📋 *Detalhes do Orçamento:*
• OS #${workOrderId}
• Serviço: ${serviceTypeLabel}
• Valor: R$ ${value.toFixed(2)}

Para mais informações, acesse nosso sistema.

Obrigado! 🙏`;
}
