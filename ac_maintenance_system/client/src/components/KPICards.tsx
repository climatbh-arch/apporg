import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, DollarSign, TrendingUp } from "lucide-react";

interface KPICardsProps {
  totalClients: number;
  totalEquipments: number;
  monthlyRevenue: number;
  pendingOrders: number;
}

export function KPICards({
  totalClients,
  totalEquipments,
  monthlyRevenue,
  pendingOrders,
}: KPICardsProps) {
  const kpis = [
    {
      title: "Total de Clientes",
      value: totalClients,
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Equipamentos",
      value: totalEquipments,
      icon: Zap,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Receita (Mês)",
      value: `R$ ${monthlyRevenue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Ordens Pendentes",
      value: pendingOrders,
      icon: TrendingUp,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`${kpi.lightColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${kpi.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Atualizado hoje
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
