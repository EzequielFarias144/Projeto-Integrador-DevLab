from django.contrib import admin
from django.contrib.auth import get_user_model

Usuario = get_user_model()

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['username', 'nome', 'email', 'tipo_usuario']
    list_filter = ['tipo_usuario']
    search_fields = ['username', 'nome', 'email', 'cpf']
    ordering = ['username']
