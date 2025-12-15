from rest_framework.routers import DefaultRouter
from tarefas.views import TarefaViewSet  

router = DefaultRouter()
router.register(r'tarefas', TarefaViewSet, basename='tarefa')

urlpatterns = router.urls