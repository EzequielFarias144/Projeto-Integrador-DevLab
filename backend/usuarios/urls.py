from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfilUsuarioView, UsuarioViewSet, RegistroUsuarioView

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro-usuario'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
    path('', include(router.urls)),
]
