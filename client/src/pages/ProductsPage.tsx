import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", type: "product" as const, price: "", cost: "", stock: 0, unit: "un",
  });

  const productsQuery = trpc.products.list.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setFormData({ name: "", description: "", type: "product", price: "", cost: "", stock: 0, unit: "un" });
      setShowForm(false);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => productsQuery.refetch(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("Nome e Preço são obrigatórios");
    await createMutation.mutateAsync(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Cadastrar Novo Produto/Serviço</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="p-2 border rounded">
                  <option value="product">Produto</option>
                  <option value="service">Serviço</option>
                </select>
                <Input placeholder="Preço (R$) *" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                <Input placeholder="Custo (R$)" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
                <Input type="number" placeholder="Estoque" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                <Input placeholder="Unidade" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
              </div>
              <textarea className="w-full p-2 border rounded" placeholder="Descrição" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Salvando..." : "Salvar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Lista de Produtos e Serviços</CardTitle></CardHeader>
        <CardContent>
          {productsQuery.isLoading ? <p>Carregando...</p> : productsQuery.data?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQuery.data.map((prod: any) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-medium">{prod.name}</TableCell>
                    <TableCell>{prod.type === "product" ? "Produto" : "Serviço"}</TableCell>
                    <TableCell>R$ {parseFloat(prod.price).toFixed(2)}</TableCell>
                    <TableCell>R$ {parseFloat(prod.cost || "0").toFixed(2)}</TableCell>
                    <TableCell>{prod.stock} {prod.unit}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ id: prod.id })}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-center text-gray-500">Nenhum produto cadastrado</p>}
        </CardContent>
      </Card>
    </div>
  );
}
