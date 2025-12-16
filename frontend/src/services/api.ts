import axios from 'axios';

// URL base da API Django - usa variável de ambiente ou fallback para localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Instância do axios com configuração base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICAÇÃO
// ============================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  nome: string;
  tipo_usuario: 'coordenador' | 'professor' | 'estudante' | 'visitante';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE_URL}/token/`, credentials);
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    return response.data;
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    nome: string;
    cpf?: string;
    tipo_usuario?: string;
  }): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/usuarios/registro/`, userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/usuarios/perfil/');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ============================================
// PROJETOS
// ============================================

export interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim_prevista?: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado';
  participantes?: number[];
  professor?: number;
  created_by?: number;
  criado_por?: {
    id: number;
    nome: string;
    username: string;
    email: string;
  };
  professor_detalhes?: {
    id: number;
    nome: string;
    username: string;
    email: string;
  };
  lider_detalhes?: {
    id: number;
    nome: string;
    username: string;
    email: string;
  };
}

export interface ProjetoDetalhado extends Projeto {
  equipes?: any[];
  membros?: any[];
}

export const projetosService = {
  async list(): Promise<Projeto[]> {
    const response = await api.get('/projetos/');
    // Django REST Framework retorna resultados paginados com a estrutura { results: [...] }
    return response.data.results || response.data;
  },

  async get(id: number): Promise<ProjetoDetalhado> {
    const response = await api.get(`/projetos/${id}/`);
    return response.data;
  },

  async create(projeto: Partial<Projeto>): Promise<Projeto> {
    const response = await api.post('/projetos/', projeto);
    return response.data;
  },

  async update(id: number, projeto: Partial<Projeto>): Promise<Projeto> {
    const response = await api.patch(`/projetos/${id}/`, projeto);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projetos/${id}/`);
  },

  // Rotas de relacionamento
  async getEquipes(id: number) {
    const response = await api.get(`/projetos/${id}/equipes/`);
    return response.data;
  },

  async getParticipantes(id: number) {
    const response = await api.get(`/projetos/${id}/participantes/`);
    return response.data;
  },

  async addParticipante(id: number, usuarioId: number) {
    const response = await api.post(`/projetos/${id}/add_participante/`, {
      usuario_id: usuarioId,
    });
    return response.data;
  },

  async getDashboard(id: number) {
    const response = await api.get(`/projetos/${id}/dashboard/`);
    return response.data;
  },

  async definirLider(id: number, usuarioId: number) {
    const response = await api.post(`/projetos/${id}/definir-lider/`, {
      usuario_id: usuarioId,
    });
    return response.data;
  },

  async definirProfessor(id: number, professorId: number) {
    const response = await api.post(`/projetos/${id}/definir-professor/`, {
      professor_id: professorId,
    });
    return response.data;
  },

  async getRelatorios() {
    const response = await api.get('/projetos/relatorios/');
    return response.data;
  },

  async listPublic(): Promise<Projeto[]> {
    const response = await axios.get(`${API_BASE_URL}/projetos/publicos/`);
    return response.data.results || response.data;
  },
};

// ============================================
// EQUIPES
// ============================================

export interface Equipe {
  id: number;
  nome: string;
  descricao?: string;
  projeto: number;
  projeto_nome?: string;
  lider?: number;
  lider_detalhes?: {
    id: number;
    nome: string;
    username: string;
  };
  membros: number[];
  membros_detalhes?: Array<{
    id: number;
    nome: string;
    username: string;
    tipo_usuario: string;
  }>;
  data_criacao: string;
}

// ============================================
// TAREFAS
// ============================================

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta';
  data_inicio: string;
  data_fim: string;
  equipe?: number;
  responsavel?: number;
}

export const tarefasService = {
  async list(params?: {
    status?: string;
    prioridade?: string;
    equipe?: number;
    responsavel?: number;
  }): Promise<Tarefa[]> {
    const response = await api.get('/tarefas/', { params });
    return response.data;
  },

  async get(id: number): Promise<Tarefa> {
    const response = await api.get(`/tarefas/${id}/`);
    return response.data;
  },

  async create(tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const response = await api.post('/tarefas/', tarefa);
    return response.data;
  },

  async update(id: number, tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const response = await api.patch(`/tarefas/${id}/`, tarefa);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tarefas/${id}/`);
  },

  async assign(id: number, responsavelId: number): Promise<Tarefa> {
    const response = await api.post(`/tarefas/${id}/assign/`, {
      responsavel_id: responsavelId,
    });
    return response.data;
  },

  async changeStatus(id: number, status: string): Promise<Tarefa> {
    const response = await api.post(`/tarefas/${id}/change_status/`, {
      status,
    });
    return response.data;
  },
};

// ============================================
// USUÁRIOS
// ============================================

export const usuariosService = {
  async list(): Promise<User[]> {
    const response = await api.get('/usuarios/');
    return response.data;
  },

  async get(id: number): Promise<User> {
    const response = await api.get(`/usuarios/${id}/`);
    return response.data;
  },

  async updateProfile(data: {
    nome?: string;
    email?: string;
    senha_atual?: string;
    nova_senha?: string;
  }) {
    const response = await api.put('/usuarios/editar-perfil/', data);
    return response.data;
  },
};

// ============================================
// EQUIPES
// ============================================

export const equipesService = {
  async list(projetoId?: number): Promise<Equipe[]> {
    const url = projetoId ? `/equipes/?projeto=${projetoId}` : '/equipes/';
    const response = await api.get(url);
    return response.data;
  },

  async get(id: number): Promise<Equipe> {
    const response = await api.get(`/equipes/${id}/`);
    return response.data;
  },

  async create(data: {
    nome: string;
    descricao?: string;
    projeto: number;
    lider?: number;
    membros?: number[];
  }): Promise<Equipe> {
    const response = await api.post('/equipes/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Equipe>): Promise<Equipe> {
    const response = await api.put(`/equipes/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/equipes/${id}/`);
  },

  async setLider(id: number, liderId: number): Promise<Equipe> {
    const response = await api.post(`/equipes/${id}/definir-lider/`, {
      lider_id: liderId,
    });
    return response.data;
  },

  async addMembro(id: number, membroId: number): Promise<Equipe> {
    const response = await api.post(`/equipes/${id}/adicionar-membro/`, {
      usuario_id: membroId,
    });
    return response.data;
  },

  async removeMembro(id: number, membroId: number): Promise<Equipe> {
    const response = await api.delete(`/equipes/${id}/remover-membro/${membroId}/`);
    return response.data;
  },
};

export default api;
