from django.contrib import admin
from projetos.models import Projeto

# Register your models here.
@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'status', 'data_inicio', 'data_fim_prevista']
    search_fields = ['nome', 'descricao']
    readonly_fields = ['id']
    ordering = ['data_inicio']
