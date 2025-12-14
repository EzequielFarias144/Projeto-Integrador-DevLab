from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfilUsuarioView, UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('usuarios/perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
    path('', include(router.urls)),
]
