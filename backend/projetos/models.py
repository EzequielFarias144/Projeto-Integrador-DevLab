from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import datetime


class ParticipacaoProjeto(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        help_text="Usuário participante do projeto"
    )
    
    projeto = models.ForeignKey(
        'Projeto',
        on_delete=models.CASCADE,
        help_text="Projeto do qual o usuário participa"
    )
    
    # Campos de controle da participação
    data_entrada = models.DateField(
        auto_now_add=True,
        help_text="Data em que o usuário entrou no projeto"
    )
    
    data_saida = models.DateField(
        null=True,
        blank=True,
        help_text="Data em que o usuário saiu do projeto"
    )
    
    ativo = models.BooleanField(
        default=True,
        help_text="Indica se o usuário ainda está ativo no projeto"
    )
    
    class Meta:
        verbose_name = "Participação em Projeto"
        verbose_name_plural = "Participações em Projetos"
        # Isso daqui vair garantir que um usuário não possae ter participações duplicadas no mesmo projeto
        unique_together = ['usuario', 'projeto']
        ordering = ['-data_entrada']
    
    def __str__(self):
        status = "Ativo" if self.ativo else "Inativo"
        return f"{self.usuario.username} em {self.projeto.nome} ({status})"


class Projeto(models.Model):
    # Atributos básicos
    nome = models.CharField(max_length=200)
    descricao = models.CharField(max_length=2000) 
    
    # Aqui temos os campos de datas - eu coloquei para que a data_inicio use a data atual como padrão
    data_inicio = models.DateField(default=datetime.date.today)
    # enquanto a data_fim_prevista é opcional (o null=True permite None no DB, já o blank=True permite vazio em formulários)
    data_fim_prevista = models.DateField(null=True, blank=True)
    
    participantes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ParticipacaoProjeto', 
        related_name='projetos',
        blank=True,
        help_text="Usuários que participam nesse projeto"
    )
    
    # Aqui é as constantes para os status do projeto
    STATUS_NAO_INICIADO = "nao_iniciado"
    STATUS_ANDAMENTO = "em_andamento"
    STATUS_CONCLUIDO = "concluido"
    STATUS_CANCELADO = "cancelado"

    # Aqui é o choices para o campo status - ele é quem define os valores permitidos e seus labels(de acordo com o que entendi pela documentação)
    STATUS_CHOICES = [
        (STATUS_NAO_INICIADO, "Não Iniciado"),
        (STATUS_ANDAMENTO, "Em Andamento"),
        (STATUS_CONCLUIDO, "Concluído"),
        (STATUS_CANCELADO, "Cancelado"),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_NAO_INICIADO)
    
    def clean(self):
        #Esse clean vai validar os dados do modelo antes de salvar.
        #eu coloquei por enquanto as seguintes validações:
        #Garante que data_fim_prevista não seja anterior à data_inicio
        #e se caso aconteça de alguem botar a data errada em data_fim_prevista ele lança
        #Raises:
        #    ValidationError
        if self.data_fim_prevista and self.data_inicio and self.data_fim_prevista < self.data_inicio:
            raise ValidationError({"data_fim_prevista": ("A data para o fim deste projeto não pode ser menor que a data de início. Por favor, troque a data")})
            
    def save(self, *args, **kwargs):
        #Aqui ele sobrescreve o método save para incluir validação automática.
        
        # Aqui ele remove o parâmetro 'validate' dos kwargs (o padrão: True)
        validate = kwargs.pop('validate', True)
        # Aqui se validate for True, executa todas as validações
        if validate:
            self.full_clean()
        # E aqui ele chama o método save original do Django
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nome