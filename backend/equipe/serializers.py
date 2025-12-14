from rest_framework import serializers
from equipe.models import Equipe
from usuarios.serializers import UsuarioResumoSerializer

class EquipeSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Equipe.
    """

    # Campos aninhados somente leitura para exibir informações detalhadas
    lider_detalhes = UsuarioResumoSerializer(source='lider', read_only=True)
    membros_detalhes = UsuarioResumoSerializer(source='membros', many=True, read_only=True)
    projeto_nome = serializers.CharField(source='projeto.nome', read_only=True)

    class Meta:
        model = Equipe
        fields = [
            'id',
            'nome',
            'descricao',
            'projeto',
            'projeto_nome',
            'lider',
            'lider_detalhes',
            'membros',
            'membros_detalhes',
            'data_criacao',
        ]
        read_only_fields = ['id', 'data_criacao']

    def validate(self, data):
        """
        Validações customizadas:
        - O líder deve participar do projeto
        """
        lider = data.get('lider')
        projeto = data.get('projeto')

        # Se está atualizando, pega valores da instância se não foram passados
        if self.instance:
            lider = lider or self.instance.lider
            projeto = projeto or self.instance.projeto

        # Valida se o líder participa do projeto
        if lider and projeto:
            if not projeto.participantes.filter(id=lider.id).exists():
                raise serializers.ValidationError({
                    'lider': f'O líder deve ser um participante do projeto "{projeto.nome}".'
                })

        return data


class EquipeResumoSerializer(serializers.ModelSerializer):
    """
    Serializer resumido de Equipe para uso em relacionamentos.
    """
    lider_nome = serializers.CharField(source='lider.get_full_name', read_only=True)
    total_membros = serializers.SerializerMethodField()

    class Meta:
        model = Equipe
        fields = ['id', 'nome', 'lider_nome', 'total_membros']
        read_only_fields = fields

    def get_total_membros(self, obj):
        return obj.membros.count()
