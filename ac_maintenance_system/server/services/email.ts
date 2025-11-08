import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || emailUser;

let transporter: nodemailer.Transporter | null = null;

function getEmailTransporter() {
  if (!emailUser || !emailPassword) {
    console.warn('[Email] Credentials not configured');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      return {
        success: false,
        error: 'Email não está configurado. Configure as variáveis de ambiente.',
      };
    }

    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar email',
    };
  }
}

export function getWorkOrderEmailTemplate(
  workOrderId: number,
  clientName: string,
  serviceType: string,
  value: number,
  description: string,
  technician?: string
): string {
  const serviceTypeLabel = {
    installation: 'Instalação',
    maintenance: 'Manutenção',
    gas_charge: 'Carga de Gás',
    cleaning: 'Limpeza',
    repair: 'Reparo',
    inspection: 'Inspeção',
  }[serviceType] || serviceType;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
          .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Confirmação de Orçamento/Ordem de Serviço</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            
            <p>Seu orçamento foi criado com sucesso em nosso sistema!</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">OS Nº:</span>
                <span>#${workOrderId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tipo de Serviço:</span>
                <span>${serviceTypeLabel}</span>
              </div>
              <div class="detail-row">
                <span class="label">Valor:</span>
                <span>R$ ${value.toFixed(2)}</span>
              </div>
              ${technician ? `
              <div class="detail-row">
                <span class="label">Técnico Responsável:</span>
                <span>${technician}</span>
              </div>
              ` : ''}
            </div>
            
            <h3>Descrição do Serviço:</h3>
            <p>${description}</p>
            
            <p>Entraremos em contato em breve para confirmar os detalhes e agendar a execução do serviço.</p>
            
            <p>Obrigado pela confiança!</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getMaintenanceReminderEmailTemplate(
  clientName: string,
  equipmentBrand: string,
  equipmentModel: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
          .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Lembrete de Manutenção</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            
            <p>Gostaríamos de lembrá-lo que é hora de realizar a manutenção preventiva do seu equipamento de ar condicionado!</p>
            
            <div class="alert">
              <strong>Equipamento:</strong> ${equipmentBrand} ${equipmentModel}
            </div>
            
            <p>A manutenção regular é essencial para:</p>
            <ul>
              <li>Garantir o funcionamento eficiente do equipamento</li>
              <li>Prolongar a vida útil do ar condicionado</li>
              <li>Reduzir consumo de energia</li>
              <li>Evitar problemas futuros</li>
            </ul>
            
            <p>Entre em contato conosco para agendar sua manutenção!</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
