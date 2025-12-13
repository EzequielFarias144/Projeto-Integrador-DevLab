from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from projetos.models import Projeto
from projetos.serializers import ProjetoSerializer

class ProjetoPaginacao(PageNumberPagination):
    # Ele define quantos projetos vai ser retornado por página (o padrão e: 10)
    page_size = 10
    # Ele permite que o cliente especifique o tamanho da página via query param
    page_size_query_param = "tamanho"
    # Define o número máximo de itens que podem ser solicitados por página
    max_page_size = 100
    
class ProjetoViewSet(viewsets.ModelViewSet):
    # Aqui ele decide o grupo de dados base para as consultas
    queryset = Projeto.objects.all()
    # Aquie le define qual serializer será usado para converter os dados
    serializer_class = ProjetoSerializer
    # Essas são as Permissões: os usuários autenticados podem editar, não autenticados só podem ler
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    #Aqui ele define a classe de paginação customizadas
    pagination_class = ProjetoPaginacao
    # Aqui ele habilita filtros de busca e ordenação
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # Nesse daqui vamos definir em quais campos a busca pode ser feita
    search_fields = ['nome', 'descricao', 'status']
    # Essa parte vai definir quais campos podem ser usados para ordenação 
    ordering_fields = ['data_inicio', 'data_fim_prevista', 'nome']
    # e por aqui temos a ordenação padrão (por data de início)
    ordering = ['data_inicio']
    
    def get_queryset(self):
        # Esse vai pegar o parâmetro 'status' da URL (se existir)
        status = self.request.query_params.get('status')
        # E esse vai buscar todos os projetos inicialmente
        projetos = Projeto.objects.all()
        # nesse daqui se o status foi informado, ele filtra os projetos por esse status
        if status:
            projetos = projetos.filter(status=status)
        # e aqui ele retorna os projetos ordenados por data de início
        return projetos.order_by('data_inicio')
    
    def perform_create(self, serializer):
        # e por ultimo temos esse daqui que salva o projeto no banco de dados
        serializer.save()