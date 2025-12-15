from rest_framework import serializers
from django.contrib.auth import get_user_model
from tarefas.models import Tarefas
from equipe.models import Equipe
from usuarios.serializers import UsuarioSerializer
from equipe.serializers import EquipeSerializer

User = get_user_model()
        
class TarefaSerializer(serializers.ModelSerializer):
    responsavel = UsuarioSerializer(read_only=True)
    equipe = EquipeSerializer(read_only=True)
    
    class Meta:
        model = Tarefas
        fields = [
            'id', 'titulo', 'descricao', 'status', 'prioridade',
            'equipe',
            'responsavel',
            'data_inicio', 'data_fim_prevista'
        ]
        read_only_fields = ['id']
        
    def validate(self, attrs):
        """Valida que a data de fim não seja anterior à data de início."""
        data_inicio = attrs.get('data_inicio', getattr(self.instance, 'data_inicio', None))
        data_fim_prevista = attrs.get('data_fim_prevista', getattr(self.instance, 'data_fim_prevista', None))
        
        if data_inicio and data_fim_prevista and data_fim_prevista < data_inicio:
            raise serializers.ValidationError({
                'data_fim_prevista': 'Data fim prevista não pode ser anterior à data de início.'
            })
        
        return attrs
