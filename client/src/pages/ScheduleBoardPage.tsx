import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, User, Clock, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface WorkOrder {
  id: number;
  workOrderNumber: string;
  clientName: string;
  serviceDescription: string;
  status: string;
  priority: number;
  slaLevel: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  technicianId?: number;
  technician?: string;
}

interface Technician {
  id: number;
  name: string;
  currentStatus: string;
  currentLatitude?: string;
  currentLongitude?: string;
}

interface DispatchSuggestion {
  technicianId: number;
  technicianName: string;
  totalScore: number;
  skillScore: number;
  distanceScore: number;
  slaScore: number;
  availabilityScore: number;
  distance?: number;
  estimatedTravelTime?: number;
}

export default function ScheduleBoardPage() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  // Query para buscar ordens de serviço
  const { data: workOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/work-orders"],
  });

  // Query para buscar técnicos
  const { data: technicians = [], isLoading: loadingTechs } = useQuery({
    queryKey: ["/api/technicians"],
  });

  // Mutation para sugerir técnico
  const suggestTechnicianMutation = useMutation({
    mutationFn: async (workOrderId: number) => {
      const response = await fetch(`/api/dispatch/suggest/${workOrderId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao sugerir técnico");
      return response.json();
    },
    onSuccess: (data: DispatchSuggestion) => {
      toast.success(
        `Técnico sugerido: ${data.technicianName} (Score: ${data.totalScore.toFixed(1)})`
      );
    },
    onError: () => {
      toast.error("Erro ao sugerir técnico");
    },
  });

  // Mutation para atribuir automaticamente
  const autoAssignMutation = useMutation({
    mutationFn: async (workOrderId: number) => {
      const response = await fetch(`/api/dispatch/auto-assign/${workOrderId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao atribuir automaticamente");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      toast.success("OS atribuída automaticamente!");
    },
    onError: () => {
      toast.error("Erro ao atribuir OS");
    },
  });

  // Mutation para atribuir manualmente
  const manualAssignMutation = useMutation({
    mutationFn: async ({
      workOrderId,
      technicianId,
    }: {
      workOrderId: number;
      technicianId: number;
    }) => {
      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId, status: "assigned" }),
      });
      if (!response.ok) throw new Error("Erro ao atribuir técnico");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      toast.success("Técnico atribuído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atribuir técnico");
    },
  });

  const filteredOrders = workOrders.filter((order: WorkOrder) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "unassigned") return !order.technicianId;
    return order.status === filterStatus;
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "destructive";
    if (priority >= 5) return "warning";
    return "default";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "secondary",
      assigned: "default",
      in_progress: "warning",
      completed: "success",
      cancelled: "destructive",
    };
    return colors[status] || "default";
  };

  const getTechnicianStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "success",
      in_transit: "warning",
      in_service: "default",
      unavailable: "destructive",
    };
    return colors[status] || "secondary";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule Board</h1>
          <p className="text-muted-foreground">
            Gerenciamento inteligente de despacho e alocação de técnicos
          </p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries()}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Ordens de Serviço */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ordens de Serviço</CardTitle>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unassigned">Não Atribuídas</SelectItem>
                    <SelectItem value="open">Abertas</SelectItem>
                    <SelectItem value="assigned">Atribuídas</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <p>Carregando...</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma ordem de serviço encontrada
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order: WorkOrder) => (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-colors ${
                        selectedWorkOrder === order.id
                          ? "border-primary"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedWorkOrder(order.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {order.workOrderNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.clientName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(order.priority)}>
                              P{order.priority}
                            </Badge>
                            <Badge variant={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm mb-3 line-clamp-2">
                          {order.serviceDescription}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {order.technician && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {order.technician}
                            </div>
                          )}
                          {order.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {order.estimatedDuration}min
                            </div>
                          )}
                          {order.slaLevel && (
                            <Badge variant="outline" className="text-xs">
                              SLA: {order.slaLevel}
                            </Badge>
                          )}
                        </div>

                        {!order.technicianId && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                suggestTechnicianMutation.mutate(order.id);
                              }}
                            >
                              <Zap className="mr-1 h-3 w-3" />
                              Sugerir
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                autoAssignMutation.mutate(order.id);
                              }}
                            >
                              Atribuir Auto
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Técnicos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Técnicos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTechs ? (
                <p>Carregando...</p>
              ) : technicians.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum técnico cadastrado
                </p>
              ) : (
                <div className="space-y-3">
                  {technicians.map((tech: Technician) => (
                    <Card key={tech.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{tech.name}</h3>
                            <Badge
                              variant={getTechnicianStatusColor(
                                tech.currentStatus
                              )}
                              className="mt-1"
                            >
                              {tech.currentStatus}
                            </Badge>
                          </div>
                          {tech.currentLatitude && tech.currentLongitude && (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {selectedWorkOrder && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() =>
                              manualAssignMutation.mutate({
                                workOrderId: selectedWorkOrder,
                                technicianId: tech.id,
                              })
                            }
                          >
                            Atribuir OS Selecionada
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de OS:</span>
                  <span className="font-semibold">{workOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Não Atribuídas:</span>
                  <span className="font-semibold">
                    {
                      workOrders.filter((o: WorkOrder) => !o.technicianId)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Técnicos Disponíveis:
                  </span>
                  <span className="font-semibold">
                    {
                      technicians.filter(
                        (t: Technician) => t.currentStatus === "available"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
