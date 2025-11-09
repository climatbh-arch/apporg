import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Download, Send, CheckCircle, Edit2, Copy, Trash2, Search } from "lucide-react";

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    equipmentId: "",
    serviceType: "maintenance" as const,
    description: "",
    technician: "",
    totalValue: "",
    laborHours: "",
    laborValue: "",
  });
  const [materials, setMaterials] = useState<Array<{ name: string; quantity: string; value: string }>>([]);
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: "", value: "" });

  const workOrdersQuery = trpc.workOrders.list.useQuery();
  const clientsQuery = trpc.clients.list.useQuery();
  const equipmentsQuery = trpc.equipments.list.useQuery();
  const createWorkOrderMutation = trpc.workOrders.create.useMutation();

  const workOrders = workOrdersQuery.data || [];
  const clients = clientsQuery.data || [];
  const equipments = equipmentsQuery.data || [];

  const filteredWorkOrders = workOrders.filter((wo) =>
    wo.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.quantity && newMaterial.value) {
      setMaterials([...materials, newMaterial]);
      setNewMaterial({ name: "", quantity: "", value: "" });
      toast.success("Material adicionado!");
    } else {
      toast.error("Preencha todos os campos do material");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const materialsTotal = materials.reduce((sum, mat) => {
      return sum + parseFloat(mat.quantity || "0") * parseFloat(mat.value || "0");
    }, 0);
    const laborTotal = parseFloat(formData.laborHours || "0") * parseFloat(formData.laborValue || "0");
    return materialsTotal + laborTotal;
  };

  const handleCreateWorkOrder = async () => {
    if (!formData.clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    try {
      await createWorkOrderMutation.mutateAsync({
        clientId: parseInt(formData.clientId),
        equipmentId: formData.equipmentId ? parseInt(formData.equipmentId) : undefined,
        serviceType: formData.serviceType,
        description: formData.description,
        technician: formData.technician,
        totalValue: calculateTotal().toString(),
      });

      toast.success("Ordem de Serviço criada com sucesso!");
      setShowForm(false);
      setFormData({
        clientId: "",
        equipmentId: "",
        serviceType: "maintenance",
        description: "",
        technician: "",
        totalValue: "",
        laborHours: "",
        laborValue: "",
      });
      setMaterials([]);
      workOrdersQuery.refetch();
    } catch (error) {
      toast.error("Erro ao criar ordem de serviço");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie suas ordens de serviço profissionalmente</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Ordem
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Ordem de Serviço</CardTitle>
            <CardDescription>Preencha os dados da ordem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cliente */}
            <div>
              <Label>Cliente *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
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

            {/* Equipamento */}
            <div>
              <Label>Equipamento</Label>
              <Select value={formData.equipmentId} onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.brand} - {eq.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <Label>Tipo de Serviço *</Label>
              <Select value={formData.serviceType} onValueChange={(value: any) => setFormData({ ...formData, serviceType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="repair">Reparo</SelectItem>
                  <SelectItem value="installation">Instalação</SelectItem>
                  <SelectItem value="cleaning">Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Técnico */}
            <div>
              <Label>Técnico Responsável</Label>
              <Input
                placeholder="Nome do técnico"
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
              />
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição do Serviço</Label>
              <Textarea
                placeholder="Descreva o serviço executado"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Materiais */}
            <div className="space-y-2">
              <Label>Materiais Utilizados</Label>
              <div className="space-y-2">
                {materials.map((mat, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-muted rounded">
                    <span className="flex-1">{mat.name}</span>
                    <span>Qtd: {mat.quantity}</span>
                    <span>R$ {parseFloat(mat.value).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Novo Material */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do material"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                />
                <Input
                  placeholder="Qtd"
                  type="number"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                  className="w-20"
                />
                <Input
                  placeholder="Valor"
                  type="number"
                  value={newMaterial.value}
                  onChange={(e) => setNewMaterial({ ...newMaterial, value: e.target.value })}
                  className="w-24"
                />
                <Button onClick={handleAddMaterial} variant="outline">
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Mão de Obra */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horas de Trabalho</Label>
                <Input
                  type="number"
                  placeholder="Horas"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor/Hora (R$)</Label>
                <Input
                  type="number"
                  placeholder="Valor"
                  value={formData.laborValue}
                  onChange={(e) => setFormData({ ...formData, laborValue: e.target.value })}
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={handleCreateWorkOrder} className="flex-1">
                Criar Ordem de Serviço
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número da OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Ordens */}
      <div className="grid gap-4">
        {filteredWorkOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </CardContent>
          </Card>
        ) : (
          filteredWorkOrders.map((wo) => (
            <Card key={wo.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{wo.workOrderNumber}</CardTitle>
                    <CardDescription>{wo.description}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    wo.status === "completed" ? "bg-green-100 text-green-800" :
                    wo.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {wo.status === "pending" ? "Aberta" :
                     wo.status === "in_progress" ? "Em andamento" :
                     wo.status === "completed" ? "Concluída" :
                     wo.status === "cancelled" ? "Cancelada" : wo.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">R$ {parseFloat(wo.totalValue || "0").toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Técnico</p>
                    <p className="text-lg font-semibold">{wo.technician || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-lg font-semibold">{wo.serviceType}</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Concluir
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
