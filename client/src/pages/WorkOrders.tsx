import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Trash2, Edit2, Download } from "lucide-react";
import { toast } from "sonner";

export default function WorkOrders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    clientId: 0,
    equipmentId: 0,
    serviceType: "maintenance" as const,
    totalValue: "",
    description: "",
    technician: "",
    scheduledDate: "",
  });

  // Queries
  const clientsQuery = trpc.clients.list.useQuery();
  const workOrdersQuery = trpc.workOrders.list.useQuery();

  const createWorkOrderMutation = trpc.workOrders.create.useMutation({
    onSuccess: () => {
      workOrdersQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Ordem de serviço criada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar OS:", error);
      toast.error(error.message || "Erro ao criar ordem de serviço");
    },
  });

  const updateWorkOrderMutation = trpc.workOrders.update.useMutation({
    onSuccess: () => {
      workOrdersQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Ordem de serviço atualizada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar OS:", error);
      toast.error(error.message || "Erro ao atualizar ordem de serviço");
    },
  });

  const generatePDFMutation = trpc.pdf.generateWorkOrderPDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob
      const binaryString = atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF gerado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao gerar PDF:", error);
      toast.error(error.message || "Erro ao gerar PDF");
    },
  });

  // Placeholder para delete - será implementado quando necessário
  const handleDeleteWorkOrder = (id: number) => {
    toast.info("Funcionalidade de deletar em desenvolvimento");
  };

  const handleDownloadPDF = (workOrderId: number) => {
    generatePDFMutation.mutate({ workOrderId });
  };
  const clients = clientsQuery.data || [];
  const workOrders = workOrdersQuery.data || [];

  const filteredWorkOrders =
    statusFilter === "all"
      ? workOrders
      : workOrders.filter((wo) => wo.status === statusFilter);

  const resetForm = () => {
    setFormData({
      clientId: 0,
      equipmentId: 0,
      serviceType: "maintenance",
      totalValue: "",
      description: "",
      technician: "",
      scheduledDate: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.clientId === 0 || !formData.serviceType || !formData.totalValue) {
      toast.error("Preencha os campos obrigatórios (Cliente e Valor Total)");
      return;
    }

    if (editingId) {
      await updateWorkOrderMutation.mutateAsync({
        id: editingId,
        totalValue: formData.totalValue,
        description: formData.description,
        technician: formData.technician,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate)
          : undefined,
      });
    } else {
      await createWorkOrderMutation.mutateAsync({
        ...formData,
        equipmentId: formData.equipmentId || undefined,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate)
          : undefined,
      });
    }
  };

  const handleEdit = (workOrder: typeof workOrders[0]) => {
    setFormData({
      clientId: workOrder.clientId,
      equipmentId: workOrder.equipmentId || 0,
      serviceType: workOrder.serviceType as any,
      totalValue: workOrder.totalValue.toString(),
      description: workOrder.description || "",
      technician: workOrder.technician || "",
      scheduledDate: workOrder.scheduledDate
        ? new Date(workOrder.scheduledDate).toISOString().split("T")[0]
        : "",
    });
    setEditingId(workOrder.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta ordem de serviço?")) {
      handleDeleteWorkOrder(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "in_progress":
        return "Em Execução";
      case "completed":
        return "Finalizado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Orçamentos e Ordens de Serviço
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os orçamentos e ordens de serviço dos clientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize os dados da ordem de serviço"
                    : "Preencha os dados da nova ordem de serviço"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Client */}
                <div>
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select
                    value={formData.clientId.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        clientId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Type */}
                <div>
                  <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, serviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installation">Instalação</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="gas_charge">Carga de Gás</SelectItem>
                      <SelectItem value="cleaning">Limpeza</SelectItem>
                      <SelectItem value="repair">Reparo</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Value */}
                <div>
                  <Label htmlFor="totalValue">Valor Total *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    value={formData.totalValue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalValue: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Technician */}
                <div>
                  <Label htmlFor="technician">Técnico Responsável</Label>
                  <Input
                    id="technician"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({ ...formData, technician: e.target.value })
                    }
                    placeholder="Nome do técnico"
                  />
                </div>

                {/* Scheduled Date */}
                <div>
                  <Label htmlFor="scheduledDate">Data Agendada</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do serviço"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createWorkOrderMutation.isPending ||
                      updateWorkOrderMutation.isPending
                    }
                  >
                    {editingId ? "Atualizar" : "Criar"} OS
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={statusFilter === "in_progress" ? "default" : "outline"}
            onClick={() => setStatusFilter("in_progress")}
          >
            Em Execução
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
          >
            Finalizadas
          </Button>
        </div>

        {/* Work Orders List */}
        <div className="space-y-4">
          {workOrdersQuery.isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filteredWorkOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhuma ordem de serviço encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredWorkOrders.map((workOrder) => (
              <Card key={workOrder.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>OS #{workOrder.id}</CardTitle>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            workOrder.status
                          )}`}
                        >
                          {getStatusLabel(workOrder.status)}
                        </span>
                      </div>
                      <CardDescription>
                        {clients.find((c) => c.id === workOrder.clientId)?.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(workOrder.id)}
                        disabled={generatePDFMutation.isPending}
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(workOrder)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkOrder(workOrder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                      <p className="font-medium capitalize">
                        {workOrder.serviceType === "gas_charge"
                          ? "Carga de Gás"
                          : workOrder.serviceType === "installation"
                          ? "Instalação"
                          : workOrder.serviceType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="font-medium">
                        R$ {parseFloat(workOrder.totalValue.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {workOrder.technician && (
                    <div>
                      <p className="text-sm text-muted-foreground">Técnico</p>
                      <p className="font-medium">{workOrder.technician}</p>
                    </div>
                  )}
                  {workOrder.scheduledDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data Agendada</p>
                      <p className="font-medium">
                        {new Date(workOrder.scheduledDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  )}
                  {workOrder.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="text-sm">{workOrder.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
