import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Trash2, Plus, DollarSign, TrendingUp } from "lucide-react";

export default function FinancialPage() {
  const [tab, setTab] = useState<"payments" | "expenses" | "report">("payments");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    clientId: 0, clientName: "", amount: "", paymentMethod: "cash" as const, status: "pending" as const, notes: "",
  });
  const [expenseData, setExpenseData] = useState({
    description: "", category: "", amount: "", paymentMethod: "cash" as const, status: "pending" as const, notes: "",
  });

  const paymentsQuery = trpc.payments.list.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery();
  const reportQuery = trpc.financial.getReport.useQuery({});

  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      paymentsQuery.refetch();
      setPaymentData({ clientId: 0, clientName: "", amount: "", paymentMethod: "cash", status: "pending", notes: "" });
      setShowPaymentForm(false);
    },
  });

  const createExpenseMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      expensesQuery.refetch();
      setExpenseData({ description: "", category: "", amount: "", paymentMethod: "cash", status: "pending", notes: "" });
      setShowExpenseForm(false);
    },
  });

  const deletePaymentMutation = trpc.payments.delete.useMutation({
    onSuccess: () => paymentsQuery.refetch(),
  });

  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => expensesQuery.refetch(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Controle Financeiro</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button onClick={() => setTab("payments")} className={`py-2 px-4 ${tab === "payments" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}>
          Pagamentos
        </button>
        <button onClick={() => setTab("expenses")} className={`py-2 px-4 ${tab === "expenses" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}>
          Despesas
        </button>
        <button onClick={() => setTab("report")} className={`py-2 px-4 ${tab === "report" ? "border-b-2 border-primary font-bold" : "text-gray-500"}`}>
          Relatório
        </button>
      </div>

      {/* Payments Tab */}
      {tab === "payments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Pagamentos</h2>
            <Button onClick={() => setShowPaymentForm(!showPaymentForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Novo Pagamento
            </Button>
          </div>

          {showPaymentForm && (
            <Card>
              <CardHeader><CardTitle>Registrar Pagamento</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createPaymentMutation.mutateAsync(paymentData); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Cliente *" value={paymentData.clientName} onChange={(e) => setPaymentData({...paymentData, clientName: e.target.value})} />
                    <Input placeholder="Valor (R$) *" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} />
                    <select value={paymentData.paymentMethod} onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value as any})} className="p-2 border rounded">
                      <option value="cash">Dinheiro</option>
                      <option value="card">Cartão</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="transfer">Transferência</option>
                    </select>
                    <select value={paymentData.status} onChange={(e) => setPaymentData({...paymentData, status: e.target.value as any})} className="p-2 border rounded">
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Atrasado</option>
                    </select>
                  </div>
                  <textarea className="w-full p-2 border rounded" placeholder="Observações" rows={2} value={paymentData.notes} onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createPaymentMutation.isPending}>{createPaymentMutation.isPending ? "Salvando..." : "Salvar"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Lista de Pagamentos</CardTitle></CardHeader>
            <CardContent>
              {paymentsQuery.isLoading ? <p>Carregando...</p> : paymentsQuery.data?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.clientName}</TableCell>
                        <TableCell>R$ {parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-sm ${payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{payment.status}</span></TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => deletePaymentMutation.mutate({ id: payment.id })}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center text-gray-500">Nenhum pagamento registrado</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Despesas</h2>
            <Button onClick={() => setShowExpenseForm(!showExpenseForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Despesa
            </Button>
          </div>

          {showExpenseForm && (
            <Card>
              <CardHeader><CardTitle>Registrar Despesa</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createExpenseMutation.mutateAsync(expenseData); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Descrição *" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} />
                    <Input placeholder="Categoria" value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})} />
                    <Input placeholder="Valor (R$) *" value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} />
                    <select value={expenseData.paymentMethod} onChange={(e) => setExpenseData({...expenseData, paymentMethod: e.target.value as any})} className="p-2 border rounded">
                      <option value="cash">Dinheiro</option>
                      <option value="card">Cartão</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="transfer">Transferência</option>
                    </select>
                  </div>
                  <textarea className="w-full p-2 border rounded" placeholder="Observações" rows={2} value={expenseData.notes} onChange={(e) => setExpenseData({...expenseData, notes: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createExpenseMutation.isPending}>{createExpenseMutation.isPending ? "Salvando..." : "Salvar"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Lista de Despesas</CardTitle></CardHeader>
            <CardContent>
              {expensesQuery.isLoading ? <p>Carregando...</p> : expensesQuery.data?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesQuery.data.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{expense.category || "-"}</TableCell>
                        <TableCell>R$ {parseFloat(expense.amount).toFixed(2)}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded text-sm ${expense.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{expense.status}</span></TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => deleteExpenseMutation.mutate({ id: expense.id })}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center text-gray-500">Nenhuma despesa registrada</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Tab */}
      {tab === "report" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(reportQuery.data?.totalRevenue || 0).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(reportQuery.data?.totalExpenses || 0).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(reportQuery.data?.totalProfit || 0).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(reportQuery.data?.pendingPayments || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
