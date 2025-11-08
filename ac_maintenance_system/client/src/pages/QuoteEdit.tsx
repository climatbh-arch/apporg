import { useState } from "react";
import { useRoute, useLocation } from "wouter";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function QuoteEdit() {
  const [, params] = useRoute("/quotes/:id");
  const [, navigate] = useLocation();
  const quoteId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    clientName: "João Silva",
    description: "Orçamento para manutenção de ar condicionado",
    items: [
      { id: 1, description: "Manutenção preventiva", quantity: 1, unitPrice: 150 },
      { id: 2, description: "Limpeza de filtro", quantity: 2, unitPrice: 50 },
    ] as QuoteItem[],
    notes: "",
    status: "pending",
  });

  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pendente" },
    { value: "approved", label: "Aprovado" },
    { value: "rejected", label: "Rejeitado" },
  ];

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleAddItem = () => {
    if (!newItem.description.trim()) {
      toast.error("Descrição do item é obrigatória");
      return;
    }

    if (newItem.quantity <= 0 || newItem.unitPrice < 0) {
      toast.error("Quantidade e preço devem ser válidos");
      return;
    }

    const item: QuoteItem = {
      id: Date.now(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
    };

    setFormData({
      ...formData,
      items: [...formData.items, item],
    });

    setNewItem({ description: "", quantity: 1, unitPrice: 0 });
    toast.success("Item adicionado com sucesso!");
  };

  const handleRemoveItem = (itemId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    });
    toast.success("Item removido!");
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um item ao orçamento");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Orçamento atualizado com sucesso!");
      navigate("/quotes");
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find((opt) => opt.value === status)?.label || status;
  };

  if (!quoteId) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Orçamento não encontrado</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const total = calculateTotal();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Orçamento</h1>
            <p className="text-muted-foreground">Orçamento #{quoteId}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Description */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Cliente *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição do Serviço *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descreva o serviço"
                    className="mt-1 min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-20">Qtd</TableHead>
                        <TableHead className="w-24">Preço Unit.</TableHead>
                        <TableHead className="w-24">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            R$ {item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            R$ {(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Add New Item */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium text-sm">Adicionar Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Descrição"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Quantidade"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Preço"
                      step="0.01"
                      min="0"
                      value={newItem.unitPrice}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleAddItem}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Observações adicionais"
                  className="min-h-20"
                />
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
                    Salvar Orçamento
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/quotes")}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Total */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  R$ {total.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className={`${getStatusColor(formData.status)} w-full justify-center py-2`}>
                  {getStatusLabel(formData.status)}
                </Badge>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itens</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
