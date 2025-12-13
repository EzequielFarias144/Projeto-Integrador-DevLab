from rest_framework.routers import DefaultRouter
from projetos.views import ProjetoViewSet

router = DefaultRouter()
router.register(r'projetos', ProjetoViewSet, basename='projeto')

urlpatterns = router.urls
