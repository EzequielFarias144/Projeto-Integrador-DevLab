import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projetosService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogIn, Calendar, Users } from "lucide-react";

interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim_prevista: string;
  status: string;
  is_public: boolean;
}

const PublicProjects = () => {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      setLoading(true);
      const data = await projetosService.listPublic();
      setProjetos(data);
    } catch (error: any) {
      toast.error("Erro ao carregar projetos públicos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      nao_iniciado: "Não Iniciado",
      planejamento: "Planejamento",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nao_iniciado: "bg-gray-500",
      planejamento: "bg-yellow-500",
      em_andamento: "bg-blue-500",
      concluido: "bg-green-500",
      cancelado: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">DevLab - Projetos Públicos</h1>
              <p className="text-muted-foreground">Explore os projetos compartilhados pela comunidade</p>
            </div>
            <Button onClick={() => navigate("/auth")} className="gap-2">
              <LogIn className="h-4 w-4" />
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : projetos.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Nenhum Projeto Público Disponível</CardTitle>
              <CardDescription>
                Ainda não há projetos públicos para visualização. Faça login para ver todos os projetos
                ou aguarde novos projetos serem compartilhados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projetos.map((projeto) => (
              <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{projeto.nome}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                        projeto.status
                      )}`}
                    >
                      {getStatusLabel(projeto.status)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{projeto.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Projeto Público</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    Faça login para ver mais detalhes e participar
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {projetos.length > 0 && (
          <div className="mt-8 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Quer participar dos projetos?</CardTitle>
                <CardDescription>
                  Faça login ou crie uma conta para ter acesso completo a todos os recursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/auth")} className="w-full sm:w-auto">
                  <LogIn className="h-4 w-4 mr-2" />
                  Acessar Plataforma
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProjects;
