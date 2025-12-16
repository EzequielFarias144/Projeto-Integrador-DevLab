from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

from projetos.models import Projeto, ParticipacaoProjeto
from projetos.serializers import ProjetoSerializer
from equipe.models import Equipe
from equipe.serializers import EquipeSerializer

User = get_user_model()

class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada que permite apenas o criador do projeto modificá-lo.
    """
    def has_object_permission(self, request, view, obj):
        # Permite leitura para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para escrita, verifica se é o criador
        return obj.created_by == request.user

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
    # Permissão personalizada: apenas o criador pode modificar
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]
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
        status_param = self.request.query_params.get('status')
        # Pega o parâmetro 'participante' para filtrar projetos de um usuário específico
        participante_id = self.request.query_params.get('participante')
        
        # E esse vai buscar todos os projetos inicialmente
        projetos = Projeto.objects.all()
        
        # Se quiser filtrar por participante (ex: /api/projetos/?participante=5)
        if participante_id:
            projetos = projetos.filter(participantes__id=participante_id)
        
        # nesse daqui se o status foi informado, ele filtra os projetos por esse status
        if status_param:
            projetos = projetos.filter(status=status_param)
        # e aqui ele retorna os projetos ordenados por data de início
        return projetos.order_by('data_inicio')
    
    def perform_create(self, serializer):
        # Salva o projeto com o usuário logado como criador
        serializer.save(created_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        projeto = self.get_object()
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode modificá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        projeto = self.get_object()
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode modificá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        projeto = self.get_object()
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode excluí-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def equipes(self, request, pk=None):
        projeto = self.get_object()
        equipes = projeto.equipes.all()
        serializer = EquipeSerializer(equipes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def participantes(self, request, pk=None):
        projeto = self.get_object()
        participacoes = ParticipacaoProjeto.objects.filter(projeto=projeto).select_related('usuario')
        
        data = []
        for part in participacoes:
            data.append({
                'id': part.usuario.id,
                'username': part.usuario.username,
                'nome': part.usuario.nome,
                'email': part.usuario.email,
                'tipo_usuario': part.usuario.tipo_usuario,
                'data_entrada': part.data_entrada,
                'data_saida': part.data_saida,
                'ativo': part.ativo,
            })
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def add_participante(self, request, pk=None):
        projeto = self.get_object()
        usuario_id = request.data.get('usuario_id')
        
        # Verifica se o usuário logado é o criador do projeto
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode gerenciá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not usuario_id:
            return Response(
                {'detail': 'usuario_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            usuario = User.objects.get(pk=usuario_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verifica se o usuário é estudante
        if usuario.tipo_usuario != 'estudante':
            return Response(
                {'detail': 'Apenas estudantes podem ser adicionados como participantes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verifica se já participa
        if ParticipacaoProjeto.objects.filter(projeto=projeto, usuario=usuario).exists():
            return Response(
                {'detail': 'Usuário já participa deste projeto.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cria a participação
        ParticipacaoProjeto.objects.create(
            projeto=projeto,
            usuario=usuario,
            ativo=True
        )
        
        return Response(
            {'detail': f'Usuário {usuario.username} adicionado ao projeto com sucesso.'},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        projeto = self.get_object()
        
        # Dados do projeto
        projeto_data = ProjetoSerializer(projeto).data
        
        # Todas as equipes do projeto
        equipes = projeto.equipes.prefetch_related('membros').select_related('lider').all()
        
        equipes_data = []
        for equipe in equipes:
            # Dados de cada membro da equipe
            membros_data = []
            for membro in equipe.membros.all():
                membros_data.append({
                    'id': membro.id,
                    'username': membro.username,
                    'nome': membro.nome,
                    'email': membro.email,
                    'tipo_usuario': membro.tipo_usuario,
                    'e_lider': equipe.lider == membro if equipe.lider else False
                })
            
            equipes_data.append({
                'id': equipe.id,
                'nome': equipe.nome,
                'descricao': equipe.descricao,
                'lider': {
                    'id': equipe.lider.id,
                    'username': equipe.lider.username,
                    'nome': equipe.lider.nome,
                } if equipe.lider else None,
                'membros': membros_data,
                'total_membros': len(membros_data)
            })
        
        # Monta resposta final
        dashboard_data = {
            'projeto': projeto_data,
            'equipes': equipes_data,
            'total_equipes': len(equipes_data),
            'total_participantes': projeto.participantes.count()
        }
        
        return Response(dashboard_data)
    
    @action(detail=True, methods=['get', 'post'])
    def tarefas(self, request, pk=None):
        """Lista ou cria tarefas do projeto"""
        projeto = self.get_object()
        
        if request.method == 'GET':
            from tarefas.models import Tarefas
            from tarefas.serializers import TarefaSerializer
            
            tarefas = Tarefas.objects.filter(projeto=projeto)
            serializer = TarefaSerializer(tarefas, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Verifica se o usuário logado é o criador do projeto
            if projeto.created_by != request.user:
                return Response(
                    {'detail': 'Apenas o coordenador que criou o projeto pode gerenciá-lo.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            from tarefas.serializers import TarefaSerializer
            
            # Adiciona o projeto aos dados
            data = request.data.copy()
            data['projeto'] = projeto.id
            
            serializer = TarefaSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='definir-lider')
    def definir_lider(self, request, pk=None):
        """Define um estudante como líder da equipe do projeto (apenas coordenador criador)"""
        projeto = self.get_object()
        usuario_id = request.data.get('usuario_id')
        
        # Verifica se o usuário logado é o criador do projeto
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode gerenciá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verifica se o usuário logado é coordenador
        if request.user.tipo_usuario != 'coordenador':
            return Response(
                {'detail': 'Apenas coordenadores podem definir líderes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not usuario_id:
            return Response(
                {'detail': 'usuario_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            usuario = User.objects.get(pk=usuario_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verifica se o usuário é estudante
        if usuario.tipo_usuario != 'estudante':
            return Response(
                {'detail': 'Apenas estudantes podem ser líderes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verifica se o usuário participa do projeto
        try:
            participacao = ParticipacaoProjeto.objects.get(projeto=projeto, usuario=usuario, ativo=True)
        except ParticipacaoProjeto.DoesNotExist:
            return Response(
                {'detail': 'O usuário deve participar do projeto para ser líder.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove líder anterior
        ParticipacaoProjeto.objects.filter(projeto=projeto, is_leader=True).update(is_leader=False)
        
        # Define novo líder
        participacao.is_leader = True
        participacao.save()
        
        return Response({
            'detail': f'{usuario.nome} foi definido como líder do projeto.',
            'lider': {
                'id': usuario.id,
                'nome': usuario.nome,
                'username': usuario.username,
                'email': usuario.email
            }
        })
    
    @action(detail=True, methods=['post'], url_path='definir-professor')
    def definir_professor(self, request, pk=None):
        """Define o professor orientador do projeto (apenas coordenador criador)"""
        projeto = self.get_object()
        professor_id = request.data.get('professor_id')
        
        # Verifica se o usuário logado é o criador do projeto
        if projeto.created_by != request.user:
            return Response(
                {'detail': 'Apenas o coordenador que criou o projeto pode gerenciá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verifica se o usuário logado é coordenador
        if request.user.tipo_usuario != 'coordenador':
            return Response(
                {'detail': 'Apenas coordenadores podem definir professores.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not professor_id:
            return Response(
                {'detail': 'professor_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            professor = User.objects.get(pk=professor_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Professor não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verifica se o usuário é professor
        if professor.tipo_usuario != 'professor':
            return Response(
                {'detail': 'O usuário selecionado deve ser um professor.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Define o professor
        projeto.professor = professor
        projeto.save(validate=False)  # Pula a validação ao salvar apenas o professor
        
        # Adiciona o professor como participante se ainda não estiver
        try:
            ParticipacaoProjeto.objects.get_or_create(
                usuario=professor,
                projeto=projeto,
                defaults={'ativo': True, 'is_leader': False}
            )
        except Exception as e:
            # Se der erro ao adicionar como participante, continua mas loga o erro
            print(f"Erro ao adicionar professor como participante: {str(e)}")
        
        return Response({
            'detail': f'Professor {professor.nome} foi definido como orientador do projeto.',
            'professor': {
                'id': professor.id,
                'nome': professor.nome,
                'username': professor.username,
                'email': professor.email
            }
        })
    
    @action(detail=False, methods=['get'], url_path='relatorios')
    def relatorios(self, request):
        """Retorna estatísticas gerais de participação (apenas coordenadores)"""
        # Verifica se o usuário é coordenador
        if request.user.tipo_usuario != 'coordenador':
            return Response(
                {'detail': 'Apenas coordenadores podem acessar relatórios.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from tarefas.models import Tarefas
        
        # Estatísticas de projetos
        total_projetos = Projeto.objects.count()
        projetos_em_andamento = Projeto.objects.filter(status='em_andamento').count()
        projetos_concluidos = Projeto.objects.filter(status='concluido').count()
        projetos_planejamento = Projeto.objects.filter(status='planejamento').count()
        projetos_cancelados = Projeto.objects.filter(status='cancelado').count()
        
        # Estatísticas de usuários
        total_estudantes = User.objects.filter(tipo_usuario='estudante').count()
        total_professores = User.objects.filter(tipo_usuario='professor').count()
        total_coordenadores = User.objects.filter(tipo_usuario='coordenador').count()
        
        # Estudantes participando de projetos
        estudantes_ativos = ParticipacaoProjeto.objects.filter(
            ativo=True,
            usuario__tipo_usuario='estudante'
        ).values('usuario').distinct().count()
        
        # Estatísticas de tarefas
        total_tarefas = Tarefas.objects.count()
        tarefas_pendentes = Tarefas.objects.filter(status='pendente').count()
        tarefas_em_andamento = Tarefas.objects.filter(status='em_andamento').count()
        tarefas_concluidas = Tarefas.objects.filter(status='concluida').count()
        
        # Projetos por coordenador
        projetos_por_coordenador = Projeto.objects.values(
            'created_by__nome', 'created_by__id'
        ).annotate(
            total=Count('id')
        ).order_by('-total')[:10]  # Top 10 coordenadores
        
        # Professores mais ativos (com mais projetos)
        professores_ativos = Projeto.objects.filter(
            professor__isnull=False
        ).values(
            'professor__nome', 'professor__id'
        ).annotate(
            total_projetos=Count('id')
        ).order_by('-total_projetos')[:10]
        
        # Estudantes mais participativos
        estudantes_participativos = ParticipacaoProjeto.objects.filter(
            ativo=True,
            usuario__tipo_usuario='estudante'
        ).values(
            'usuario__nome', 'usuario__id'
        ).annotate(
            total_projetos=Count('projeto', distinct=True)
        ).order_by('-total_projetos')[:10]
        
        # Total de participações ativas
        total_participacoes = ParticipacaoProjeto.objects.filter(ativo=True).count()
        
        return Response({
            'projetos': {
                'total': total_projetos,
                'em_andamento': projetos_em_andamento,
                'concluidos': projetos_concluidos,
                'planejamento': projetos_planejamento,
                'cancelados': projetos_cancelados,
            },
            'usuarios': {
                'total_estudantes': total_estudantes,
                'estudantes_ativos': estudantes_ativos,
                'total_professores': total_professores,
                'total_coordenadores': total_coordenadores,
            },
            'tarefas': {
                'total': total_tarefas,
                'pendentes': tarefas_pendentes,
                'em_andamento': tarefas_em_andamento,
                'concluidas': tarefas_concluidas,
            },
            'rankings': {
                'projetos_por_coordenador': list(projetos_por_coordenador),
                'professores_ativos': list(professores_ativos),
                'estudantes_participativos': list(estudantes_participativos),
            },
            'participacoes': {
                'total_participacoes_ativas': total_participacoes,
            }
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='publicos')
    def publicos(self, request):
        """Lista projetos públicos (sem necessidade de autenticação)"""
        projetos_publicos = Projeto.objects.filter(is_public=True).order_by('-data_inicio')
        
        # Usar paginação
        page = self.paginate_queryset(projetos_publicos)
        if page is not None:
            serializer = ProjetoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProjetoSerializer(projetos_publicos, many=True)
        return Response(serializer.data)