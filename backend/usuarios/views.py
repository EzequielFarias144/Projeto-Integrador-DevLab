from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import UsuarioSerializer

Usuario = get_user_model()

# View para registro de novos usuários
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        nome = request.data.get('nome')
        tipo_usuario = request.data.get('tipo_usuario', 'estudante')
        cpf = request.data.get('cpf', '')

        # Validações
        if not username or not password or not nome or not email:
            return Response(
                {'error': 'Username, email, password e nome são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Usuario.objects.filter(username=username).exists():
            return Response(
                {'error': 'Usuário já existe'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if email and Usuario.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email já cadastrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar usuário
        try:
            usuario = Usuario.objects.create_user(
                username=username,
                email=email,
                password=password,
                nome=nome,
                tipo_usuario=tipo_usuario,
                cpf=cpf if cpf else f'temp_{username}'  # CPF temporário se não fornecido
            )
            
            serializer = UsuarioSerializer(usuario)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# View para mostrar apenas o perfil do usuário logado
class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

# ViewSet para listar todos os usuários (rota /api/usuarios/)
class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['put', 'patch'], url_path='editar-perfil')
    def editar_perfil(self, request):
        """Permite que o usuário edite seus próprios dados"""
        usuario = request.user
        
        # Dados que podem ser editados
        nome = request.data.get('nome')
        email = request.data.get('email')
        senha_atual = request.data.get('senha_atual')
        nova_senha = request.data.get('nova_senha')
        
        # Atualizar nome
        if nome:
            usuario.nome = nome
        
        # Atualizar email (verificar se não está em uso)
        if email and email != usuario.email:
            if Usuario.objects.filter(email=email).exists():
                return Response(
                    {'detail': 'Este email já está em uso.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.email = email
        
        # Alterar senha (se fornecida)
        if nova_senha:
            if not senha_atual:
                return Response(
                    {'detail': 'Senha atual é obrigatória para alterar a senha.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar senha atual
            if not usuario.check_password(senha_atual):
                return Response(
                    {'detail': 'Senha atual incorreta.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Definir nova senha
            usuario.set_password(nova_senha)
        
        # Salvar alterações
        usuario.save()
        
        serializer = UsuarioSerializer(usuario)
        return Response({
            'detail': 'Perfil atualizado com sucesso.',
            'usuario': serializer.data
        })
