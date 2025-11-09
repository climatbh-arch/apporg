import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Edit2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function WorkOrdersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientWhatsapp: "",
    serviceDescription: "",
    technician: "",
    laborHours: "",
    laborCostPerHour: "",
    materialsTotal: "",
    openedAt: new Date().toISOString().split("T")[0],
  });

  const { data: workOrders, refetch } = trpc.workOrders.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createWorkOrderMutation = trpc.workOrders.create.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço criada com sucesso!");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientWhatsapp: "",
        serviceDescription: "",
        technician: "",
        laborHours: "",
        laborCostPerHour: "",
        materialsTotal: "",
        openedAt: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar ordem de serviço");
      console.error(error);
    },
  });

  const deleteWorkOrderMutation = trpc.workOrders.delete.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço deletada com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar ordem de serviço");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const laborHours = parseFloat(formData.laborHours || "0");
    const laborCostPerHour = parseFloat(formData.laborCostPerHour || "0");
    const laborTotal = laborHours * laborCostPerHour;
    const materialsTotal = parseFloat(formData.materialsTotal || "0");
    const totalValue = laborTotal + materialsTotal;
    createWorkOrderMutation.mutate({
      clientId: 1,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientWhatsapp: formData.clientWhatsapp,
      serviceDescription: formData.serviceDescription,
      technician: formData.technician,
      laborHours: formData.laborHours || "0",
      laborCostPerHour: formData.laborCostPerHour || "0",
      laborTotal: laborTotal.toString(),
      materialsTotal: formData.materialsTotal || "0",
      totalValue: totalValue.toString(),
      openedAt: formData.openedAt ? new Date(formData.openedAt) : undefined,
    });
  };

  const calculateTotal = () => {
    const laborHours = parseFloat(formData.laborHours) || 0;
    const laborCostPerHour = parseFloat(formData.laborCostPerHour) || 0;
    const materialsTotal = parseFloat(formData.materialsTotal) || 0;
    const laborTotal = laborHours * laborCostPerHour;
    return (laborTotal + materialsTotal).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
              <p className="text-muted-foreground mt-1">Gerencie suas ordens de serviço</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setLocation("/")}
              className="py-4 px-2 border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => setLocation("/quotes")}
              className="py-4 px-2 border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground transition"
            >
              Orçamentos
            </button>
            <button
              onClick={() => setLocation("/work-orders")}
              className="py-4 px-2 border-b-2 border-primary font-medium text-foreground hover:text-primary transition"
            >
              Ordens de Serviço
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nova Ordem de Serviço</CardTitle>
              <CardDescription>Preencha os dados da ordem de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Nome do Cliente *</Label>
                    <Input
                      id="clientName"
                      placeholder="Ex: João Silva"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">E-mail</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="cliente@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      placeholder="(11) 99999-9999"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientWhatsapp">WhatsApp</Label>
                    <Input
                      id="clientWhatsapp"
                      placeholder="(11) 99999-9999"
                      value={formData.clientWhatsapp}
                      onChange={(e) => setFormData({ ...formData, clientWhatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceDescription">Descrição do Serviço Executado</Label>
                  <Textarea
                    id="serviceDescription"
                    placeholder="Descreva o serviço realizado"
                    value={formData.serviceDescription}
                    onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="technician">Técnico Responsável</Label>
                    <Input
                      id="technician"
                      placeholder="Nome do técnico"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="openedAt">Data de Abertura</Label>
                    <Input
                      id="openedAt"
                      type="date"
                      value={formData.openedAt}
                      onChange={(e) => setFormData({ ...formData, openedAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Mão de Obra</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="laborHours">Horas Trabalhadas</Label>
                      <Input
                        id="laborHours"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.laborHours}
                        onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="laborCostPerHour">Valor/Hora (R$)</Label>
                      <Input
                        id="laborCostPerHour"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.laborCostPerHour}
                        onChange={(e) => setFormData({ ...formData, laborCostPerHour: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="laborTotal">Total Mão de Obra</Label>
                      <Input
                        id="laborTotal"
                        type="text"
                        value={`R$ ${(parseFloat(formData.laborHours || "0") * parseFloat(formData.laborCostPerHour || "0")).toFixed(2)}`}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Materiais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="materialsTotal">Total de Materiais (R$)</Label>
                      <Input
                        id="materialsTotal"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.materialsTotal}
                        onChange={(e) => setFormData({ ...formData, materialsTotal: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="total">Valor Total</Label>
                      <Input
                        id="total"
                        type="text"
                        value={`R$ ${calculateTotal()}`}
                        disabled
                        className="bg-slate-50 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={createWorkOrderMutation.isPending}>
                    {createWorkOrderMutation.isPending ? "Salvando..." : "Salvar Ordem"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
            <CardDescription>Todas as ordens de serviço cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            {workOrders && workOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.workOrderNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{order.technician || "-"}</TableCell>
                        <TableCell>R$ {parseFloat(order.totalValue as any).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            order.status === "completed" ? "bg-green-100 text-green-800" :
                            order.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            order.status === "delivered" ? "bg-purple-100 text-purple-800" :
                            order.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status === "open" ? "Aberta" :
                             order.status === "in_progress" ? "Em andamento" :
                             order.status === "completed" ? "Concluída" :
                             order.status === "delivered" ? "Entregue" :
                             "Cancelada"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {}}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteWorkOrderMutation.mutate({ id: order.id })}
                              disabled={deleteWorkOrderMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma ordem de serviço cadastrada</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Ordem
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
