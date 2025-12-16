import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, projetosService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, FileText, CheckCircle, Clock, AlertCircle, Trophy } from "lucide-react";
import { toast } from "sonner";

interface RelatorioData {
  projetos: {
    total: number;
    em_andamento: number;
    concluidos: number;
    planejamento: number;
    cancelados: number;
  };
  usuarios: {
    total_estudantes: number;
    estudantes_ativos: number;
    total_professores: number;
    total_coordenadores: number;
  };
  tarefas: {
    total: number;
    pendentes: number;
    em_andamento: number;
    concluidas: number;
  };
  rankings: {
    projetos_por_coordenador: Array<{
      created_by__nome: string;
      created_by__id: number;
      total: number;
    }>;
    professores_ativos: Array<{
      professor__nome: string;
      professor__id: number;
      total_projetos: number;
    }>;
    estudantes_participativos: Array<{
      usuario__nome: string;
      usuario__id: number;
      total_projetos: number;
    }>;
  };
  participacoes: {
    total_participacoes_ativas: number;
  };
}

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);

  useEffect(() => {
    const user = authService.getUser();
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    if (user?.tipo_usuario !== 'coordenador') {
      toast.error("Apenas coordenadores podem acessar relatórios");
      navigate("/dashboard");
      return;
    }

    fetchRelatorios();
  }, [navigate]);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const data = await projetosService.getRelatorios();
      setRelatorio(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!relatorio) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-2xl font-heading font-semibold">Relatórios Gerais de Participação</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas de Projetos */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Projetos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.projetos.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.projetos.em_andamento}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.projetos.concluidos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planejamento</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.projetos.planejamento}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.projetos.cancelados}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estatísticas de Usuários */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Usuários</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.usuarios.total_estudantes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes Ativos</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.usuarios.estudantes_ativos}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((relatorio.usuarios.estudantes_ativos / relatorio.usuarios.total_estudantes) * 100).toFixed(1)}% dos estudantes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.usuarios.total_professores}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coordenadores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.usuarios.total_coordenadores}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estatísticas de Tarefas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tarefas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.tarefas.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.tarefas.pendentes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.tarefas.em_andamento}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.tarefas.concluidas}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((relatorio.tarefas.concluidas / relatorio.tarefas.total) * 100).toFixed(1)}% concluídas
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Participações */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Participações</h2>
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participações Ativas</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.participacoes.total_participacoes_ativas}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de vínculos ativos entre estudantes e projetos
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rankings */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Rankings</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Top Coordenadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Coordenadores
                </CardTitle>
                <CardDescription>Coordenadores com mais projetos criados</CardDescription>
              </CardHeader>
              <CardContent>
                {relatorio.rankings.projetos_por_coordenador.length > 0 ? (
                  <ul className="space-y-2">
                    {relatorio.rankings.projetos_por_coordenador.map((coord, idx) => (
                      <li key={coord.created_by__id} className="flex justify-between items-center">
                        <span className="text-sm">
                          {idx + 1}. {coord.created_by__nome}
                        </span>
                        <span className="text-sm font-semibold">{coord.total} projetos</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum coordenador com projetos</p>
                )}
              </CardContent>
            </Card>

            {/* Professores Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  Professores Ativos
                </CardTitle>
                <CardDescription>Professores orientando mais projetos</CardDescription>
              </CardHeader>
              <CardContent>
                {relatorio.rankings.professores_ativos.length > 0 ? (
                  <ul className="space-y-2">
                    {relatorio.rankings.professores_ativos.map((prof, idx) => (
                      <li key={prof.professor__id} className="flex justify-between items-center">
                        <span className="text-sm">
                          {idx + 1}. {prof.professor__nome}
                        </span>
                        <span className="text-sm font-semibold">{prof.total_projetos} projetos</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum professor orientando projetos</p>
                )}
              </CardContent>
            </Card>

            {/* Estudantes Participativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-500" />
                  Estudantes Participativos
                </CardTitle>
                <CardDescription>Estudantes em mais projetos</CardDescription>
              </CardHeader>
              <CardContent>
                {relatorio.rankings.estudantes_participativos.length > 0 ? (
                  <ul className="space-y-2">
                    {relatorio.rankings.estudantes_participativos.map((est, idx) => (
                      <li key={est.usuario__id} className="flex justify-between items-center">
                        <span className="text-sm">
                          {idx + 1}. {est.usuario__nome}
                        </span>
                        <span className="text-sm font-semibold">{est.total_projetos} projetos</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum estudante participando de projetos</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reports;
