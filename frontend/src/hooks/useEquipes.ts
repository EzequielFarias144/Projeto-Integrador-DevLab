import { useState, useEffect, useCallback } from 'react';
import { equipesService, Equipe } from '../services/api';

export const useEquipes = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipesService.list();
      setEquipes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao buscar equipes');
      console.error('Erro ao buscar equipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipes();
  }, [fetchEquipes]);

  const createEquipe = async (equipe: Partial<Equipe>) => {
    try {
      const novaEquipe = await equipesService.create({
        nome: equipe.nome!,
        descricao: equipe.descricao,
        projeto: equipe.projeto!,
        lider: equipe.lider,
        membros: equipe.membros
      });
      setEquipes((prev) => [...prev, novaEquipe]);
      return { success: true, data: novaEquipe };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao criar equipe',
      };
    }
  };

  const updateEquipe = async (id: number, equipe: Partial<Equipe>) => {
    try {
      const equipeAtualizada = await equipesService.update(id, equipe);
      setEquipes((prev) =>
        prev.map((e) => (e.id === id ? equipeAtualizada : e))
      );
      return { success: true, data: equipeAtualizada };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao atualizar equipe',
      };
    }
  };

  const deleteEquipe = async (id: number) => {
    try {
      await equipesService.delete(id);
      setEquipes((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao deletar equipe',
      };
    }
  };

  return {
    equipes,
    loading,
    error,
    fetchEquipes,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    definirLider,
  };
};
