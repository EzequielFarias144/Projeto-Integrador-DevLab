from django.contrib import admin
from equipe.models import Equipe

@admin.register(Equipe)
class EquipeAdmin(admin.ModelAdmin):
    """Configuração do admin para o modelo Equipe"""

    list_display = ['nome', 'projeto', 'lider', 'total_membros', 'data_criacao']
    list_filter = ['projeto', 'data_criacao']
    search_fields = ['nome', 'descricao', 'projeto__nome', 'lider__username']
    autocomplete_fields = ['projeto', 'lider']
    filter_horizontal = ['membros']
    date_hierarchy = 'data_criacao'

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'descricao', 'projeto')
        }),
        ('Liderança e Membros', {
            'fields': ('lider', 'membros')
        }),
    )

    def total_membros(self, obj):
        """Exibe total de membros"""
        return obj.membros.count()
    total_membros.short_description = 'Total de Membros'