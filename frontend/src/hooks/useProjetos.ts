import { useState, useEffect, useCallback } from 'react';
import { projetosService, Projeto, ProjetoDetalhado } from '../services/api';

export const useProjetos = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjetos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projetosService.list();
      setProjetos(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao buscar projetos');
      console.error('Erro ao buscar projetos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjetos();
  }, [fetchProjetos]);

  const createProjeto = async (projeto: Partial<Projeto>) => {
    try {
      const novoProjeto = await projetosService.create(projeto);
      // Recarrega a lista completa após criar
      await fetchProjetos();
      return { success: true, data: novoProjeto };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao criar projeto',
      };
    }
  };

  const updateProjeto = async (id: number, projeto: Partial<Projeto>) => {
    try {
      const projetoAtualizado = await projetosService.update(id, projeto);
      // Recarrega a lista completa após atualizar
      await fetchProjetos();
      return { success: true, data: projetoAtualizado };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao atualizar projeto',
      };
    }
  };

  const deleteProjeto = async (id: number) => {
    try {
      await projetosService.delete(id);
      // Recarrega a lista completa após deletar
      await fetchProjetos();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao deletar projeto',
      };
    }
  };

  return {
    projetos,
    loading,
    error,
    fetchProjetos,
    createProjeto,
    updateProjeto,
    deleteProjeto,
  };
};

export const useProjeto = (id: number) => {
  const [projeto, setProjeto] = useState<ProjetoDetalhado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjeto = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projetosService.get(id);
      setProjeto(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao buscar projeto');
      console.error('Erro ao buscar projeto:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProjeto();
    }
  }, [id, fetchProjeto]);

  const getDashboard = async () => {
    try {
      const data = await projetosService.getDashboard(id);
      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao buscar dashboard',
      };
    }
  };

  const addParticipante = async (usuarioId: number) => {
    try {
      await projetosService.addParticipante(id, usuarioId);
      await fetchProjeto(); // Recarrega o projeto
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao adicionar participante',
      };
    }
  };

  return {
    projeto,
    loading,
    error,
    fetchProjeto,
    getDashboard,
    addParticipante,
  };
};
