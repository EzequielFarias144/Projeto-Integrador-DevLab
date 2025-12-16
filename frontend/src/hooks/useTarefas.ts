import { useState, useEffect, useCallback } from 'react';
import { tarefasService, Tarefa } from '../services/api';

export const useTarefas = (filters?: {
  status?: string;
  prioridade?: string;
  equipe?: number;
  responsavel?: number;
}) => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tarefasService.list(filters);
      setTarefas(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao buscar tarefas');
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const createTarefa = async (tarefa: Partial<Tarefa>) => {
    try {
      const novaTarefa = await tarefasService.create(tarefa);
      setTarefas((prev) => [...prev, novaTarefa]);
      return { success: true, data: novaTarefa };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao criar tarefa',
      };
    }
  };

  const updateTarefa = async (id: number, tarefa: Partial<Tarefa>) => {
    try {
      const tarefaAtualizada = await tarefasService.update(id, tarefa);
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? tarefaAtualizada : t))
      );
      return { success: true, data: tarefaAtualizada };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao atualizar tarefa',
      };
    }
  };

  const deleteTarefa = async (id: number) => {
    try {
      await tarefasService.delete(id);
      setTarefas((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao deletar tarefa',
      };
    }
  };

  const assignTarefa = async (id: number, responsavelId: number) => {
    try {
      const tarefaAtribuida = await tarefasService.assign(id, responsavelId);
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? tarefaAtribuida : t))
      );
      return { success: true, data: tarefaAtribuida };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao atribuir tarefa',
      };
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      const tarefaAtualizada = await tarefasService.changeStatus(id, status);
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? tarefaAtualizada : t))
      );
      return { success: true, data: tarefaAtualizada };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data || 'Erro ao mudar status da tarefa',
      };
    }
  };

  return {
    tarefas,
    loading,
    error,
    fetchTarefas,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    assignTarefa,
    changeStatus,
  };
};
