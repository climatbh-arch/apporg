import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Queries
  const transactionsQuery = trpc.transactions.getByDateRange.useQuery(
    {
      // Converter string de data (YYYY-MM-DD) para Date com hora local
      startDate: new Date(startDate + 'T00:00:00'),
      endDate: new Date(endDate + 'T23:59:59'),
    },
    { enabled: !!startDate && !!endDate }
  );

  const workOrdersQuery = trpc.workOrders.list.useQuery();
  const clientsQuery = trpc.clients.list.useQuery();
  const inventoryQuery = trpc.inventory.list.useQuery();

  const transactions = transactionsQuery.data || [];
  const workOrders = workOrdersQuery.data || [];
  const clients = clientsQuery.data || [];
  const inventory = inventoryQuery.data || [];

  // Calculate metrics
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const profit = totalIncome - totalExpense;

  const completedOrders = workOrders.filter((wo) => wo.status === "completed");
  const pendingOrders = workOrders.filter((wo) => wo.status === "pending");
  const inProgressOrders = workOrders.filter((wo) => wo.status === "in_progress");

  const serviceTypes = workOrders.reduce(
    (acc, wo) => {
      const existing = acc.find((item) => item.type === wo.serviceType);
      if (existing) {
        existing.count += 1;
        existing.value += parseFloat(wo.totalValue.toString());
      } else {
        acc.push({
          type: wo.serviceType,
          count: 1,
          value: parseFloat(wo.totalValue.toString()),
        });
      }
      return acc;
    },
    [] as Array<{ type: string; count: number; value: number }>
  );

  const exportMonthlyReportMutation = trpc.reports.exportMonthlyReportExcel.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      const blob = new Blob([Buffer.from(data.excel, 'base64')], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      link.href = URL.createObjectURL(blob);
      link.download = data.filename;
      link.click();
      toast.success('Relatório exportado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao exportar relatório');
    },
  });

  const handleExportExcel = () => {
    exportMonthlyReportMutation.mutate({
      startDate: new Date(startDate + 'T00:00:00'),
      endDate: new Date(endDate + 'T23:59:59'),
    });
  };

  const handleExportPDF = () => {
    toast.info('Exportação em PDF em desenvolvimento');
  };

  const handleExportCSV = () => {
    toast.info('Exportação em CSV em desenvolvimento');
  };

  const topClients = clients
    .map((client) => ({
      ...client,
      orderCount: workOrders.filter((wo) => wo.clientId === client.id).length,
      totalValue: workOrders
        .filter((wo) => wo.clientId === client.id)
        .reduce((sum, wo) => sum + parseFloat(wo.totalValue.toString()), 0),
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minimumQuantity);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Análise de desempenho e métricas do negócio
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel} disabled={exportMonthlyReportMutation.isPending}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Atualizar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalIncome.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalExpense.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {profit.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work Orders Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {inProgressOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingOrders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Types */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Realizados</CardTitle>
            <CardDescription>Distribuição por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceTypes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum serviço registrado
                </p>
              ) : (
                serviceTypes.map((service) => (
                  <div key={service.type} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {service.type === "gas_charge"
                          ? "Carga de Gás"
                          : service.type === "floor_ceiling"
                          ? "Piso/Teto"
                          : service.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.count} serviço(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {service.value.toFixed(2)}
                      </p>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (service.count / workOrders.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Principais</CardTitle>
            <CardDescription>Clientes com maior faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum cliente registrado
                </p>
              ) : (
                topClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.orderCount} ordem(ns)
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      R$ {client.totalValue.toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Itens com Estoque Crítico</CardTitle>
              <CardDescription className="text-orange-800">
                {lowStockItems.length} item(ns) com quantidade abaixo do mínimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-orange-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} de {item.minimumQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">
                        Crítico
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R${" "}
                  {completedOrders.length > 0
                    ? (
                        completedOrders.reduce(
                          (sum, wo) => sum + parseFloat(wo.totalValue.toString()),
                          0
                        ) / completedOrders.length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">
                  {workOrders.length > 0
                    ? (
                        ((completedOrders.length / workOrders.length) * 100).toFixed(1)
                      )
                    : "0"}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className="text-2xl font-bold">
                  {totalIncome > 0
                    ? (((profit / totalIncome) * 100).toFixed(1))
                    : "0"}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
