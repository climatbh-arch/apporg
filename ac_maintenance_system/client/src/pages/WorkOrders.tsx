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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, Trash2, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { translations } from "@/lib/translations";

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    clientName: string;
    description: string;
    totalValue: number;
    status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  }>({
    clientName: "",
    description: "",
    totalValue: 0,
    status: "pending",
  });

  const ordersQuery = trpc.workOrders?.list?.useQuery?.() || { data: [], isLoading: false };
  const orders = ordersQuery.data || [];

  const filteredOrders = orders.filter(
    (order: any) =>
      order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      clientName: "",
      description: "",
      totalValue: 0,
      status: "pending",
    });
    setEditingId(null);
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
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovada";
      case "in_progress":
        return "Em Progresso";
      case "completed":
        return "Concluída";
      case "cancelled":
        return "Cancelada";
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
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os serviços executados
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
                Nova Ordem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Ordem" : "Nova Ordem de Serviço"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize as informações da ordem"
                    : "Preencha os dados da nova ordem de serviço"}
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Cliente *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do serviço"
                  />
                </div>

                <div>
                  <Label htmlFor="totalValue">Valor Total</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalValue: parseFloat(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setIsDialogOpen(false)}>
                    {translations.messages.cancel}
                  </Button>
                  <Button type="submit">
                    {translations.messages.save}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Pesquisar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Orders List */}
        <div className="grid gap-4">
          {ordersQuery.isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{order.clientName}</CardTitle>
                    <CardDescription>{order.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        R$ {order.totalValue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
