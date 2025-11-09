import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function TechniciansPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", cpf: "", role: "", hourlyRate: "", notes: "",
  });

  const techniciansQuery = trpc.technicians.list.useQuery();
  const createMutation = trpc.technicians.create.useMutation({
    onSuccess: () => {
      techniciansQuery.refetch();
      setFormData({ name: "", email: "", phone: "", cpf: "", role: "", hourlyRate: "", notes: "" });
      setShowForm(false);
    },
  });

  const deleteMutation = trpc.technicians.delete.useMutation({
    onSuccess: () => techniciansQuery.refetch(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Nome é obrigatório");
    await createMutation.mutateAsync(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Técnicos e Funcionários</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Técnico
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Cadastrar Novo Técnico</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <Input placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <Input placeholder="CPF" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                <Input placeholder="Função" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                <Input placeholder="Valor/Hora (R$)" value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})} />
              </div>
              <textarea className="w-full p-2 border rounded" placeholder="Observações" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Salvando..." : "Salvar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Lista de Técnicos</CardTitle></CardHeader>
        <CardContent>
          {techniciansQuery.isLoading ? <p>Carregando...</p> : techniciansQuery.data?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Valor/Hora</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techniciansQuery.data.map((tech: any) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.role || "-"}</TableCell>
                    <TableCell>{tech.phone || "-"}</TableCell>
                    <TableCell>{tech.email || "-"}</TableCell>
                    <TableCell>R$ {parseFloat(tech.hourlyRate || "0").toFixed(2)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ id: tech.id })}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-center text-gray-500">Nenhum técnico cadastrado</p>}
        </CardContent>
      </Card>
    </div>
  );
}
