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
import { Plus, Trash2, Edit2, Wrench } from "lucide-react";
import { toast } from "sonner";

export default function Equipments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    clientId: 0,
    brand: "",
    model: "",
    btu: 0,
    type: "split" as const,
    serialNumber: "",
    installationDate: "",
    lastMaintenanceDate: "",
    notes: "",
  });

  // Queries
  const clientsQuery = trpc.clients.list.useQuery();
  const equipmentsQuery = trpc.equipments.getByClientId.useQuery(
    { clientId: selectedClientId || 0 },
    { enabled: !!selectedClientId }
  );

  const createEquipmentMutation = trpc.equipments.create.useMutation({
    onSuccess: () => {
      equipmentsQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Equipamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar equipamento");
    },
  });

  const updateEquipmentMutation = trpc.equipments.update.useMutation({
    onSuccess: () => {
      equipmentsQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Equipamento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar equipamento");
    },
  });

  const deleteEquipmentMutation = trpc.equipments.delete.useMutation({
    onSuccess: () => {
      equipmentsQuery.refetch();
      toast.success("Equipamento deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar equipamento");
    },
  });

  const clients = clientsQuery.data || [];
  const equipments = equipmentsQuery.data || [];

  const resetForm = () => {
    setFormData({
      clientId: selectedClientId || 0,
      brand: "",
      model: "",
      btu: 0,
      type: "split",
      serialNumber: "",
      installationDate: "",
      lastMaintenanceDate: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand.trim() || !formData.model.trim()) {
      toast.error("Marca e modelo são obrigatórios");
      return;
    }

    if (editingId) {
      await updateEquipmentMutation.mutateAsync({
        id: editingId,
        ...formData,
        installationDate: formData.installationDate
          ? new Date(formData.installationDate)
          : undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate
          ? new Date(formData.lastMaintenanceDate)
          : undefined,
      });
    } else {
      await createEquipmentMutation.mutateAsync({
        ...formData,
        installationDate: formData.installationDate
          ? new Date(formData.installationDate)
          : undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate
          ? new Date(formData.lastMaintenanceDate)
          : undefined,
      });
    }
  };

  const handleEdit = (equipment: typeof equipments[0]) => {
    setFormData({
      clientId: equipment.clientId,
      brand: equipment.brand,
      model: equipment.model,
      btu: equipment.btu,
      type: equipment.type as any,
      serialNumber: equipment.serialNumber || "",
      installationDate: equipment.installationDate
        ? new Date(equipment.installationDate).toISOString().split("T")[0]
        : "",
      lastMaintenanceDate: equipment.lastMaintenanceDate
        ? new Date(equipment.lastMaintenanceDate).toISOString().split("T")[0]
        : "",
      notes: equipment.notes || "",
    });
    setEditingId(equipment.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este equipamento?")) {
      deleteEquipmentMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os equipamentos de ar condicionado dos clientes
            </p>
          </div>
          {selectedClientId && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Equipamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Equipamento" : "Novo Equipamento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Atualize as informações do equipamento"
                      : "Preencha os dados do novo equipamento"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Brand and Model */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Marca *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        placeholder="LG, Samsung, Daikin..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Modelo *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        placeholder="Modelo do equipamento"
                        required
                      />
                    </div>
                  </div>

                  {/* BTU and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btu">BTU</Label>
                      <Input
                        id="btu"
                        type="number"
                        value={formData.btu}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            btu: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="12000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="split">Split</SelectItem>
                          <SelectItem value="window">Janela</SelectItem>
                          <SelectItem value="portable">Portátil</SelectItem>
                          <SelectItem value="floor_ceiling">Piso/Teto</SelectItem>
                          <SelectItem value="cassette">Cassete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Serial Number */}
                  <div>
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, serialNumber: e.target.value })
                      }
                      placeholder="Número de série (opcional)"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="installationDate">Data de Instalação</Label>
                      <Input
                        id="installationDate"
                        type="date"
                        value={formData.installationDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            installationDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastMaintenanceDate">
                        Última Manutenção
                      </Label>
                      <Input
                        id="lastMaintenanceDate"
                        type="date"
                        value={formData.lastMaintenanceDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastMaintenanceDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Notas adicionais"
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
                        createEquipmentMutation.isPending ||
                        updateEquipmentMutation.isPending
                      }
                    >
                      {editingId ? "Atualizar" : "Criar"} Equipamento
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Client Selection */}
        <div>
          <Label htmlFor="clientSelect">Selecione um Cliente</Label>
          <Select
            value={selectedClientId?.toString() || ""}
            onValueChange={(value) => {
              setSelectedClientId(value ? parseInt(value) : null);
            }}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Escolha um cliente para ver seus equipamentos" />
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

        {/* Equipments List */}
        {selectedClientId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentsQuery.isLoading ? (
              <>
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </>
            ) : equipments.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum equipamento cadastrado para este cliente
                  </p>
                </CardContent>
              </Card>
            ) : (
              equipments.map((equipment) => (
                <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {equipment.brand} {equipment.model}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {equipment.type === "split"
                            ? "Split"
                            : equipment.type === "window"
                            ? "Janela"
                            : equipment.type === "portable"
                            ? "Portátil"
                            : equipment.type === "floor_ceiling"
                            ? "Piso/Teto"
                            : "Cassete"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(equipment)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(equipment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">{equipment.btu} BTU</span>
                    </div>
                    {equipment.serialNumber && (
                      <div className="text-xs text-muted-foreground">
                        Série: {equipment.serialNumber}
                      </div>
                    )}
                    {equipment.installationDate && (
                      <div className="text-xs text-muted-foreground">
                        Instalado:{" "}
                        {new Date(equipment.installationDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    )}
                    {equipment.lastMaintenanceDate && (
                      <div className="text-xs text-muted-foreground">
                        Última manutenção:{" "}
                        {new Date(
                          equipment.lastMaintenanceDate
                        ).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                    {equipment.notes && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {equipment.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Selecione um cliente para gerenciar seus equipamentos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
