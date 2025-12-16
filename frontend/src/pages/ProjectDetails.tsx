import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, ListTodo, Users, UsersRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import TaskFormDialog from "@/components/projects/TaskFormDialog";
import TeamManagement from "@/components/projects/TeamManagement";
import EquipeManager from "@/components/projects/EquipeManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: number;
  data_inicio: string;
  data_fim_prevista?: string;
  responsavel?: number;
  responsavel_detalhes?: {
    id: number;
    nome: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  nao_iniciado: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  em_andamento: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  concluido: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelado: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const tarefaStatusColors: Record<string, string> = {
  nao_iniciado: "bg-gray-500/10 text-gray-600",
  em_andamento: "bg-yellow-500/10 text-yellow-600",
  concluida: "bg-green-500/10 text-green-600",
};

const tarefaStatusLabels: Record<string, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
};

const prioridadeLabels: Record<number, string> = {
  1: "Alta",
  2: "Média",
  3: "Baixa",
};

const prioridadeColors: Record<number, string> = {
  1: "bg-red-500/10 text-red-600",
  2: "bg-yellow-500/10 text-yellow-600",
  3: "bg-blue-500/10 text-blue-600",
};

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [projeto, setProjeto] = useState<any>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const user = authService.getUser();
  const isCreator = projeto?.created_by === user?.id;
  const canManage = user?.tipo_usuario === 'coordenador' && isCreator;

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    // Visitantes não podem acessar detalhes de projetos
    const user = authService.getUser();
    if (user?.tipo_usuario === 'visitante') {
      toast.error("Visitantes não têm acesso aos detalhes dos projetos. Visualize os projetos públicos.");
      navigate("/projetos-publicos");
      return;
    }

    fetchProjeto();
    fetchTarefas();
  }, [id, navigate]);

  const fetchProjeto = async () => {
    try {
      const response = await api.get(`/projetos/${id}/`);
      setProjeto(response.data);
    } catch (error) {
      toast.error("Erro ao carregar projeto");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTarefas = async () => {
    try {
      const response = await api.get(`/projetos/${id}/tarefas/`);
      setTarefas(response.data);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    }
  };

  const handleEditTask = (task: Tarefa) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.delete(`/tarefas/${taskId}/`);
        toast.success("Tarefa excluída com sucesso!");
        fetchTarefas();
      } catch (error) {
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!projeto) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-semibold">{projeto.nome}</h1>
              <p className="text-muted-foreground">{projeto.descricao}</p>
            </div>
            <Badge className={statusColors[projeto.status] || ""}>
              {statusLabels[projeto.status] || projeto.status}
            </Badge>
          </div>
          
          <div className="flex gap-4 text-sm text-muted-foreground">
            {projeto.criado_por && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Criado por: <span className="font-medium text-foreground">{projeto.criado_por.nome}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
            </div>
            {projeto.data_fim_prevista && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Término: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna principal - Tarefas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Tarefas
                  </CardTitle>
                  {canManage && (
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {tarefas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma tarefa cadastrada.</p>
                    {canManage && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Tarefa
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tarefas.map((tarefa) => (
                      <div
                        key={tarefa.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{tarefa.titulo}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{tarefa.descricao}</p>
                          <div className="flex gap-2 mt-2 flex-wrap items-center">
                            <Badge className={tarefaStatusColors[tarefa.status]}>
                              {tarefaStatusLabels[tarefa.status]}
                            </Badge>
                            <Badge className={prioridadeColors[tarefa.prioridade]}>
                              {prioridadeLabels[tarefa.prioridade]}
                            </Badge>
                            {tarefa.responsavel_detalhes && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                                👤 {tarefa.responsavel_detalhes.nome}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {canManage && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(tarefa)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(tarefa.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral - Equipe */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="participantes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participantes">
                  <Users className="h-4 w-4 mr-2" />
                  Participantes
                </TabsTrigger>
                <TabsTrigger value="equipes">
                  <UsersRound className="h-4 w-4 mr-2" />
                  Equipes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="participantes" className="mt-4">
                <TeamManagement
                  projetoId={parseInt(id!)}
                  professor={projeto?.professor_detalhes}
                  canManage={canManage}
                  onUpdate={fetchProjeto}
                />
              </TabsContent>
              
              <TabsContent value="equipes" className="mt-4">
                <EquipeManager
                  projetoId={parseInt(id!)}
                  participantes={projeto?.participantes_detalhes || []}
                  isCriador={isCreator}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <TaskFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        projetoId={parseInt(id!)}
        editingTask={editingTask}
        onSuccess={fetchTarefas}
      />
    </div>
  );
};

export default ProjectDetails;
