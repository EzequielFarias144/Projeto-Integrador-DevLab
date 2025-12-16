import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjetos } from "@/hooks/useProjetos";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";

const Projects = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    // Visitantes não podem acessar projetos internos
    const user = authService.getUser();
    if (user?.tipo_usuario === 'visitante') {
      toast.error("Visitantes não têm acesso aos projetos internos. Visualize os projetos públicos.");
      navigate("/projetos-publicos");
      return;
    }
  }, [navigate]);

  const { projetos, loading, deleteProjeto } = useProjetos();
  const user = authService.getUser();
  const isCoordenador = user?.tipo_usuario === 'coordenador';

  const handleEdit = (project: any) => {
    // Verifica se o usuário é o criador do projeto
    if (project.created_by !== user?.id) {
      toast.error("Apenas o coordenador que criou o projeto pode modificá-lo");
      return;
    }
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: number, project: any) => {
    // Verifica se o usuário é o criador do projeto
    if (project.created_by !== user?.id) {
      toast.error("Apenas o coordenador que criou o projeto pode excluí-lo");
      return;
    }
    
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      try {
        await deleteProjeto(projectId);
        toast.success("Projeto excluído com sucesso!");
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Erro ao excluir projeto");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-heading font-semibold">Projetos</h1>
          </div>
          {isCoordenador && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !projetos || projetos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum projeto encontrado.</p>
            {isCoordenador && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(projetos) && projetos.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                canManage={isCoordenador && project.created_by === user?.id}
                onEdit={() => handleEdit(project)}
                onDelete={() => handleDelete(project.id, project)}
              />
            ))}
          </div>
        )}
      </main>

      <ProjectFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        editingProject={editingProject}
      />
    </div>
  );
};

export default Projects;
