import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User } from "lucide-react";

interface Maintenance {
  id: number;
  clientName: string;
  equipmentModel: string;
  scheduledDate: string;
  address: string;
  type: "preventiva" | "corretiva";
}

interface UpcomingMaintenanceProps {
  maintenances: Maintenance[];
}

export function UpcomingMaintenance({ maintenances }: UpcomingMaintenanceProps) {
  const getTypeColor = (type: string) => {
    return type === "preventiva" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "preventiva" ? "Preventiva" : "Corretiva";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Manutenções</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maintenances.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma manutenção agendada</p>
          ) : (
            maintenances.map((maintenance) => (
              <div
                key={maintenance.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{maintenance.clientName}</h4>
                    <Badge className={getTypeColor(maintenance.type)}>
                      {getTypeLabel(maintenance.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {maintenance.equipmentModel}
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(maintenance.scheduledDate).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {maintenance.address}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
