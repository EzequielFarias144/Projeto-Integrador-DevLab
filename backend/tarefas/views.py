# tarefas/views.py
from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_date

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from .models import Tarefas  # ← Corrigido: Tarefas (plural)
from .serializers import TarefaSerializer

User = get_user_model()


class IsResponsavelOrReadOnly(permissions.BasePermission):
    """
    Permissão customizada que eu criei para controlar quem pode editar tarefas.
    A ideia é: qualquer um pode visualizar, mas só o responsável ou admin pode editar.
    """
    def has_permission(self, request, view):
        # Se for método seguro, todo mundo pode(eu não sei se fiz certo então pode mudar)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Se for criar/editar/deletar, precisa estar logado
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Leitura: qualquer um pode
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        # Ou se for o responsável pela tarefa
        if obj.responsavel and obj.responsavel == request.user:
            return True
        return False


class TarefaPaginacao(PageNumberPagination):
    # Aqui eu configurei a paginação das tarefas
    page_size = 10
    page_size_query_param = 'tamanho'
    max_page_size = 100


class TarefaViewSet(viewsets.ModelViewSet):
    # Aqui eu uso select_related pra otimizar - traz responsavel e equipe junto numa query só
    queryset = Tarefas.objects.select_related('responsavel', 'equipe').all()
    serializer_class = TarefaSerializer
    permission_classes = [IsResponsavelOrReadOnly]
    pagination_class = TarefaPaginacao

    # Configurei os filtros, dá pra filtrar por status, prioridade, equipe e responsável
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'prioridade', 'equipe', 'responsavel']
    # Busca por título ou descrição
    search_fields = ['titulo', 'descricao']
    # Ordenação disponível por esses campos
    ordering_fields = ['prioridade', 'data_fim_prevista', 'data_inicio']
    # Ordem padrão: mais prioritárias primeiro, depois por prazo
    ordering = ['-prioridade', 'data_fim_prevista']

    def perform_create(self, serializer):
        validated = getattr(serializer, 'validated_data', None)
        if validated and validated.get('responsavel') is None:
            serializer.save(responsavel=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        """
        Endpoint customizado pra atribuir um responsável à tarefa.
        eu posso usar: POST /api/tarefas/{id}/assign/ com {"responsavel_id": 5}
        """
        tarefa = self.get_object()
        responsavel_id = request.data.get('responsavel_id')
        
        if responsavel_id is None:
            return Response(
                {'detail': 'responsavel_id é obrigatório.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(pk=responsavel_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        tarefa.responsavel = user
        tarefa.save()
        serializer = self.get_serializer(tarefa)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_status(self, request, pk=None):
        """
        Endpoint pra mudar o status da tarefa.
        Eu posso usar: POST /api/tarefas/{id}/change_status/ com {"status": "concluida"}
        """
        tarefa = self.get_object()
        status_novo = request.data.get('status')

        if not status_novo:
            return Response(
                {'detail': 'status é obrigatório.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Aqui ele valida se o status enviado é válido
        valid_status = [choice[0] for choice in Tarefas.STATUS_CHOICES]
        if status_novo not in valid_status:
            return Response(
                {'detail': 'Status inválido.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        tarefa.status = status_novo
        tarefa.save()
        
        serializer = self.get_serializer(tarefa)
        return Response(serializer.data, status=status.HTTP_200_OK)
