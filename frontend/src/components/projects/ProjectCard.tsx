import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim_prevista?: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado';
}

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColors: Record<string, string> = {
  nao_iniciado: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  em_andamento: "bg-green-500/10 text-green-600 border-green-500/20",
  concluido: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cancelado: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const ProjectCard = ({ project, canManage, onEdit, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full hover:shadow-medium transition-shadow">
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
            {project.nome}
          </CardTitle>
          <Badge variant="outline" className={statusColors[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{project.descricao}</p>

        {project.data_inicio && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(project.data_inicio).toLocaleDateString("pt-BR")}
              {project.data_fim_prevista && ` - ${new Date(project.data_fim_prevista).toLocaleDateString("pt-BR")}`}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/projects/${project.id}`)} 
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
        {canManage && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
