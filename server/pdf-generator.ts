import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface WorkOrderData {
  id: number;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  equipmentBrand: string;
  equipmentModel: string;
  serviceType: string;
  description: string;
  value: number;
  status: string;
  createdAt: Date;
  technician?: string;
}

export async function generateWorkOrderPDF(workOrder: WorkOrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      buffers.push(chunk);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('ORÇAMENTO / ORDEM DE SERVIÇO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`OS #${workOrder.id}`, { align: 'center' });
    doc.moveDown(1);

    // Client Information
    doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO CLIENTE');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${workOrder.clientName}`);
    doc.text(`Telefone: ${workOrder.clientPhone}`);
    doc.text(`Endereço: ${workOrder.clientAddress}`);
    doc.moveDown(1);

    // Equipment Information
    doc.fontSize(12).font('Helvetica-Bold').text('EQUIPAMENTO');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Marca: ${workOrder.equipmentBrand}`);
    doc.text(`Modelo: ${workOrder.equipmentModel}`);
    doc.moveDown(1);

    // Service Information
    doc.fontSize(12).font('Helvetica-Bold').text('SERVIÇO');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Tipo: ${workOrder.serviceType}`);
    doc.text(`Descrição: ${workOrder.description}`);
    doc.moveDown(1);

    // Value and Status
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMAÇÕES FINANCEIRAS');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Valor: R$ ${workOrder.value.toFixed(2)}`);
    doc.text(`Status: ${workOrder.status}`);
    doc.moveDown(1);

    // Date
    doc.fontSize(10).font('Helvetica');
    doc.text(`Data: ${new Date(workOrder.createdAt).toLocaleDateString('pt-BR')}`);
    if (workOrder.technician) {
      doc.text(`Técnico Responsável: ${workOrder.technician}`);
    }
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).font('Helvetica').text('Este documento é válido como comprovante de orçamento/ordem de serviço.', {
      align: 'center',
    });
    doc.text('Gerado automaticamente pelo Sistema de Controle de Manutenção de AC', {
      align: 'center',
    });

    doc.end();
  });
}
