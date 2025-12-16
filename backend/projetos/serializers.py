from rest_framework import serializers
from projetos.models import Projeto, ParticipacaoProjeto
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjetoSerializer(serializers.ModelSerializer):
    participantes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    participantes_detalhes = serializers.SerializerMethodField()
    professor_detalhes = serializers.SerializerMethodField()
    lider_detalhes = serializers.SerializerMethodField()
    criado_por = serializers.SerializerMethodField()
    
    class Meta: 
        model = Projeto
        fields = '__all__'
        read_only_fields = ['participantes', 'created_by']
    
    def get_criado_por(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'nome': obj.created_by.nome,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None
    
    def get_participantes_detalhes(self, obj):
        """Retorna os detalhes de todos os participantes do projeto"""
        return [
            {
                'id': usuario.id,
                'nome': usuario.nome,
                'username': usuario.username,
                'email': usuario.email,
                'tipo_usuario': usuario.tipo_usuario
            }
            for usuario in obj.participantes.all()
        ]
    
    def get_professor_detalhes(self, obj):
        if obj.professor:
            return {
                'id': obj.professor.id,
                'nome': obj.professor.nome,
                'username': obj.professor.username,
                'email': obj.professor.email
            }
        return None
    
    def get_lider_detalhes(self, obj):
        try:
            participacao_lider = ParticipacaoProjeto.objects.get(projeto=obj, is_leader=True)
            return {
                'id': participacao_lider.usuario.id,
                'nome': participacao_lider.usuario.nome,
                'username': participacao_lider.usuario.username,
                'email': participacao_lider.usuario.email
            }
        except ParticipacaoProjeto.DoesNotExist:
            return None
        
    def validate(self, data):
        data_inicio = data.get('data_inicio', getattr(self.instance, 'data_inicio', None))
        data_fim = data.get('data_fim_prevista', getattr(self.instance, 'data_fim_prevista', None))
        
        if data_fim and data_inicio and data_fim < data_inicio:
            raise serializers.ValidationError({
                "data_fim_prevista": "A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data"
            })
        return data 