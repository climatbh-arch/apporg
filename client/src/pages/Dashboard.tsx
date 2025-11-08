import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { useLocation } from "wouter";
import { DashboardCharts } from "@/components/DashboardCharts";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Queries
  const dailyStatsQuery = trpc.dashboard.getDailyStats.useQuery({ date: today });
  const pendingOrdersQuery = trpc.dashboard.getPendingWorkOrders.useQuery();
  const lowStockQuery = trpc.dashboard.getLowStockAlert.useQuery();

  const dailyStats = dailyStatsQuery.data || { income: 0, expense: 0, workOrders: 0 };
  const pendingOrders = pendingOrdersQuery.data || [];
  const lowStockItems = lowStockQuery.data || [];

  // Dados para gráficos (zerados para refletir desempenho real)
  const monthlyProfit = [
    { month: 'Jan', profit: 0, revenue: 0, expense: 0 },
    { month: 'Fev', profit: 0, revenue: 0, expense: 0 },
    { month: 'Mar', profit: 0, revenue: 0, expense: 0 },
    { month: 'Abr', profit: 0, revenue: 0, expense: 0 },
    { month: 'Mai', profit: 0, revenue: 0, expense: 0 },
    { month: 'Jun', profit: 0, revenue: 0, expense: 0 },
  ];

  const servicesByType = [
    { name: 'Manutenção', value: 0 },
    { name: 'Instalação', value: 0 },
    { name: 'Carga de Gás', value: 0 },
    { name: 'Limpeza', value: 0 },
    { name: 'Reparo', value: 0 },
    { name: 'Inspeção', value: 0 },
  ];

  const osStatus = [
    { name: 'Pendente', value: pendingOrders.filter(o => o.status === 'pending').length || 0 },
    { name: 'Aprovado', value: pendingOrders.filter(o => o.status === 'approved').length || 0 },
    { name: 'Em Execução', value: pendingOrders.filter(o => o.status === 'in_progress').length || 0 },
    { name: 'Finalizado', value: pendingOrders.filter(o => o.status === 'completed').length || 0 },
  ];

  const balance = dailyStats.income - dailyStats.expense;
  const isLoading =
    dailyStatsQuery.isLoading ||
    pendingOrdersQuery.isLoading ||
    lowStockQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao sistema de controle de manutenção de AC
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Income Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {dailyStats.income.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Serviços pagos</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Expense Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {dailyStats.expense.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Despesas</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Dia</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
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

          {/* Work Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{pendingOrders.length}</div>
                  <p className="text-xs text-muted-foreground">Pendentes/Em andamento</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Estoque Crítico</AlertTitle>
              <AlertDescription>
                {lowStockItems.length} item(ns) com estoque abaixo do mínimo
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate("/inventory")}
              >
                Ver Estoque
              </Button>
            </Alert>
          )}

          {/* Pending Work Orders Alert */}
          {pendingOrders.length > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Ordens Pendentes</AlertTitle>
              <AlertDescription>
                {pendingOrders.length} ordem(ns) de serviço aguardando ação
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate("/work-orders")}
              >
                Ver Ordens
              </Button>
            </Alert>
          )}
        </div>

        {/* Pending Work Orders List */}
        {pendingOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço Pendentes</CardTitle>
              <CardDescription>
                Ordens que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  <div className="space-y-2">
                    {pendingOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/work-orders/${order.id}`)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">OS #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.description || "Sem descrição"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R$ {parseFloat(order.totalValue.toString()).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {order.status === "pending"
                              ? "Pendente"
                              : order.status === "approved"
                              ? "Aprovado"
                              : order.status === "in_progress"
                              ? "Em Execução"
                              : order.status === "completed"
                              ? "Finalizado"
                              : "Cancelado"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/clients")}
                className="h-auto flex-col gap-2 py-4"
              >
                <Users className="h-5 w-5" />
                <span>Novo Cliente</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/work-orders")}
                className="h-auto flex-col gap-2 py-4"
              >
                <FileText className="h-5 w-5" />
                <span>Nova OS</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/inventory")}
                className="h-auto flex-col gap-2 py-4"
              >
                <Package className="h-5 w-5" />
                <span>Estoque</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/financial")}
                className="h-auto flex-col gap-2 py-4"
              >
                <DollarSign className="h-5 w-5" />
                <span>Financeiro</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        monthlyProfit={monthlyProfit}
        servicesByType={servicesByType}
        osStatus={osStatus}
      />
    </DashboardLayout>
  );
}

// Import icons
import { Users, FileText } from "lucide-react";
