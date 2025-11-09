import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { Readable } from 'stream';

// Configurações (usar variáveis de ambiente em produção)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@system.com';

// ============ PDF GENERATION ============
export async function generateQuotePDF(quote: any, items: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('ORÇAMENTO', 50, 50);
    doc.fontSize(10).font('Helvetica').text(`Nº: ${quote.quoteNumber}`, 50, 80);
    doc.text(`Data: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, 50, 95);

    // Client Info
    doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', 50, 130);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${quote.clientName}`, 50, 150);
    if (quote.clientEmail) doc.text(`E-mail: ${quote.clientEmail}`, 50, 165);
    if (quote.clientPhone) doc.text(`Telefone: ${quote.clientPhone}`, 50, 180);

    // Service Description
    doc.fontSize(12).font('Helvetica-Bold').text('Descrição do Serviço:', 50, 220);
    doc.fontSize(10).font('Helvetica').text(quote.serviceDescription || 'N/A', 50, 240, { width: 500 });

    // Items Table
    const tableTop = 320;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qtd', 250, tableTop);
    doc.text('Valor Unit.', 320, tableTop);
    doc.text('Total', 420, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9);
    items.forEach((item: any) => {
      doc.text(item.itemName, 50, y, { width: 190 });
      doc.text(item.quantity, 250, y);
      doc.text(`R$ ${parseFloat(item.unitPrice).toFixed(2)}`, 320, y);
      doc.text(`R$ ${parseFloat(item.totalPrice).toFixed(2)}`, 420, y);
      y += 20;
    });

    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 15;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Subtotal:', 350, y);
    doc.text(`R$ ${parseFloat(quote.subtotal).toFixed(2)}`, 450, y);

    y += 20;
    doc.text('Desconto:', 350, y);
    doc.text(`R$ ${parseFloat(quote.discountAmount).toFixed(2)}`, 450, y);

    y += 20;
    doc.fontSize(12).text('TOTAL:', 350, y);
    doc.text(`R$ ${parseFloat(quote.totalValue).toFixed(2)}`, 450, y);

    // Footer
    doc.fontSize(8).font('Helvetica').text('Validade: ' + (quote.validityDate ? new Date(quote.validityDate).toLocaleDateString('pt-BR') : 'Conforme acordado'), 50, 700);

    doc.end();
  });
}

export async function generateWorkOrderPDF(workOrder: any, items: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('ORDEM DE SERVIÇO', 50, 50);
    doc.fontSize(10).font('Helvetica').text(`Nº: ${workOrder.workOrderNumber}`, 50, 80);
    doc.text(`Data: ${new Date(workOrder.createdAt).toLocaleDateString('pt-BR')}`, 50, 95);

    // Client Info
    doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', 50, 130);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${workOrder.clientName}`, 50, 150);
    if (workOrder.clientEmail) doc.text(`E-mail: ${workOrder.clientEmail}`, 50, 165);
    if (workOrder.clientPhone) doc.text(`Telefone: ${workOrder.clientPhone}`, 50, 180);

    // Technician
    doc.fontSize(12).font('Helvetica-Bold').text('Técnico Responsável:', 50, 220);
    doc.fontSize(10).font('Helvetica').text(workOrder.technician || 'N/A', 50, 240);

    // Service Description
    doc.fontSize(12).font('Helvetica-Bold').text('Descrição do Serviço:', 50, 270);
    doc.fontSize(10).font('Helvetica').text(workOrder.serviceDescription || 'N/A', 50, 290, { width: 500 });

    // Items Table
    const tableTop = 370;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Tipo', 200, tableTop);
    doc.text('Qtd', 280, tableTop);
    doc.text('Valor Unit.', 330, tableTop);
    doc.text('Total', 450, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9);
    items.forEach((item: any) => {
      doc.text(item.itemName, 50, y, { width: 140 });
      doc.text(item.itemType, 200, y);
      doc.text(item.quantity, 280, y);
      doc.text(`R$ ${parseFloat(item.unitPrice).toFixed(2)}`, 330, y);
      doc.text(`R$ ${parseFloat(item.totalPrice).toFixed(2)}`, 450, y);
      y += 20;
    });

    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 15;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Mão de Obra:', 350, y);
    doc.text(`R$ ${parseFloat(workOrder.laborTotal).toFixed(2)}`, 450, y);

    y += 20;
    doc.text('Materiais:', 350, y);
    doc.text(`R$ ${parseFloat(workOrder.materialsTotal).toFixed(2)}`, 450, y);

    y += 20;
    doc.fontSize(12).text('TOTAL:', 350, y);
    doc.text(`R$ ${parseFloat(workOrder.totalValue).toFixed(2)}`, 450, y);

    // Status
    y += 40;
    doc.fontSize(10).font('Helvetica-Bold').text(`Status: ${workOrder.status}`, 50, y);

    doc.end();
  });
}

// ============ EMAIL SENDING ============
export async function sendEmailWithPDF(
  to: string,
  subject: string,
  htmlContent: string,
  pdfBuffer: Buffer,
  pdfFilename: string
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

// ============ WHATSAPP SENDING ============
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn('Twilio não configurado');
      return false;
    }

    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_PHONE}`,
      to: `whatsapp:${phoneNumber}`,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

// ============ TEMPLATE BUILDERS ============
export function buildQuoteEmailTemplate(quote: any): string {
  return `
    <h2>Orçamento #${quote.quoteNumber}</h2>
    <p>Prezado(a) ${quote.clientName},</p>
    <p>Segue em anexo o orçamento solicitado.</p>
    <p><strong>Detalhes do Orçamento:</strong></p>
    <ul>
      <li>Número: ${quote.quoteNumber}</li>
      <li>Data: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}</li>
      <li>Valor Total: R$ ${parseFloat(quote.totalValue).toFixed(2)}</li>
      <li>Status: ${quote.status}</li>
    </ul>
    <p>Qualquer dúvida, entre em contato conosco.</p>
    <p>Atenciosamente,<br/>Equipe de Orçamentos</p>
  `;
}

export function buildWorkOrderEmailTemplate(workOrder: any): string {
  return `
    <h2>Ordem de Serviço #${workOrder.workOrderNumber}</h2>
    <p>Prezado(a) ${workOrder.clientName},</p>
    <p>Segue em anexo a ordem de serviço para o trabalho solicitado.</p>
    <p><strong>Detalhes da Ordem:</strong></p>
    <ul>
      <li>Número: ${workOrder.workOrderNumber}</li>
      <li>Data: ${new Date(workOrder.createdAt).toLocaleDateString('pt-BR')}</li>
      <li>Técnico: ${workOrder.technician}</li>
      <li>Valor Total: R$ ${parseFloat(workOrder.totalValue).toFixed(2)}</li>
      <li>Status: ${workOrder.status}</li>
    </ul>
    <p>Qualquer dúvida, entre em contato conosco.</p>
    <p>Atenciosamente,<br/>Equipe de Serviços</p>
  `;
}

export function buildWhatsAppQuoteMessage(quote: any): string {
  return `Olá ${quote.clientName}! 👋\n\nSegue seu orçamento #${quote.quoteNumber}\n\n💰 Valor Total: R$ ${parseFloat(quote.totalValue).toFixed(2)}\n📅 Validade: ${quote.validityDate ? new Date(quote.validityDate).toLocaleDateString('pt-BR') : 'Conforme acordado'}\n\nPDF em anexo com todos os detalhes.\n\nQualquer dúvida, estamos à disposição! 😊`;
}

export function buildWhatsAppWorkOrderMessage(workOrder: any): string {
  return `Olá ${workOrder.clientName}! 👋\n\nSua Ordem de Serviço #${workOrder.workOrderNumber} foi criada!\n\n🔧 Técnico: ${workOrder.technician}\n💰 Valor Total: R$ ${parseFloat(workOrder.totalValue).toFixed(2)}\n📅 Data: ${new Date(workOrder.createdAt).toLocaleDateString('pt-BR')}\n\nPDF em anexo com todos os detalhes.\n\nQualquer dúvida, estamos à disposição! 😊`;
}
