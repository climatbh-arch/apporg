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
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Queries com dados REAIS
  const clientsQuery = trpc.clients.list.useQuery() || { data: [], isLoading: false };
  const equipmentsQuery = trpc.equipments.getByClientId.useQuery({ clientId: 0 }) || { data: [], isLoading: false };
  const workOrdersQuery = trpc.workOrders?.list?.useQuery?.() || { data: [], isLoading: false };
  const transactionsQuery = trpc.transactions?.list?.useQuery?.() || { data: [], isLoading: false };

  // Dados REAIS do banco
  const clients = clientsQuery.data || [];
  const equipments = equipmentsQuery.data || [];
  const workOrders = workOrdersQuery.data || [];
  const transactions = transactionsQuery.data || [];

  // Calcular dados REAIS para gráficos
  const monthlyProfit = [
    { month: 'Jan', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
    { month: 'Fev', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
    { month: 'Mar', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
    { month: 'Abr', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
    { month: 'Mai', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
    { month: 'Jun', profit: 0, revenue: 0, expense: 0, receita: 0, despesa: 0 },
  ].map((month, index) => {
    const monthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.createdAt || new Date());
      return date.getMonth() === index;
    });
    const revenue = monthTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const expense = monthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    return {
      ...month,
      profit: revenue - expense,
      revenue,
      expense,
      receita: revenue,
      despesa: expense,
    };
  });

  const servicesByType = [
    { name: 'Manutenção', value: workOrders.filter((o: any) => o.serviceType === 'maintenance').length || 0 },
    { name: 'Instalação', value: workOrders.filter((o: any) => o.serviceType === 'installation').length || 0 },
    { name: 'Carga de Gás', value: workOrders.filter((o: any) => o.serviceType === 'gas_charge').length || 0 },
    { name: 'Limpeza', value: workOrders.filter((o: any) => o.serviceType === 'cleaning').length || 0 },
    { name: 'Reparo', value: workOrders.filter((o: any) => o.serviceType === 'repair').length || 0 },
    { name: 'Inspeção', value: workOrders.filter((o: any) => o.serviceType === 'inspection').length || 0 },
  ];

  const osStatus = [
    { name: 'Pendente', value: workOrders.filter((o: any) => o.status === 'pending').length || 0 },
    { name: 'Aprovado', value: workOrders.filter((o: any) => o.status === 'approved').length || 0 },
    { name: 'Em Execução', value: workOrders.filter((o: any) => o.status === 'in_progress').length || 0 },
    { name: 'Finalizado', value: workOrders.filter((o: any) => o.status === 'completed').length || 0 },
  ];

  // Dados REAIS de próximas manutenções
  const upcomingMaintenances = workOrders
    .filter((o: any) => o.status === 'pending' || o.status === 'approved')
    .slice(0, 5)
    .map((order: any) => ({
      id: order.id,
      clientName: order.clientName || 'Cliente',
      equipmentModel: order.equipmentModel || 'Equipamento',
      scheduledDate: order.scheduledDate || new Date().toISOString(),
      address: order.address || 'Endereço não informado',
      type: order.serviceType === 'maintenance' ? 'preventiva' : 'corretiva' as const,
    }));

  // Dados REAIS de atividades recentes
  const recentActivities = workOrders
    .slice(0, 5)
    .map((order: any) => ({
      id: order.id,
      type: order.status === 'completed' ? 'order_completed' : 'order_created' as const,
      description: `Ordem de serviço ${order.status === 'completed' ? 'finalizada' : 'criada'}`,
      timestamp: order.createdAt || new Date().toISOString(),
      user: 'Sistema',
    }));

  const totalRevenue = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const balance = totalRevenue - totalExpense;

  const isLoading =
    clientsQuery.isLoading ||
    equipmentsQuery.isLoading ||
    workOrdersQuery.isLoading ||
    transactionsQuery.isLoading;

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
            totalClients={clients.length}
            totalEquipments={equipments.length}
            monthlyRevenue={totalRevenue}
            pendingOrders={workOrders.filter((o: any) => o.status === 'pending').length}
          />
        )}

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={monthlyProfit} />
          <div className="grid grid-cols-1 gap-6">
            {upcomingMaintenances.length > 0 && <UpcomingMaintenance maintenances={upcomingMaintenances} />}
          </div>
        </div>

        {/* Activity Timeline */}
        {recentActivities.length > 0 && <ActivityTimeline activities={recentActivities} />}

        {/* Charts */}
        {monthlyProfit.length > 0 && <DashboardCharts monthlyData={monthlyProfit} servicesByType={servicesByType} osStatus={osStatus} />}
      </div>
    </DashboardLayout>
  );
}
