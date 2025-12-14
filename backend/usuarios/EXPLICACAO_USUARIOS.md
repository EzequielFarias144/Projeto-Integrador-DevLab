# Configurar banco de dados
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver

# Autenticação
Endpoints
POST /api/token/ → login com username e password.

POST /api/token/refresh/ → renovar token de acesso.

# Exemplo de Request
POST /api/token/
Content-Type: application/json

{
  "username": "User",
  "password": "senha"
}

# Exemplo de Response
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
  "access": "eyJ0eXAiOiJKV1QiLCJh..."
}

# Perfis de Usuário
Administrador / Coordenador
Criado via createsuperuser.

Permissões: gerenciar projetos, equipes, usuários e relatórios.

Usuário Comum (Estudante/Professor)
Criado via painel admin ou API.

Permissões: consultar seus próprios dados, projetos e equipes em que participa.

# Endpoints Principais
Usuários
GET /api/usuarios/ → lista todos os usuários (restrito a admin).

GET /api/usuarios/{id}/ → detalha um usuário específico.

GET /api/usuarios/perfil/ → retorna dados do usuário logado.

Projetos
GET /api/projetos/ → lista projetos.

POST /api/projetos/ → cria projeto (restrito a admin).

GET /api/projetos/{id}/ → detalha projeto.

PUT/PATCH /api/projetos/{id}/ → atualiza projeto.

DELETE /api/projetos/{id}/ → remove projeto.

Equipes
GET /api/projetos/{id}/equipes/ → lista equipes de um projeto.

POST /api/projetos/{id}/equipes/ → cria equipe vinculada ao projeto.

PUT /api/equipes/{id}/definir-lider/ → define líder da equipe.

GET /api/usuarios/{id}/equipes/ → lista equipes em que o usuário participa.

# Relacionamentos
Usuário ↔ Projeto (N:N) Um usuário participa de vários projetos; um projeto tem vários usuários.

Projeto ↔ Equipe (1:N) Um projeto tem várias equipes; cada equipe pertence a um único projeto.

Usuário ↔ Equipe (1:1 liderança / N:N membresia) Cada equipe tem um líder (1:1). Uma equipe pode ter vários membros (N:N).

# Testes Realizados
Login com superusuário e obtenção de tokens funcionando.

Rotas protegidas retornam 401 Unauthorized sem token.

Diferenciação de perfis confirmada (admin vs usuário comum).

Testes feitos via PowerShell, navegador e painel admin.