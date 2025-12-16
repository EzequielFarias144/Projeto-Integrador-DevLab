from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nome', 'email', 'cpf', 'tipo_usuario']

class UsuarioResumoSerializer(serializers.ModelSerializer):
    """Serializer resumido para usuário (usado em listagens)"""
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nome', 'tipo_usuario']
