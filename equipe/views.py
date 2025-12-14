from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from equipe.models import Equipe
from equipe.serializers import EquipeSerializer
from usuarios.permissions import IsCoordenadorOrReadOnly, CanViewOwnProjectsOnly
from usuarios.serializers import UsuarioResumoSerializer


class EquipeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar equipes do sistema DevLab.

    Permissões:
    - Coordenadores: CRUD completo
    - Outros usuários: apenas leitura de equipes dos projetos que participam
    """

    queryset = Equipe.objects.select_related('projeto', 'lider').prefetch_related('membros')
    serializer_class = EquipeSerializer
    permission_classes = [IsAuthenticated, IsCoordenadorOrReadOnly, CanViewOwnProjectsOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao', 'projeto__nome']
    ordering_fields = ['nome', 'data_criacao', 'projeto__nome']
    ordering = ['projeto__nome', 'nome']

    def get_queryset(self):
        """
        Filtrar queryset baseado no tipo de usuário:
        - Coordenadores veem todas as equipes
        - Outros veem apenas equipes de projetos que participam
        """
        user = self.request.user
        queryset = super().get_queryset()

        if user.is_coordenador:
            return queryset

        # Filtrar por projeto (se especificado)
        projeto_id = self.request.query_params.get('projeto')
        if projeto_id:
            queryset = queryset.filter(projeto_id=projeto_id)

        # Usuários comuns veem apenas equipes de seus projetos
        return queryset.filter(projeto__participantes=user).distinct()

    @action(detail=True, methods=['put', 'patch'], url_path='definir-lider')
    def definir_lider(self, request, pk=None):
        """
        Rota A-C: PUT/PATCH /api/equipes/{id}/definir-lider/
        Define um usuário como líder da equipe.

        Body esperado:
        {
            "lider_id": <id_do_usuario>
        }
        """
        equipe = self.get_object()
        lider_id = request.data.get('lider_id')

        if not lider_id:
            return Response(
                {'erro': 'O campo lider_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from usuarios.models import Usuario
            novo_lider = Usuario.objects.get(id=lider_id)

            # Verifica se o novo líder participa do projeto
            if not equipe.projeto.participantes.filter(id=novo_lider.id).exists():
                return Response(
                    {'erro': f'O usuário {novo_lider} não participa do projeto {equipe.projeto.nome}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Define o novo líder
            equipe.lider = novo_lider
            equipe.save()

            serializer = self.get_serializer(equipe)
            return Response(serializer.data)

        except Usuario.DoesNotExist:
            return Response(
                {'erro': 'Usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='adicionar-membro')
    def adicionar_membro(self, request, pk=None):
        """
        Rota adicional: POST /api/equipes/{id}/adicionar-membro/
        Adiciona um membro à equipe.

        Body esperado:
        {
            "usuario_id": <id_do_usuario>
        }
        """
        equipe = self.get_object()
        usuario_id = request.data.get('usuario_id')

        if not usuario_id:
            return Response(
                {'erro': 'O campo usuario_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from usuarios.models import Usuario
            usuario = Usuario.objects.get(id=usuario_id)

            # Verifica se o usuário participa do projeto
            if not equipe.projeto.participantes.filter(id=usuario.id).exists():
                return Response(
                    {'erro': f'O usuário {usuario} não participa do projeto {equipe.projeto.nome}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Adiciona à equipe
            equipe.membros.add(usuario)
            serializer = self.get_serializer(equipe)
            return Response(serializer.data)

        except Usuario.DoesNotExist:
            return Response(
                {'erro': 'Usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], url_path='remover-membro/(?P<usuario_id>[^/.]+)')
    def remover_membro(self, request, pk=None, usuario_id=None):
        """
        Rota adicional: DELETE /api/equipes/{id}/remover-membro/{usuario_id}/
        Remove um membro da equipe.
        """
        equipe = self.get_object()

        try:
            from usuarios.models import Usuario
            usuario = Usuario.objects.get(id=usuario_id)
            equipe.membros.remove(usuario)
            serializer = self.get_serializer(equipe)
            return Response(serializer.data)

        except Usuario.DoesNotExist:
            return Response(
                {'erro': 'Usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
