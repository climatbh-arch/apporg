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
import { Plus, Package, AlertTriangle, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other" as const,
    quantity: 0,
    minimumQuantity: 0,
    unitPrice: "",
    supplier: "",
  });

  // Queries
  const inventoryQuery = trpc.inventory.list.useQuery();

  const createInventoryMutation = trpc.inventory.create.useMutation({
    onSuccess: () => {
      inventoryQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Item de estoque criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar item de estoque");
    },
  });

  const updateInventoryMutation = trpc.inventory.update.useMutation({
    onSuccess: () => {
      inventoryQuery.refetch();
      resetForm();
      setIsDialogOpen(false);
      toast.success("Item de estoque atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar item de estoque");
    },
  });

  const inventory = inventoryQuery.data || [];
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minimumQuantity);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      quantity: 0,
      minimumQuantity: 0,
      unitPrice: "",
      supplier: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome do item é obrigatório");
      return;
    }

    if (editingId) {
      await updateInventoryMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        minimumQuantity: formData.minimumQuantity,
        unitPrice: formData.unitPrice,
        supplier: formData.supplier,
      });
    } else {
      await createInventoryMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (item: typeof inventory[0]) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category as any,
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier || "",
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      condenser: "Condensadora",
      tubing: "Tubulação",
      gas: "Gás",
      connector: "Conector",
      support: "Suporte",
      filter: "Filtro",
      compressor: "Compressor",
      other: "Outro",
    };
    return labels[category] || category;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o estoque de peças e produtos
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
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Item de Estoque" : "Novo Item de Estoque"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize as informações do item"
                    : "Preencha os dados do novo item"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Nome do Item *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nome do item"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="condenser">Condensadora</SelectItem>
                      <SelectItem value="tubing">Tubulação</SelectItem>
                      <SelectItem value="gas">Gás</SelectItem>
                      <SelectItem value="connector">Conector</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                      <SelectItem value="filter">Filtro</SelectItem>
                      <SelectItem value="compressor">Compressor</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumQuantity">Quantidade Mínima</Label>
                    <Input
                      id="minimumQuantity"
                      type="number"
                      value={formData.minimumQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumQuantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Unit Price */}
                <div>
                  <Label htmlFor="unitPrice">Preço Unitário</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    placeholder="Nome do fornecedor"
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
                    placeholder="Descrição do item"
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
                      createInventoryMutation.isPending ||
                      updateInventoryMutation.isPending
                    }
                  >
                    {editingId ? "Atualizar" : "Criar"} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Itens com Estoque Crítico</h3>
              <p className="text-sm text-red-800">
                {lowStockItems.length} item(ns) com quantidade abaixo do mínimo
              </p>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          {inventoryQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : inventory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum item de estoque cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Quantidade</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Mínimo</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Preço Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fornecedor</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b hover:bg-muted/50 transition-colors ${
                        item.quantity <= item.minimumQuantity ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getCategoryLabel(item.category)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            item.quantity <= item.minimumQuantity
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{item.minimumQuantity}</td>
                      <td className="px-4 py-3 text-right">
                        R$ {parseFloat(item.unitPrice.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.supplier || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
