import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Wrench, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sistema de Orçamentos e OS</h1>
              <p className="text-muted-foreground mt-1">Gerenciamento completo para sua empresa</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bem-vindo,</p>
              <p className="font-semibold text-foreground">{user?.name || "Usuário"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setLocation("/")}
              className="py-4 px-2 border-b-2 border-primary font-medium text-foreground hover:text-primary transition"
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
              className="py-4 px-2 border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground transition"
            >
              Ordens de Serviço
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Orçamentos Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Orçamentos</CardTitle>
                  <CardDescription>Gerencie seus orçamentos</CardDescription>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalQuotes || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Aprovados</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.quotesApproved || 0}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation("/quotes")}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ordens de Serviço Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ordens de Serviço</CardTitle>
                  <CardDescription>Acompanhe suas ordens</CardDescription>
                </div>
                <Wrench className="w-8 h-8 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total de Ordens</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalWorkOrders || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.workOrdersCompleted || 0}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setLocation("/work-orders")}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ordem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
            <CardDescription>Visão geral do seu negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Orçamentos</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalQuotes || 0}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.quotesApproved || 0}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Ordens</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalWorkOrders || 0}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.workOrdersCompleted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
