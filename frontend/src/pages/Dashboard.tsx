import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FolderKanban, User, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se está autenticado
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    // Visitantes não podem acessar o dashboard
    const user = authService.getUser();
    if (user?.tipo_usuario === 'visitante') {
      toast.error("Visitantes não têm acesso ao dashboard. Visualize os projetos públicos.");
      navigate("/projetos-publicos");
      return;
    }
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        navigate("/auth");
        return null;
      }
    },
  });

  const handleSignOut = () => {
    authService.logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Página Inicial
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-soft">
            <h2 className="text-xl font-heading mb-4">Bem-vindo, {profile?.nome || "Usuário"}!</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="font-semibold text-foreground">Email:</span> {profile?.email}</p>
              <p><span className="font-semibold text-foreground">Tipo:</span> {profile?.tipo_usuario}</p>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-soft">
            <h3 className="text-lg font-heading mb-4">Acesso Rápido</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/projects")}
              >
                <FolderKanban className="h-8 w-8 text-primary" />
                <span className="font-medium">Projetos</span>
                <span className="text-sm text-muted-foreground">Visualizar e gerenciar projetos</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/profile")}
              >
                <User className="h-8 w-8 text-primary" />
                <span className="font-medium">Meu Perfil</span>
                <span className="text-sm text-muted-foreground">Editar informações pessoais</span>
              </Button>
              {profile?.tipo_usuario === 'coordenador' && (
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => navigate("/relatorios")}
                >
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <span className="font-medium">Relatórios</span>
                  <span className="text-sm text-muted-foreground">Visualizar estatísticas gerais</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
