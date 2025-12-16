import { useEffect, useState } from "react";
import { useProjetos } from "@/hooks/useProjetos";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id?: number;
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim_prevista: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado';
  is_public?: boolean;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
}

const ProjectFormDialog = ({ open, onOpenChange, editingProject }: ProjectFormDialogProps) => {
  const { createProjeto, updateProjeto } = useProjetos();
  const [formData, setFormData] = useState<Project>({
    nome: "",
    descricao: "",
    status: "nao_iniciado",
    data_inicio: "",
    data_fim_prevista: "",
    is_public: false,
  });

  useEffect(() => {
    if (editingProject) {
      setFormData(editingProject);
    } else {
      setFormData({
        nome: "",
        descricao: "",
        status: "nao_iniciado",
        data_inicio: "",
        data_fim_prevista: "",
        is_public: false,
      });
    }
  }, [editingProject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProject?.id) {
        const result = await updateProjeto(editingProject.id, formData);
        if (result.success) {
          toast.success("Projeto atualizado com sucesso!");
          onOpenChange(false);
        } else {
          const errorMsg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
          toast.error(errorMsg || "Erro ao atualizar projeto");
        }
      } else {
        const result = await createProjeto(formData);
        if (result.success) {
          toast.success("Projeto criado com sucesso!");
          onOpenChange(false);
        } else {
          const errorMsg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
          toast.error(errorMsg || "Erro ao criar projeto");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar projeto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Projeto</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim_prevista">Data de Término</Label>
              <Input
                id="data_fim_prevista"
                type="date"
                value={formData.data_fim_prevista}
                onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                min={formData.data_inicio || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
            />
            <Label htmlFor="is_public" className="text-sm font-normal cursor-pointer">
              Tornar este projeto público (visível para visitantes sem login)
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingProject ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
