from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Equipe(models.Model):
    """
    Modelo de Equipe para o sistema DevLab.
    Cada equipe pertence a um único projeto e tem um líder.
    """

    nome = models.CharField(
        max_length=200,
        help_text="Nome da equipe"
    )

    descricao = models.TextField(
        blank=True,
        null=True,
        help_text="Descrição da equipe e suas responsabilidades"
    )

    # Relacionamento 1:N - Uma equipe pertence a um único projeto
    projeto = models.ForeignKey(
        'projetos.Projeto',
        on_delete=models.CASCADE,
        related_name='equipes',
        help_text="Projeto ao qual esta equipe pertence"
    )

    # Relacionamento 1:1 - Cada equipe tem um único líder
    lider = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipe_liderada',
        help_text="Líder responsável pela equipe (um usuário pode liderar no máximo uma equipe)"
    )

    # Relacionamento N:N - Uma equipe pode ter vários membros
    membros = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='equipes',
        blank=True,
        help_text="Membros da equipe"
    )

    data_criacao = models.DateField(
        auto_now_add=True,
        help_text="Data de criação da equipe"
    )

    def __str__(self):
        return f"{self.nome} - {self.projeto.nome}"

    def clean(self):
        """
        Validações customizadas:
        - O líder deve ser um dos participantes do projeto
        """
        super().clean()

        if self.lider and self.projeto:
            # Verifica se o líder participa do projeto
            if not self.projeto.participantes.filter(id=self.lider.id).exists():
                raise ValidationError({
                    'lider': f'O líder {self.lider} deve ser um participante do projeto {self.projeto}.'
                })

    def save(self, *args, **kwargs):
        """Sobrescreve save para incluir validação automática"""
        validate = kwargs.pop('validate', True)
        if validate and self.pk:  # Só valida se já existe (para evitar erro ao criar)
            self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Equipe"
        verbose_name_plural = "Equipes"
        ordering = ['projeto', 'nome']
        unique_together = ['nome', 'projeto']  # Nome único por projeto