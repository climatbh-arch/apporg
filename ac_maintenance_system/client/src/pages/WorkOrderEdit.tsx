import { useState } from "react";
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
import { Loader2, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function WorkOrderEdit() {
  const [, params] = useRoute("/work-orders/:id");
  const [, navigate] = useLocation();
  const orderId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    description: "",
    status: "pending",
    totalValue: 0,
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Mock: Em produção, buscar do servidor
  const workOrder = {
    id: orderId,
    description: "Manutenção preventiva - Split 12.000 BTU",
    status: "pending",
    totalValue: 250,
    notes: "Cliente solicitou limpeza completa",
    clientName: "João Silva",
    equipmentModel: "Split 12.000 BTU",
    createdAt: new Date().toISOString(),
  };

  const statusOptions = [
    { value: "pending", label: "Pendente" },
    { value: "approved", label: "Aprovado" },
    { value: "in_progress", label: "Em Execução" },
    { value: "completed", label: "Finalizado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  const handleStatusChange = (newStatus: string) => {
    setFormData({ ...formData, status: newStatus });
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (formData.totalValue <= 0) {
      toast.error("Valor total deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Ordem de serviço atualizada com sucesso!");
      navigate("/work-orders");
    } catch (error) {
      toast.error("Erro ao salvar ordem de serviço");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/work-orders")}
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
                      value={workOrder.clientName}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Equipamento</Label>
                    <Input
                      value={workOrder.equipmentModel}
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
                    value={formData.description || workOrder.description}
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
                    value={formData.notes || workOrder.notes}
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
                    value={formData.totalValue || workOrder.totalValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalValue: parseFloat(e.target.value),
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
                    value={formData.status}
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
                <Badge className={`${getStatusColor(formData.status)} w-full justify-center py-2`}>
                  {getStatusLabel(formData.status)}
                </Badge>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-l-2 border-gray-200 pl-3">
                  <p className="font-medium">Criada</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(workOrder.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
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
                    R$ {(formData.totalValue || workOrder.totalValue).toFixed(2)}
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
