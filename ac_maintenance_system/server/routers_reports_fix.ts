// Adicionar estes endpoints ao router de relatórios

exportMonthlyReportPDF: protectedProcedure
  .input(z.object({ startDate: z.date(), endDate: z.date() }))
  .mutation(async ({ input }) => {
    try {
      const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
      const workOrders = await db.getAllWorkOrders();
      
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      
      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      
      const profit = totalIncome - totalExpense;
      
      // Criar PDF simples com os dados
      const { PDFDocument } = require('pdf-lib');
      const doc = PDFDocument.create();
      const page = doc.addPage([600, 800]);
      
      page.drawText('Relatório Mensal', { x: 200, y: 750, size: 20 });
      page.drawText(`Período: ${input.startDate.toLocaleDateString('pt-BR')} a ${input.endDate.toLocaleDateString('pt-BR')}`, { x: 100, y: 720, size: 12 });
      
      page.drawText('Resumo Financeiro', { x: 50, y: 680, size: 14 });
      page.drawText(`Total de Entradas: R$ ${totalIncome.toFixed(2)}`, { x: 70, y: 660, size: 12 });
      page.drawText(`Total de Saídas: R$ ${totalExpense.toFixed(2)}`, { x: 70, y: 640, size: 12 });
      page.drawText(`Lucro: R$ ${profit.toFixed(2)}`, { x: 70, y: 620, size: 12 });
      
      page.drawText('Ordens de Serviço', { x: 50, y: 580, size: 14 });
      page.drawText(`Total de Ordens: ${workOrders.length}`, { x: 70, y: 560, size: 12 });
      page.drawText(`Ordens Concluídas: ${workOrders.filter((wo) => wo.status === 'completed').length}`, { x: 70, y: 540, size: 12 });
      page.drawText(`Ordens Pendentes: ${workOrders.filter((wo) => wo.status === 'pending').length}`, { x: 70, y: 520, size: 12 });
      
      const buffer = await doc.save();
      
      return {
        pdf: Buffer.from(buffer).toString('base64'),
        filename: `Relatorio_Mensal_${new Date().getTime()}.pdf`,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
      });
    }
  }),

exportMonthlyReportCSV: protectedProcedure
  .input(z.object({ startDate: z.date(), endDate: z.date() }))
  .mutation(async ({ input }) => {
    try {
      const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
      
      // Criar CSV com dados
      let csv = 'Tipo,Descrição,Valor,Data\n';
      
      transactions.forEach((t) => {
        const tipo = t.type === 'income' ? 'Entrada' : 'Saída';
        const descricao = (t.description || 'N/A').replace(/,/g, ';');
        const valor = parseFloat(t.amount.toString()).toFixed(2);
        const data = new Date(t.createdAt).toLocaleDateString('pt-BR');
        csv += `${tipo},${descricao},${valor},${data}\n`;
      });
      
      return {
        csv,
        filename: `Relatorio_Mensal_${new Date().getTime()}.csv`,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao gerar CSV: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
      });
    }
  }),
