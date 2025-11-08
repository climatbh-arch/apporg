import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function Financial() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");

  // Form state
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    paymentMethod: "cash" as const,
    status: "completed" as const,
    dueDate: "",
    paidDate: "",
  });

  // Queries
  const transactionsQuery = trpc.transactions.list.useQuery();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dailyStatsQuery = trpc.dashboard.getDailyStats.useQuery({ date: today });

  const createTransactionMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      transactionsQuery.refetch();
      dailyStatsQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Transação criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar transação");
    },
  });

  const transactions = transactionsQuery.data || [];
  const dailyStats = dailyStatsQuery.data || { income: 0, expense: 0, workOrders: 0 };

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "",
      description: "",
      amount: "",
      paymentMethod: "cash",
      status: "completed",
      dueDate: "",
      paidDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category.trim() || !formData.description.trim() || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    await createTransactionMutation.mutateAsync({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
    });
  };

  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  );
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  );
  const balance = totalIncome - totalExpense;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie entradas, saídas e controle de caixa
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>
                  Registre uma entrada ou saída financeira
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <Label htmlFor="type">Tipo de Transação *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => {
                      setFormData({ ...formData, type: value });
                      setTransactionType(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrada</SelectItem>
                      <SelectItem value="expense">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder={
                      formData.type === "income"
                        ? "Ex: Serviço, Venda de Peça"
                        : "Ex: Compra de Peça, Combustível"
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição da transação"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="paidDate">Data de Pagamento</Label>
                    <Input
                      id="paidDate"
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) =>
                        setFormData({ ...formData, paidDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTransactionMutation.isPending}
                  >
                    Criar Transação
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {totalIncome.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {incomeTransactions.length} transação(ões)
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Expense */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {totalExpense.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {expenseTransactions.length} transação(ões)
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div
                    className={`text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    R$ {balance.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {balance >= 0 ? "Lucro" : "Prejuízo"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Hoje</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {dailyStats.income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {dailyStats.expense.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p
                  className={`text-2xl font-bold ${
                    dailyStats.income - dailyStats.expense >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  R$ {(dailyStats.income - dailyStats.expense).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>
              Histórico de todas as transações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactionsQuery.isLoading ? (
                <>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </>
              ) : transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma transação registrada
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 20).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} R${" "}
                          {parseFloat(transaction.amount.toString()).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.status === "pending"
                            ? "Pendente"
                            : transaction.status === "completed"
                            ? "Concluída"
                            : "Cancelada"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
