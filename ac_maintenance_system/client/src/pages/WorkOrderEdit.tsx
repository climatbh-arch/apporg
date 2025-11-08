import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface WorkOrderData {
  id: number;
  description: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  totalValue: number;
  notes: string;
  clientName: string;
  equipmentModel: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
  }>;
}

export default function WorkOrderEdit() {
  const [, params] = useRoute("/work-orders/:id");
  const [, navigate] = useLocation();
  const orderId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState<Partial<WorkOrderData>>({
    description: "",
    status: "pending",
    totalValue: 0,
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusHistory, setStatusHistory] = useState<Array<{
    status: string;
    changedAt: string;
    changedBy: string;
  }>>([]);
  const [workOrder, setWorkOrder] = useState<WorkOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Em produção, buscar do servidor via tRPC
  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      // Simular carregamento do banco de dados
      setTimeout(() => {
        const mockData: WorkOrderData = {
          id: orderId,
          description: "Manutenção preventiva - Split 12.000 BTU",
          status: "pending",
          totalValue: 250,
          notes: "Cliente solicitou limpeza completa",
          clientName: "João Silva",
          equipmentModel: "Split 12.000 BTU",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: [
            {
              status: "Criada",
              changedAt: new Date(Date.now() - 86400000).toISOString(),
              changedBy: "Sistema",
            },
          ],
        };
        setWorkOrder(mockData);
        setFormData(mockData);
        setStatusHistory(mockData.statusHistory || []);
        setIsLoading(false);
      }, 500);
    }
  }, [orderId]);

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    { value: "approved", label: "Aprovado", color: "bg-blue-100 text-blue-800" },
    { value: "in_progress", label: "Em Execução", color: "bg-purple-100 text-purple-800" },
    { value: "completed", label: "Finalizado", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" },
  ];

  const handleStatusChange = (newStatus: string) => {
    const oldStatus = formData.status;
    setFormData({ ...formData, status: newStatus as any });
    
    // Adicionar ao histórico
    if (oldStatus !== newStatus) {
      const newHistoryEntry = {
        status: statusOptions.find(opt => opt.value === newStatus)?.label || newStatus,
        changedAt: new Date().toISOString(),
        changedBy: "Usuário Atual",
      };
      setStatusHistory([...statusHistory, newHistoryEntry]);
    }
  };

  const handleSave = async () => {
    if (!formData.description?.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (!formData.totalValue || formData.totalValue <= 0) {
      toast.error("Valor total deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      // Simular salvamento no banco de dados
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Ordem de serviço atualizada com sucesso!");
      
      // Aguardar um pouco antes de navegar
      setTimeout(() => {
        navigate("/work-orders");
      }, 1000);
    } catch (error) {
      toast.error("Erro ao salvar ordem de serviço");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find((opt) => opt.value === status)?.label || status;
  };

  if (!orderId) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ordem de serviço não encontrada</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/work-orders")}
            title="Voltar para ordens de serviço"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Ordem de Serviço</h1>
            <p className="text-muted-foreground">OS #{orderId}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Equipment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Ordem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <Input
                      value={formData.clientName || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Equipamento</Label>
                    <Input
                      value={formData.equipmentModel || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descreva o serviço a ser realizado"
                    className="mt-1 min-h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionais</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Observações importantes"
                    className="mt-1 min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Value */}
            <Card>
              <CardHeader>
                <CardTitle>Valor do Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="totalValue">Valor Total (R$) *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Ordem</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status || "pending"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selecione o andamento do atendimento
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/work-orders")}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${getStatusColor(formData.status || "pending")} w-full justify-center py-2`}>
                  {getStatusLabel(formData.status || "pending")}
                </Badge>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico de Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {statusHistory.length > 0 ? (
                  statusHistory.map((entry, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-3 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <p className="font-medium">{entry.status}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleDateString("pt-BR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">Por: {entry.changedBy}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma alteração registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">#{orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    R$ {(formData.totalValue || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criada em</p>
                  <p className="font-medium text-xs">
                    {workOrder?.createdAt ? new Date(workOrder.createdAt).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
