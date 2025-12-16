import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api, { projetosService } from "@/services/api";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: number;
  editingTask?: any;
  onSuccess?: () => void;
}

const TaskFormDialog = ({ open, onOpenChange, projetoId, editingTask, onSuccess }: TaskFormDialogProps) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "nao_iniciado",
    prioridade: 2,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim_prevista: "",
    responsavel_id: "",
  });
  
  const [participantes, setParticipantes] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchParticipantes();
    }
  }, [open, projetoId]);

  const fetchParticipantes = async () => {
    try {
      const data = await projetosService.getParticipantes(projetoId);
      setParticipantes(data.filter((p: any) => p.ativo && p.tipo_usuario === 'estudante'));
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
    }
  };

  useEffect(() => {
    if (editingTask) {
      setFormData({
        titulo: editingTask.titulo || "",
        descricao: editingTask.descricao || "",
        status: editingTask.status || "nao_iniciado",
        prioridade: editingTask.prioridade || 2,
        data_inicio: editingTask.data_inicio || new Date().toISOString().split('T')[0],
        data_fim_prevista: editingTask.data_fim_prevista || "",
        responsavel_id: editingTask.responsavel?.toString() || "",
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        status: "nao_iniciado",
        prioridade: 2,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim_prevista: "",
        responsavel_id: "",
      });
    }
  }, [editingTask, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        responsavel_id: formData.responsavel_id ? parseInt(formData.responsavel_id) : null,
      };
      
      if (editingTask?.id) {
        await api.patch(`/tarefas/${editingTask.id}/`, payload);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await api.post(`/projetos/${projetoId}/tarefas/`, payload);
        toast.success("Tarefa criada com sucesso!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error.response?.data ? 
        (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) :
        "Erro ao salvar tarefa";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade.toString()}
                onValueChange={(value) => setFormData({ ...formData, prioridade: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Alta</SelectItem>
                  <SelectItem value="2">Média</SelectItem>
                  <SelectItem value="3">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável (Estudante do Projeto)</Label>
            <Select
              value={formData.responsavel_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, responsavel_id: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {participantes.map((participante) => (
                  <SelectItem key={participante.id} value={participante.id.toString()}>
                    {participante.nome} - {participante.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim_prevista">Data de Término Prevista</Label>
              <Input
                id="data_fim_prevista"
                type="date"
                value={formData.data_fim_prevista}
                onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTask ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
