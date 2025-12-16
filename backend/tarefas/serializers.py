from rest_framework import serializers
from django.contrib.auth import get_user_model
from tarefas.models import Tarefas
from equipe.models import Equipe
from projetos.models import ParticipacaoProjeto
from usuarios.serializers import UsuarioSerializer
from equipe.serializers import EquipeSerializer

User = get_user_model()
        
class TarefaSerializer(serializers.ModelSerializer):
    responsavel_detalhes = UsuarioSerializer(source='responsavel', read_only=True)
    responsavel_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    equipe = EquipeSerializer(read_only=True)
    
    class Meta:
        model = Tarefas
        fields = [
            'id', 'titulo', 'descricao', 'status', 'prioridade',
            'projeto', 'equipe',
            'responsavel', 'responsavel_id', 'responsavel_detalhes',
            'data_inicio', 'data_fim_prevista'
        ]
        read_only_fields = ['id', 'responsavel']
        
    def validate(self, attrs):
        """Valida que a data de fim não seja anterior à data de início."""
        data_inicio = attrs.get('data_inicio', getattr(self.instance, 'data_inicio', None))
        data_fim_prevista = attrs.get('data_fim_prevista', getattr(self.instance, 'data_fim_prevista', None))
        
        if data_inicio and data_fim_prevista and data_fim_prevista < data_inicio:
            raise serializers.ValidationError({
                'data_fim_prevista': 'Data fim prevista não pode ser anterior à data de início.'
            })
        
        # Valida responsável se fornecido
        responsavel_id = attrs.get('responsavel_id')
        projeto = attrs.get('projeto') or getattr(self.instance, 'projeto', None)
        
        if responsavel_id:
            try:
                responsavel = User.objects.get(pk=responsavel_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'responsavel_id': 'Usuário não encontrado.'
                })
            
            # Verifica se é estudante
            if responsavel.tipo_usuario != 'estudante':
                raise serializers.ValidationError({
                    'responsavel_id': 'Apenas estudantes podem ser responsáveis por tarefas.'
                })
            
            # Verifica se participa do projeto
            if projeto:
                if not ParticipacaoProjeto.objects.filter(
                    projeto=projeto, 
                    usuario=responsavel, 
                    ativo=True
                ).exists():
                    raise serializers.ValidationError({
                        'responsavel_id': 'O responsável deve ser um participante ativo do projeto.'
                    })
        
        return attrs
    
    def create(self, validated_data):
        responsavel_id = validated_data.pop('responsavel_id', None)
        if responsavel_id:
            validated_data['responsavel_id'] = responsavel_id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        responsavel_id = validated_data.pop('responsavel_id', None)
        if responsavel_id:
            validated_data['responsavel_id'] = responsavel_id
        elif 'responsavel_id' in validated_data:
            validated_data['responsavel'] = None
        return super().update(instance, validated_data)
