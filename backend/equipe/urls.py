from rest_framework.routers import DefaultRouter
from equipe.views import EquipeViewSet

router = DefaultRouter()
router.register(r'equipes', EquipeViewSet, basename='equipe')

urlpatterns = router.urls
