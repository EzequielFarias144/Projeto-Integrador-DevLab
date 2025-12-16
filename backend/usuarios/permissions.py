from rest_framework import permissions


class IsCoordenadorOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada para permitir apenas coordenadores a criar/editar.
    Outros usuários podem apenas visualizar.
    """
    def has_permission(self, request, view):
        # Permite leitura para todos os usuários autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Permite escrita apenas para coordenadores
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'coordenador'


class CanViewOwnProjectsOnly(permissions.BasePermission):
    """
    Permissão que permite aos usuários visualizar apenas equipes de projetos
    dos quais participam.
    """
    def has_object_permission(self, request, view, obj):
        # Coordenadores podem ver tudo
        if request.user.tipo_usuario == 'coordenador':
            return True
        
        # Verifica se o usuário participa do projeto relacionado à equipe
        return obj.projeto.participantes.filter(id=request.user.id).exists()
