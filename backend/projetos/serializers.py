from rest_framework import serializers
from projetos.models import Projeto

class ProjetoSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Projeto
        # Aqui ele serializa todos os campos do modelo Projeto
        fields = '__all__'
        
    def validate(self, data):
        # Aqui ele obtém data_inicio dos dados recebidos ou da instância existente (para updates)
        data_inicio = data.get('data_inicio', getattr(self.instance, 'data_inicio', None))
        # Aqui ele pega data_fim_prevista dos dados recebidos ou da instância existente 
        data_fim = data.get('data_fim_prevista', getattr(self.instance, 'data_fim_prevista', None))
        
        # Aqui ele valida se a data de fim não é anterior à data de início
        if data_fim and data_inicio and data_fim < data_inicio:
            raise serializers.ValidationError({
                "data_fim_prevista": "A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data"
            })
        return data 