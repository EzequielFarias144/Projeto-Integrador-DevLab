# Projeto-Integrador-DevLab
O DevLab Projects é um sistema web interno desenvolvido em Python/Django para gerenciar projetos colaborativos de turmas de Computação.
Ele centraliza informações sobre projetos, equipes e usuários, permitindo relatórios e visões agregadas sobre a participação dos estudantes.

# API Projeto Django

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg?logo=python)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-green.svg?logo=Django)](https://www.djangoproject.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


## Instituições de Fomento e Parceria
[![Website IFB](https://img.shields.io/badge/Website-IFB-%23508C3C.svg?labelColor=%23C8102E)](https://www.ifb.edu.br/) 
[![Website ihwbr](https://img.shields.io/badge/Website-ihwbr-%23DAA520.svg?labelColor=%232E2E2E)](https://hardware.org.br/)

## Orientador

[![Gmail Rodrigo Duran](rodrigo.duran@ifb.edu.br)

## Funcionalidades
- Autenticação de usuários (admin/coordenador e estudante/professor).

- CRUD de projetos (criar, listar, atualizar, remover).

- CRUD de equipes (cada equipe vinculada a um projeto).

- Definição de líder por equipe.

- Associação de usuários a projetos e equipes.

- Relatórios e visões agregadas (ex.: histórico de participação de um aluno).

- Rotas protegidas por perfil de usuário.

## Sumário

- [Visão Geral](#visão-geral)
- [Pacotes Utilizados](#pacotes-utilizados)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Diagrama de Banco de Dados](#diagrama-de-banco-de-dados)
- [Documentação da API](#documentação-da-api)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Deploy](#deploy)

## Visão Geral

A **API DevLab Projects** foi desenvolvida para centralizar e organizar a gestão de projetos colaborativos realizados por estudantes e professores em um ambiente acadêmico.  
Seu propósito é substituir o uso desorganizado de planilhas, grupos de mensagens e documentos soltos, oferecendo uma solução estruturada e segura para acompanhar projetos, equipes e participantes.

### 🎯 Objetivos principais
- Cadastrar e controlar projetos com informações completas (título, descrição, cliente, status, datas).
- Gerenciar equipes vinculadas a projetos, incluindo definição de líderes e associação de membros.
- Administrar usuários com papéis diferenciados (coordenador, professor, estudante).
- Disponibilizar relatórios e visões agregadas sobre a participação dos alunos.
- Garantir autenticação e autorização, protegendo rotas conforme o perfil de acesso.

### 🧩 Problema que resolve
O sistema elimina a falta de rastreabilidade e organização no gerenciamento dos projetos do DevLab, permitindo que coordenadores saibam:
- Em quais projetos cada estudante participou.
- Quem foram seus colegas e líderes de equipe.
- Quantos projetos e equipes já foram concluídos ou estão em andamento.

### 🌐 Domínio de aplicação
- Instituições de ensino que promovem projetos colaborativos em cursos técnicos e superiores de Computação.
- Ambientes acadêmicos voltados para integração entre alunos, professores e coordenadores.

### 👥 Público-alvo
- **Coordenadores/Admins:** gerenciam projetos, equipes e relatórios.  
- **Professores/Mentores:** acompanham equipes e estudantes.  
- **Estudantes:** participam de projetos e consultam suas equipes.  
- **Visitantes (opcional):** acesso restrito a informações públicas.  

### ⚙️ Funcionalidades de alto nível
- CRUD de projetos, equipes e usuários.  
- Associação N:N entre usuários e projetos.  
- Definição de líderes de equipe (1:1).  
- Relatórios de participação e dashboards de projetos.  
- Rotas protegidas com autenticação e perfis de acesso diferenciados.  


## Pacotes Utilizados

| Pacote                  | Versão       | Descrição                                      |
|-------------------------|--------------|------------------------------------------------|
| Django                  | >=5.0        | Framework web principal                        |
| djangorestframework     | latest       | Toolkit para construção de APIs REST           |
| asgiref                 | >=3.11       | Biblioteca Python padrão ASGI                  |
| sqlparse                | latest       | Pacote Python não-validante de SQL             |
| tzdata                  | latest       |Pacote de base de dados oficial de fusos horários    |
| ...                     | ...          | ...                                            |


## Estrutura do Projeto

```
📦backend
 ┣ 📂DevLab
 ┃ ┣ 📂__pycache__
 ┃ ┣ 📜asgi.py
 ┃ ┣ 📜settings.py
 ┃ ┣ 📜urls.py
 ┃ ┣ 📜wsgi.py
 ┃ ┗ 📜__init__.py
 ┣ 📂equipe
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂__pycache__
 ┃ ┃ ┗ 📜__init__.py
 ┃ ┣ 📂__pycache__
 ┃ ┣ 📜admin.py
 ┃ ┣ 📜apps.py
 ┃ ┣ 📜models.py
 ┃ ┣ 📜serializers.py
 ┃ ┣ 📜tests.py
 ┃ ┣ 📜urls.py
 ┃ ┣ 📜views.py
 ┃ ┗ 📜__init__.py
 ┣ 📂projetos
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂__pycache__
 ┃ ┣ 📂__pycache__
 ┃ ┣ 📜admin.py
 ┃ ┣ 📜apps.py
 ┃ ┣ 📜models.py
 ┃ ┣ 📜serializers.py
 ┃ ┣ 📜tests.py
 ┃ ┣ 📜urls.py
 ┃ ┣ 📜views.py
 ┃ ┗ 📜__init__.py
 ┣ 📂tarefas
 ┃ ┣ 📂migrations
 ┃ ┣ 📂__pycache__
 ┃ ┣ 📜admin.py
 ┃ ┣ 📜apps.py
 ┃ ┣ 📜models.py
 ┃ ┣ 📜serializers.py
 ┃ ┣ 📜tests.py
 ┃ ┣ 📜urls.py
 ┃ ┣ 📜views.py
 ┃ ┗ 📜__init__.py
 ┣ 📂usuarios
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂__pycache__
 ┃ ┣ 📂__pycache__
 ┃ ┣ 📜admin.py
 ┃ ┣ 📜apps.py
 ┃ ┣ 📜EXPLICACAO_USUARIOS.md
 ┃ ┣ 📜models.py
 ┃ ┣ 📜serializers.py
 ┃ ┣ 📜tests.py
 ┃ ┣ 📜urls.py
 ┃ ┣ 📜views.py
 ┃ ┗ 📜__init__.py
 ┣ 📜db.sqlite3
 ┣ 📜manage.py
 ┗ 📜requirements.txt
```

### 📦 backend
Diretório raiz do projeto, onde ficam os arquivos principais do Django e os apps.

### 📂 DevLab
Pacote de configuração central do Django.
- **asgi.py** → ponto de entrada para servidores ASGI (suporte a async, WebSockets).
- **wsgi.py** → ponto de entrada para servidores WSGI (deploy tradicional).
- **settings.py** → configurações globais do projeto (apps instalados, banco de dados, autenticação, timezone).
- **urls.py** → roteamento principal das URLs do projeto.
- **__init__.py** → indica que é um pacote Python.
- **__pycache__** → cache de compilação dos arquivos Python.

### 📂 equipe
App responsável por funcionalidades relacionadas à equipe.
- **models.py** → define tabelas e entidades da equipe.
- **views.py** → lógica das requisições HTTP (endpoints da API).
- **serializers.py** → conversão entre modelos e JSON.
- **urls.py** → rotas específicas do app.
- **admin.py** → registro dos modelos no painel administrativo.
- **apps.py** → configuração do app no Django.
- **tests.py** → testes automatizados.
- **migrations/** → histórico de migrações do banco.
- **__init__.py** → marca o diretório como pacote Python.

### 📂 projetos
App para gerenciar projetos.
- Estrutura idêntica ao app `equipe`, mas voltada para entidades de projetos (models, views, serializers, urls, etc.).

### 📂 tarefas
App para gerenciar tarefas.
- Estrutura idêntica: models, views, serializers, urls, admin, migrations.
- Focado em funcionalidades de tarefas vinculadas a projetos/equipe.

### 📂 usuarios
App para gerenciar usuários.
- **models.py** → definição do modelo de usuário (customizado ou extendido).
- **views.py** → endpoints de autenticação e gerenciamento de usuários.
- **serializers.py** → conversão de dados de usuário para JSON.
- **urls.py** → rotas de login, cadastro, etc.
- **admin.py** → registro do modelo de usuário no admin.
- **apps.py** → configuração do app.
- **tests.py** → testes relacionados a usuários.
- **EXPLICACAO_USUARIOS.md** → documentação explicativa sobre o módulo de usuários.
- **migrations/** → histórico de alterações no modelo de usuário.

### 📜 db.sqlite3
Banco de dados SQLite usado em ambiente de desenvolvimento.

### 📜 manage.py
Script principal para executar comandos do Django (migrate, runserver, createsuperuser, etc.).

### 📜 requirements.txt
Lista de dependências do projeto (pacotes Python necessários para rodar).

## Diagrama de Banco de Dados

![Diagrama de Banco de Dados](./docs/database_diagram.png)

> **Descrição:** Inclua um diagrama ER (Entidade-Relacionamento) gerado por ferramentas como `django-extensions` ou `pygraphviz`. Descreva as principais entidades, relacionamentos e campos críticos.

## Documentação da API
Documentação da API

A API utiliza Django Rest Framework e autenticação via JWT (JSON Web Token).

Base URL e Autenticação
* Base URL: `/api/`
* Autenticação: Para acessar as rotas protegidas, envie o token no header:
  `Authorization: Bearer <seu_token_aqui>`

Auth (Autenticação)
Endpoints para obter e atualizar tokens de acesso.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/token/` | Login. Recebe usuário/senha e retorna o par de tokens (access/refresh). |
| `POST` | `/api/token/refresh/` | Atualiza o token de acesso expirado. |



Recursos Principais

Equipes
Gerenciamento das equipes do laboratório.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/equipes/` | Lista todas as equipes. |
| `POST` | `/api/equipes/` | Cria uma nova equipe. |
| `GET` | `/api/equipes/{id}/` | Detalhes de uma equipe específica. |
| `PUT` | `/api/equipes/{id}/` | Atualiza uma equipe inteira. |
| `DELETE` | `/api/equipes/{id}/` | Remove uma equipe. |

Projetos
Gestão dos projetos em desenvolvimento.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/projetos/` | Lista todos os projetos. |
| `POST` | `/api/projetos/` | Cadastra um novo projeto. |
| `GET` | `/api/projetos/{id}/` | Visualiza um projeto. |
| `PUT` | `/api/projetos/{id}/` | Edita um projeto. |
| `DELETE` | `/api/projetos/{id}/` | Exclui um projeto. |

Tarefas
Controle de tarefas vinculadas aos projetos.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/tarefas/` | Lista todas as tarefas. |
| `POST` | `/api/tarefas/` | Cria uma nova tarefa. |
| `GET` | `/api/tarefas/{id}/` | Detalhes da tarefa. |
| `PUT` | `/api/tarefas/{id}/` | Atualiza a tarefa. |
| `DELETE` | `/api/tarefas/{id}/` | Remove a tarefa. |

Usuários e Perfil
Gerenciamento de usuários do sistema.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/usuarios/` | Lista usuários cadastrados. |
| `POST` | `/api/usuarios/` | Cadastra novo usuário. |
| `GET` | `/api/usuarios/perfil/` | Visualiza perfil do usuário logado. |
| `GET` | `/api/usuarios/{id}/` | Detalhes de um usuário específico. |

### Endpoints Principais

| Método | Endpoint              | Descrição                                | Autenticação |
|--------|-----------------------|------------------------------------------|--------------|
| GET    | `/api/items/`         | Lista todos os itens                     | Opcional     |
| POST   | `/api/items/`         | Cria um novo item                        | Requerida    |
| GET    | `/api/items/{id}/`    | Recupera um item específico              | Opcional     |
| PUT    | `/api/items/{id}/`    | Atualiza completamente um item           | Requerida    |
| PATCH  | `/api/items/{id}/`    | Atualiza parcialmente um item            | Requerida    |
| DELETE | `/api/items/{id}/`    | Remove um item                           | Requerida    |
| POST   | `/api/token/`         | Gera tokens JWT (login)                  | Opcional     |
| POST   | `/api/token/refresh/` | Atualiza o token de acesso               | Requerida    |
| GET    | `/api/users/`         | Lista usuários cadastrados               | Requerida    |
| POST   | `/api/users/`         | Cria um novo usuário                     | Requerida    |
| GET    | `/api/users/{id}/`    | Recupera dados de um usuário específico  | Requerida    |
| PUT    | `/api/users/{id}/`    | Atualiza dados de um usuário             | Requerida    |
| DELETE | `/api/users/{id}/`    | Remove um usuário                        | Requerida    |

## Configuração do Ambiente

Siga os passos abaixo para configurar o ambiente local.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/EzequielFarias144/Projeto-Integrador-DevLab
   cd Projeto-Integrador-DevLab
   ```

2. **Crie um ambiente virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

5. **Aplique as migrações e inicie o servidor:**
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```


