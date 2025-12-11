from django.db import models
from django.core.exceptions import ValidationError
import datetime

class Projeto(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.CharField(max_length=2000) 
    data_inicio = models.DateField(default=datetime.date.today)
    data_fim_prevista = models.DateField(null=True, blank=True)
    
    STATUS_NAO_INICIADO = "nao_iniciado"
    STATUS_ANDAMENTO = "em_andamento"
    STATUS_CONCLUIDO = "concluido"
    STATUS_CANCELADO = "cancelado"

    STATUS_CHOICES = [
        (STATUS_NAO_INICIADO, "Não Iniciado"),
        (STATUS_ANDAMENTO, "Em Andamento"),
        (STATUS_CONCLUIDO, "Concluído"),
        (STATUS_CANCELADO, "Cancelado"),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_NAO_INICIADO)
    
    def clean(self):
        if self.data_fim_prevista and self.data_inicio and self.data_fim_prevista < self.data_inicio:
            raise ValidationError({"data_fim_prevista": ("A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data")})
            
    def save(self, *args, **kwargs):
        validate = kwargs.pop('validate', True)
        if validate:
            self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nome