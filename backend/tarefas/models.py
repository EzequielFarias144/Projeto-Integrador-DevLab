from django.db import models
import datetime
from django.conf import settings
from django.core.exceptions import ValidationError

class Tarefas(models.Model):
    STATUS_CHOICES = [
        ('nao_iniciado', 'Não iniciado'),
        ('em_andamento', 'Em andamento'),
        ('concluida', 'Concluída'),
    ]
    
    PRIORIDADE_CHOICES = [
        (1, 'Alta'),
        (2, 'Média'),
        (3, 'Baixa'),
    ]
    
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='nao_iniciado')
    prioridade = models.IntegerField(choices=PRIORIDADE_CHOICES, default=2)
    
    projeto = models.ForeignKey(
        'projetos.Projeto',
        on_delete=models.CASCADE,
        related_name='tarefas',
        null=True,
        blank=True
    )
    
    equipe = models.ForeignKey(
        'equipe.Equipe',
        on_delete=models.CASCADE,
        related_name='tarefas',
        null=True,
        blank=True
    )
    
    responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tarefas'
    )
    
    data_inicio = models.DateField(default=datetime.date.today)
    data_fim_prevista = models.DateField(null=True, blank=True)
    
    def clean(self):
        if self.data_fim_prevista and self.data_inicio and self.data_fim_prevista < self.data_inicio:
            raise ValidationError({"data_fim_prevista": ("A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data")})
    
    def save(self, *args, **kwargs):
        validate = kwargs.pop('validate', True)
        if validate:
            self.full_clean()
        super().save(*args, **kwargs)
        
    class Meta:
        ordering = ['prioridade', 'data_fim_prevista']
        verbose_name = 'Tarefa'
        verbose_name_plural = 'Tarefas'
        
    def __str__(self):
        return f"{self.titulo} ({self.get_status_display()})"