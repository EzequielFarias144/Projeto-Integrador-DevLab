from django.urls import path
from .views import PerfilUsuarioView

urlpatterns = [
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
]
