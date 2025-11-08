import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

interface Activity {
  id: number;
  type: "order_created" | "order_completed" | "payment_received" | "equipment_added";
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order_created":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "order_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "payment_received":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "equipment_added":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order_created":
        return "bg-blue-50 border-blue-200";
      case "order_completed":
        return "bg-green-50 border-green-200";
      case "payment_received":
        return "bg-green-50 border-green-200";
      case "equipment_added":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "order_created":
        return "Ordem Criada";
      case "order_completed":
        return "Ordem Concluída";
      case "payment_received":
        return "Pagamento Recebido";
      case "equipment_added":
        return "Equipamento Adicionado";
      default:
        return "Atividade";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className={`flex-1 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">
                      {getActivityLabel(activity.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-muted-foreground mt-1">Por: {activity.user}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
