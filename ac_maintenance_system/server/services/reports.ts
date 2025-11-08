import ExcelJS from 'exceljs';
import { getDb } from '../db';

interface ReportData {
  startDate: Date;
  endDate: Date;
}

export async function generateMonthlyReportExcel(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const db = await getDb();

  if (!db) {
    throw new Error('Database not available');
  }

  // Buscar dados do período (simplificado sem query builder complexo)
  const transactions: any[] = [];
  const workOrders: any[] = [];

  // Sheet 1: Resumo Financeiro
  const summarySheet = workbook.addWorksheet('Resumo Financeiro');
  summarySheet.columns = [
    { header: 'Métrica', key: 'metric', width: 30 },
    { header: 'Valor', key: 'value', width: 20 },
  ];

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const profit = totalIncome - totalExpense;

  summarySheet.addRows([
    { metric: 'Total de Entradas', value: `R$ ${totalIncome.toFixed(2)}` },
    { metric: 'Total de Saídas', value: `R$ ${totalExpense.toFixed(2)}` },
    { metric: 'Lucro Líquido', value: `R$ ${profit.toFixed(2)}` },
    { metric: 'Total de OS', value: workOrders.length },
    { metric: 'OS Finalizadas', value: workOrders.filter((w: any) => w.status === 'completed').length },
    { metric: 'OS Pendentes', value: workOrders.filter((w: any) => w.status === 'pending').length },
  ]);

  // Sheet 2: Transações Detalhadas
  const transactionsSheet = workbook.addWorksheet('Transações');
  transactionsSheet.columns = [
    { header: 'Data', key: 'date', width: 12 },
    { header: 'Tipo', key: 'type', width: 12 },
    { header: 'Descrição', key: 'description', width: 30 },
    { header: 'Valor', key: 'amount', width: 15 },
    { header: 'Categoria', key: 'category', width: 15 },
  ];

  const transactionRows = transactions.map((t: any) => ({
    date: new Date(t.createdAt).toLocaleDateString('pt-BR'),
    type: t.type === 'income' ? 'Entrada' : 'Saída',
    description: t.description,
    amount: `R$ ${Number(t.amount).toFixed(2)}`,
    category: t.category,
  }));

  transactionsSheet.addRows(transactionRows);

  // Sheet 3: Ordens de Serviço
  const workOrdersSheet = workbook.addWorksheet('Ordens de Serviço');
  workOrdersSheet.columns = [
    { header: 'OS Nº', key: 'id', width: 10 },
    { header: 'Data', key: 'date', width: 12 },
    { header: 'Tipo de Serviço', key: 'serviceType', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Valor', key: 'value', width: 15 },
  ];

  const workOrderRows = workOrders.map((w: any) => ({
    id: `#${w.id}`,
    date: new Date(w.createdAt).toLocaleDateString('pt-BR'),
    serviceType: w.serviceType,
    status: w.status,
    value: `R$ ${Number(w.totalValue).toFixed(2)}`,
  }));

  workOrdersSheet.addRows(workOrderRows);

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as any as Buffer;
}

export async function generateServiceReportExcel(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const db = await getDb();

  if (!db) {
    throw new Error('Database not available');
  }

  // Buscar dados do período (simplificado)
  const workOrders: any[] = [];

  // Sheet 1: Resumo por Tipo de Serviço
  const summarySheet = workbook.addWorksheet('Resumo por Tipo');
  summarySheet.columns = [
    { header: 'Tipo de Serviço', key: 'type', width: 20 },
    { header: 'Quantidade', key: 'quantity', width: 15 },
    { header: 'Valor Total', key: 'total', width: 15 },
    { header: 'Valor Médio', key: 'average', width: 15 },
  ];

  const serviceTypeSummary = workOrders.reduce(
    (acc: any[], w: any) => {
      const existing = acc.find((item: any) => item.type === w.serviceType);
      if (existing) {
        existing.quantity += 1;
        existing.total += Number(w.totalValue);
      } else {
        acc.push({
          type: w.serviceType,
          quantity: 1,
          total: Number(w.totalValue),
        });
      }
      return acc;
    },
    []
  );

  const summaryRows = serviceTypeSummary.map((item: any) => ({
    type: item.type,
    quantity: item.quantity,
    total: `R$ ${item.total.toFixed(2)}`,
    average: `R$ ${(item.total / item.quantity).toFixed(2)}`,
  }));

  summarySheet.addRows(summaryRows);

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as any as Buffer;
}
