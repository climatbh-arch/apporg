import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Zap, Users, Wrench, BarChart3 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
            <p className="text-gray-600">Bem-vindo, {user.name}!</p>
          </div>

          <Card className="p-8 shadow-lg">
            <p className="text-gray-700 mb-6">
              Você está autenticado e pronto para usar o sistema. Acesse o menu de navegação para começar.
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Ir para o Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10 rounded" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Gestão Completa de Manutenção e Instalação de AC
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sistema profissional para controlar clientes, equipamentos, orçamentos, estoque e financeiro em um único lugar.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Gestão de Clientes</h3>
                  <p className="text-gray-600 text-sm">Cadastre e acompanhe todos os seus clientes</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Wrench className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Controle de Equipamentos</h3>
                  <p className="text-gray-600 text-sm">Registre e monitore todos os equipamentos</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Orçamentos e Ordens de Serviço</h3>
                  <p className="text-gray-600 text-sm">Crie e gerencie orçamentos com PDF automático</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Relatórios e Análises</h3>
                  <p className="text-gray-600 text-sm">Visualize métricas e desempenho do seu negócio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md p-8 shadow-xl">
              <div className="text-center mb-8">
                <img src={APP_LOGO} alt="Logo" className="w-16 h-16 rounded mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
                <p className="text-gray-600 text-sm mt-2">Faça login para acessar o sistema</p>
              </div>

              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                size="lg"
              >
                Fazer Login
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Você será redirecionado para autenticação segura
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Clientes</h3>
            <p className="text-gray-600 text-sm">Gerencie informações de clientes residenciais e comerciais</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Equipamentos</h3>
            <p className="text-gray-600 text-sm">Registre histórico de manutenção e instalações</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Financeiro</h3>
            <p className="text-gray-600 text-sm">Acompanhe receitas, despesas e lucro</p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
