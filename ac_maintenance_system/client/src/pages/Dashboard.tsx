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
  Users,
  FileText,
} from "lucide-react";
import { useLocation } from "wouter";
import { DashboardCharts } from "@/components/DashboardCharts";
import { KPICards } from "@/components/KPICards";
import { RevenueChart } from "@/components/RevenueChart";
import { UpcomingMaintenance } from "@/components/UpcomingMaintenance";
import { ActivityTimeline } from "@/components/ActivityTimeline";

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

  // Dados para gráficos
  const monthlyProfit = [
    { month: 'Jan', profit: 2400, revenue: 4000, expense: 1600, receita: 4000, despesa: 1600 },
    { month: 'Fev', profit: 1398, revenue: 3000, expense: 1602, receita: 3000, despesa: 1602 },
    { month: 'Mar', profit: 9800, revenue: 2000, expense: 9800, receita: 2000, despesa: 9800 },
    { month: 'Abr', profit: 3908, revenue: 2780, expense: 1908, receita: 2780, despesa: 1908 },
    { month: 'Mai', profit: 4800, revenue: 1890, expense: 1300, receita: 1890, despesa: 1300 },
    { month: 'Jun', profit: 3800, revenue: 2390, expense: 2800, receita: 2390, despesa: 2800 },
  ];

  const servicesByType = [
    { name: 'Manutenção', value: 12 },
    { name: 'Instalação', value: 8 },
    { name: 'Carga de Gás', value: 15 },
    { name: 'Limpeza', value: 10 },
    { name: 'Reparo', value: 7 },
    { name: 'Inspeção', value: 5 },
  ];

  const osStatus = [
    { name: 'Pendente', value: pendingOrders.filter(o => o.status === 'pending').length || 0 },
    { name: 'Aprovado', value: pendingOrders.filter(o => o.status === 'approved').length || 0 },
    { name: 'Em Execução', value: pendingOrders.filter(o => o.status === 'in_progress').length || 0 },
    { name: 'Finalizado', value: pendingOrders.filter(o => o.status === 'completed').length || 0 },
  ];

  // Mock data para próximas manutenções
  const upcomingMaintenances = [
    {
      id: 1,
      clientName: "João Silva",
      equipmentModel: "Split 12.000 BTU",
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      address: "Rua A, 123",
      type: "preventiva" as const,
    },
    {
      id: 2,
      clientName: "Maria Santos",
      equipmentModel: "Janela 10.000 BTU",
      scheduledDate: new Date(Date.now() + 172800000).toISOString(),
      address: "Rua B, 456",
      type: "corretiva" as const,
    },
  ];

  // Mock data para atividades recentes
  const recentActivities = [
    {
      id: 1,
      type: "order_created" as const,
      description: "Nova ordem de serviço criada",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: "Admin",
    },
    {
      id: 2,
      type: "order_completed" as const,
      description: "Ordem de serviço finalizada",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: "Técnico João",
    },
    {
      id: 3,
      type: "payment_received" as const,
      description: "Pagamento recebido",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: "Sistema",
    },
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

        {/* KPI Cards */}
        {!isLoading && (
          <KPICards
            totalClients={15}
            totalEquipments={32}
            monthlyRevenue={dailyStats.income * 30}
            pendingOrders={pendingOrders.length}
          />
        )}

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={monthlyProfit} />
          <div className="grid grid-cols-1 gap-6">
            <UpcomingMaintenance maintenances={upcomingMaintenances} />
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline activities={recentActivities} />

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
