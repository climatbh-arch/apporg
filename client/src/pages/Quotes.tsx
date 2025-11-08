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
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Quotes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    clientId: 0,
    equipmentId: 0,
    serviceType: "maintenance" as const,
    totalValue: "",
    description: "",
    discountPercent: "",
    validityDate: "",
  });

  // Queries
  const clientsQuery = trpc.clients.list.useQuery();
  const equipmentsQuery = trpc.equipments.list.useQuery();
  const quotesQuery = trpc.quotes.list.useQuery();

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      quotesQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Orçamento criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar orçamento:", error);
      toast.error(error.message || "Erro ao criar orçamento");
    },
  });

  const updateQuoteMutation = trpc.quotes.update.useMutation({
    onSuccess: () => {
      quotesQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Orçamento atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar orçamento:", error);
      toast.error(error.message || "Erro ao atualizar orçamento");
    },
  });

  const deleteQuoteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      quotesQuery.refetch();
      toast.success("Orçamento deletado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar orçamento:", error);
      toast.error(error.message || "Erro ao deletar orçamento");
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: 0,
      equipmentId: 0,
      serviceType: "maintenance",
      totalValue: "",
      description: "",
      discountPercent: "",
      validityDate: "",
    });
    setEditingId(null);
  };

  const handleOpenDialog = (quote?: any) => {
    if (quote) {
      setEditingId(quote.id);
      setFormData({
        clientId: quote.clientId,
        equipmentId: quote.equipmentId || 0,
        serviceType: quote.serviceType,
        totalValue: quote.subtotal,
        description: quote.description || "",
        discountPercent: quote.discountPercent || "",
        validityDate: quote.validityDate ? new Date(quote.validityDate).toISOString().split("T")[0] : "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.clientId || !formData.totalValue) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const input = {
      clientId: formData.clientId,
      equipmentId: formData.equipmentId || undefined,
      serviceType: formData.serviceType,
      totalValue: formData.totalValue,
      description: formData.description || undefined,
      discountPercent: formData.discountPercent || undefined,
      validityDate: formData.validityDate ? new Date(formData.validityDate) : undefined,
    };

    if (editingId) {
      updateQuoteMutation.mutate({
        id: editingId,
        ...input,
      });
    } else {
      createQuoteMutation.mutate(input);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este orçamento?")) {
      deleteQuoteMutation.mutate({ id });
    }
  };

  const clients = clientsQuery.data || [];
  const equipments = equipmentsQuery.data || [];
  const quotes = quotesQuery.data || [];

  // Filtrar orçamentos
  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.find((c) => c.id === quote.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      sent: "Enviado",
      approved: "Aprovado",
      rejected: "Rejeitado",
      converted: "Convertido",
    };
    return labels[status] || status;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      installation: "Instalação",
      maintenance: "Manutenção",
      gas_charge: "Recarga de Gás",
      cleaning: "Limpeza",
      repair: "Reparo",
      inspection: "Inspeção",
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus orçamentos e propostas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do orçamento abaixo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Cliente *</Label>
                  <Select
                    value={formData.clientId.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: parseInt(value) })
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

                <div>
                  <Label htmlFor="equipment">Equipamento</Label>
                  <Select
                    value={formData.equipmentId.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, equipmentId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhum</SelectItem>
                      {equipments.map((eq: any) => (
                        <SelectItem key={eq.id} value={eq.id.toString()}>
                          {eq.brand} {eq.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="gas_charge">Recarga de Gás</SelectItem>
                      <SelectItem value="cleaning">Limpeza</SelectItem>
                      <SelectItem value="repair">Reparo</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="totalValue">Valor Total (R$) *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.totalValue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalValue: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="discountPercent">Desconto (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercent: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="validityDate">Data de Validade</Label>
                  <Input
                    id="validityDate"
                    type="date"
                    value={formData.validityDate}
                    onChange={(e) =>
                      setFormData({ ...formData, validityDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição do orçamento"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={createQuoteMutation.isPending || updateQuoteMutation.isPending}
                  className="w-full"
                >
                  {editingId ? "Atualizar" : "Criar"} Orçamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quotes List */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos</CardTitle>
            <CardDescription>{filteredQuotes.length} orçamento(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {quotesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Número</th>
                      <th className="text-left py-2 px-4">Cliente</th>
                      <th className="text-left py-2 px-4">Serviço</th>
                      <th className="text-right py-2 px-4">Valor</th>
                      <th className="text-center py-2 px-4">Status</th>
                      <th className="text-center py-2 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{quote.quoteNumber}</td>
                        <td className="py-2 px-4">
                          {clients.find((c) => c.id === quote.clientId)?.name || "Desconhecido"}
                        </td>
                        <td className="py-2 px-4">{getServiceTypeLabel(quote.serviceType)}</td>
                        <td className="py-2 px-4 text-right font-semibold">
                          R$ {parseFloat(quote.totalValue.toString()).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(quote.status)}`}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(quote)}
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(quote.id)}
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
