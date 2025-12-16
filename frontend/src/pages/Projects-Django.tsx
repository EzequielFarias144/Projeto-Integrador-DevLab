import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjetos } from '@/hooks/useProjetos';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProjectsDjango = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { projetos, loading, error } = useProjetos();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const getStatusColor = (status: string) => {
    const colors = {
      planejamento: 'bg-yellow-100 text-yellow-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planejamento: 'Planejamento',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {user?.nome || user?.username}!
          </p>
        </div>
        {user?.tipo_usuario === 'coordenador' && (
          <Button onClick={() => navigate('/projects/new')}>
            Novo Projeto
          </Button>
        )}
      </div>

      {projetos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              Nenhum projeto encontrado. Comece criando um novo projeto!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetos.map((projeto) => (
            <Card
              key={projeto.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${projeto.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{projeto.nome}</CardTitle>
                  <Badge className={getStatusColor(projeto.status)}>
                    {getStatusLabel(projeto.status)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {projeto.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Início:</strong>{' '}
                    {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <strong>Fim:</strong>{' '}
                    {new Date(projeto.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsDjango;
