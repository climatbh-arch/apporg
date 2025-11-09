import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Wrench, Users, BarChart3, LogOut } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{APP_TITLE}</CardTitle>
            <CardDescription>Sistema Profissional de Gestão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Gerencie seus orçamentos e ordens de serviço de forma profissional e organizada.
            </p>
            <Button 
              onClick={() => window.location.href = getLoginUrl()} 
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.name || "Usuário"}</p>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Acesse os módulos do sistema</p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Orçamentos */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/quotes")}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-6 h-6 text-blue-500" />
                <CardTitle>Orçamentos</CardTitle>
              </div>
              <CardDescription>Gerencie seus orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie, edite e acompanhe orçamentos com cálculos automáticos.
              </p>
            </CardContent>
          </Card>

          {/* Ordens de Serviço */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/work-orders")}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-6 h-6 text-green-500" />
                <CardTitle>Ordens de Serviço</CardTitle>
              </div>
              <CardDescription>Gerencie suas ordens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Controle materiais, mão de obra e status das ordens.
              </p>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-purple-500" />
                <CardTitle>Clientes</CardTitle>
              </div>
              <CardDescription>Gerencie seus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cadastre e organize informações de clientes.
              </p>
            </CardContent>
          </Card>

          {/* Relatórios */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                <CardTitle>Relatórios</CardTitle>
              </div>
              <CardDescription>Visualize estatísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhe resumos e estatísticas do sistema.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="mt-8 p-6 bg-primary/5 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/quotes")} className="gap-2">
              <FileText className="w-4 h-4" />
              Novo Orçamento
            </Button>
            <Button onClick={() => navigate("/work-orders")} variant="outline" className="gap-2">
              <Wrench className="w-4 h-4" />
              Nova Ordem de Serviço
            </Button>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Ver Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
