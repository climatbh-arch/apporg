import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Asset {
  id: number;
  serialNumber: string;
  brand: string;
  model: string;
  capacity?: string;
  installationDate?: string;
  warrantyDate?: string;
  physicalLocation?: string;
  nextMaintenanceDate?: string;
  assetType: string;
  status: string;
  clientId: number;
  clientName?: string;
}

export default function AssetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    serialNumber: "",
    brand: "",
    model: "",
    capacity: "",
    installationDate: "",
    warrantyDate: "",
    physicalLocation: "",
    nextMaintenanceDate: "",
    clientId: "",
    assetType: "air_conditioner",
    status: "active",
  });

  const queryClient = useQueryClient();

  // Query para buscar ativos
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["/api/assets"],
  });

  // Mutation para criar/atualizar ativo
  const createAssetMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar ativo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast.success("Ativo criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar ativo");
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar ativo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast.success("Ativo atualizado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar ativo");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar ativo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast.success("Ativo deletado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deletar ativo");
    },
  });

  const resetForm = () => {
    setFormData({
      serialNumber: "",
      brand: "",
      model: "",
      capacity: "",
      installationDate: "",
      warrantyDate: "",
      physicalLocation: "",
      nextMaintenanceDate: "",
      clientId: "",
      assetType: "air_conditioner",
      status: "active",
    });
    setEditingAsset(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: formData });
    } else {
      createAssetMutation.mutate(formData);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      serialNumber: asset.serialNumber,
      brand: asset.brand,
      model: asset.model,
      capacity: asset.capacity || "",
      installationDate: asset.installationDate || "",
      warrantyDate: asset.warrantyDate || "",
      physicalLocation: asset.physicalLocation || "",
      nextMaintenanceDate: asset.nextMaintenanceDate || "",
      clientId: asset.clientId.toString(),
      assetType: asset.assetType,
      status: asset.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este ativo?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  const getMaintenanceStatus = (nextDate?: string) => {
    if (!nextDate) return { label: "Não agendada", variant: "secondary" as const };
    
    const date = new Date(nextDate);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { label: "Atrasada", variant: "destructive" as const };
    if (daysUntil <= 7) return { label: `${daysUntil} dias`, variant: "destructive" as const };
    if (daysUntil <= 30) return { label: `${daysUntil} dias`, variant: "warning" as const };
    return { label: `${daysUntil} dias`, variant: "default" as const };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Ativos</h1>
          <p className="text-muted-foreground">
            Gerencie equipamentos e agende manutenções preventivas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? "Editar Ativo" : "Novo Ativo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Série *</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">ID do Cliente *</Label>
                  <Input
                    id="clientId"
                    type="number"
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (BTUs)</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="Ex: 12000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetType">Tipo de Ativo</Label>
                  <Select
                    value={formData.assetType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assetType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air_conditioner">Ar Condicionado</SelectItem>
                      <SelectItem value="refrigeration">Refrigeração</SelectItem>
                      <SelectItem value="ventilation">Ventilação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="physicalLocation">Localização Física</Label>
                <Input
                  id="physicalLocation"
                  value={formData.physicalLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, physicalLocation: e.target.value })
                  }
                  placeholder="Ex: Sala 101, 2º andar"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installationDate">Data de Instalação</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, installationDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyDate">Garantia até</Label>
                  <Input
                    id="warrantyDate"
                    type="date"
                    value={formData.warrantyDate}
                    onChange={(e) =>
                      setFormData({ ...formData, warrantyDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMaintenanceDate">Próxima MP</Label>
                  <Input
                    id="nextMaintenanceDate"
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextMaintenanceDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAsset ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ativos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : assets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum ativo cadastrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Série</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Próxima MP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset: Asset) => {
                  const maintenanceStatus = getMaintenanceStatus(
                    asset.nextMaintenanceDate
                  );
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {asset.serialNumber}
                      </TableCell>
                      <TableCell>
                        {asset.brand} {asset.model}
                      </TableCell>
                      <TableCell>{asset.capacity || "-"}</TableCell>
                      <TableCell>{asset.physicalLocation || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={maintenanceStatus.variant}>
                          <Calendar className="mr-1 h-3 w-3" />
                          {maintenanceStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.status === "active" ? "default" : "secondary"
                          }
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
