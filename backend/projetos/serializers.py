from rest_framework import serializers
from projetos.models import Projeto

class ProjetoSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Projeto
        fields = '__all__'
        
    def validate(self, data):
        data_inicio = data.get('data_inicio', getattr(self.instance, 'data_inicio', None))
        data_fim = data.get('data_fim_prevista', getattr(self.instance, 'data_fim_prevista', None))
        
        if data_fim and data_inicio and data_fim < data_inicio:
            raise serializers.ValidationError({"data_fim_prevista": "A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data"})
        return data 