from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    TIPO_USUARIO = (
        ('coordenador', 'Coordenador'),
        ('professor', 'Professor'),
        ('estudante', 'Estudante'),
        ('visitante', 'Visitante'),
    )
    tipo_usuario = models.CharField(max_length=20, choices=TIPO_USUARIO)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.nome} ({self.tipo_usuario})"
