import { useState, useEffect } from "react";
import { equipesService, usuariosService, type Equipe, type User } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, UserMinus, Edit2, X, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface EquipeManagerProps {
  projetoId: number;
  participantes: Array<{
    id: number;
    nome: string;
    username: string;
    tipo_usuario: string;
  }>;
  isCriador: boolean;
}

export default function EquipeManager({ projetoId, participantes, isCriador }: EquipeManagerProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    lider: "",
  });

  useEffect(() => {
    fetchEquipes();
  }, [projetoId]);

  const fetchEquipes = async () => {
    try {
      setLoading(true);
      const data = await equipesService.list(projetoId);
      setEquipes(data);
    } catch (error: any) {
      toast.error("Erro ao carregar equipes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        nome: formData.nome,
        descricao: formData.descricao,
        projeto: projetoId,
        lider: formData.lider ? parseInt(formData.lider) : undefined,
      };

      if (editingEquipe) {
        await equipesService.update(editingEquipe.id, data);
        toast.success("Equipe atualizada com sucesso!");
      } else {
        await equipesService.create(data);
        toast.success("Equipe criada com sucesso!");
      }

      setFormData({ nome: "", descricao: "", lider: "" });
      setShowForm(false);
      setEditingEquipe(null);
      fetchEquipes();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao salvar equipe");
    }
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      nome: equipe.nome,
      descricao: equipe.descricao || "",
      lider: equipe.lider?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;

    try {
      await equipesService.delete(id);
      toast.success("Equipe excluída com sucesso!");
      fetchEquipes();
    } catch (error: any) {
      toast.error("Erro ao excluir equipe");
    }
  };

  const handleAddMembro = async (equipeId: number, membroId: number) => {
    try {
      const updatedEquipe = await equipesService.addMembro(equipeId, membroId);
      setEquipes(equipes.map(e => e.id === equipeId ? updatedEquipe : e));
      toast.success("Membro adicionado à equipe!");
    } catch (error: any) {
      toast.error(error.response?.data?.erro || "Erro ao adicionar membro");
    }
  };

  const handleRemoveMembro = async (equipeId: number, membroId: number) => {
    try {
      await equipesService.removeMembro(equipeId, membroId);
      toast.success("Membro removido da equipe!");
      fetchEquipes();
    } catch (error: any) {
      toast.error("Erro ao remover membro");
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingEquipe(null);
    setFormData({ nome: "", descricao: "", lider: "" });
  };

  // Filtrar apenas estudantes para serem membros
  const estudantes = participantes.filter(p => p.tipo_usuario === 'estudante');

  if (loading) {
    return <div className="text-center py-4">Carregando equipes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Equipes do Projeto</h3>
        {isCriador && !showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Equipe
          </Button>
        )}
      </div>

      {showForm && isCriador && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEquipe ? "Editar Equipe" : "Nova Equipe"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Equipe</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Equipe Frontend"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva as responsabilidades da equipe..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lider">Líder da Equipe</Label>
                <Select value={formData.lider} onValueChange={(value) => setFormData({ ...formData, lider: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um líder (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {estudantes.map((estudante) => (
                      <SelectItem key={estudante.id} value={estudante.id.toString()}>
                        {estudante.nome} ({estudante.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  {editingEquipe ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {equipes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma equipe criada ainda. {isCriador && "Crie a primeira equipe!"}
        </p>
      ) : (
        <div className="grid gap-4">
          {equipes.map((equipe) => (
            <Card key={equipe.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{equipe.nome}</CardTitle>
                  {isCriador && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(equipe)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(equipe.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                {equipe.descricao && (
                  <p className="text-sm text-muted-foreground">{equipe.descricao}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {equipe.lider_detalhes && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Líder:</p>
                    <p className="text-sm text-muted-foreground">
                      {equipe.lider_detalhes.nome} (@{equipe.lider_detalhes.username})
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">
                      Membros ({equipe.membros_detalhes?.length || 0})
                    </p>
                    {isCriador && (
                      <Select
                        onValueChange={(value) => handleAddMembro(equipe.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-[200px]">
                          <UserPlus className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Adicionar membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {estudantes
                            .filter(e => !(equipe.membros || []).includes(e.id))
                            .map((estudante) => (
                              <SelectItem key={estudante.id} value={estudante.id.toString()}>
                                {estudante.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {equipe.membros_detalhes && equipe.membros_detalhes.length > 0 ? (
                    <div className="space-y-2">
                      {equipe.membros_detalhes.map((membro) => (
                        <div
                          key={membro.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <span className="text-sm">
                            {membro.nome} (@{membro.username})
                          </span>
                          {isCriador && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMembro(equipe.id, membro.id)}
                            >
                              <UserMinus className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum membro ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
