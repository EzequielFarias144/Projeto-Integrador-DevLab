import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Crown, GraduationCap, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api, { projetosService, usuariosService, equipesService } from "@/services/api";

interface TeamManagementProps {
  projetoId: number;
  professor?: {
    id: number;
    nome: string;
    username: string;
    email: string;
  };
  canManage: boolean;
  onUpdate: () => void;
}

interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  tipo_usuario: string;
}

interface Equipe {
  id: number;
  nome: string;
  lider_detalhes?: {
    id: number;
    nome: string;
    username: string;
  };
}

export default function TeamManagement({
  projetoId,
  professor,
  canManage,
  onUpdate,
}: TeamManagementProps) {
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedParticipante, setSelectedParticipante] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParticipantes();
    fetchEquipes();
    if (canManage) {
      fetchUsuarios();
    }
  }, [projetoId, canManage]);

  const fetchParticipantes = async () => {
    try {
      const data = await projetosService.getParticipantes(projetoId);
      setParticipantes(data);
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
    }
  };

  const fetchEquipes = async () => {
    try {
      const data = await equipesService.list(projetoId);
      setEquipes(data);
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await usuariosService.list();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const handleDefinirProfessor = async () => {
    if (!selectedProfessor) {
      toast.error("Selecione um professor");
      return;
    }

    setLoading(true);
    try {
      await projetosService.definirProfessor(projetoId, parseInt(selectedProfessor));
      toast.success("Professor definido com sucesso!");
      setSelectedProfessor("");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao definir professor");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarParticipante = async () => {
    if (!selectedParticipante) {
      toast.error("Selecione um usuário");
      return;
    }

    setLoading(true);
    try {
      await projetosService.addParticipante(projetoId, parseInt(selectedParticipante));
      toast.success("Participante adicionado com sucesso!");
      setSelectedParticipante("");
      fetchParticipantes();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao adicionar participante");
    } finally {
      setLoading(false);
    }
  };

  const professores = usuarios.filter((u) => u.tipo_usuario === "professor");
  const usuariosDisponiveis = usuarios.filter(
    (u) => !participantes.find((p) => p.id === u.id) && u.tipo_usuario === "estudante"
  );

  return (
    <div className="space-y-6">
      {/* Professor Orientador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5" />
            Professor Orientador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {professor ? (
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">{professor.nome}</p>
              <p className="text-sm text-muted-foreground">{professor.email}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum professor definido
            </p>
          )}

          {canManage && (
            <div className="flex gap-2">
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id.toString()}>
                      {prof.nome} - {prof.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleDefinirProfessor}
                disabled={loading || !selectedProfessor}
              >
                Definir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Líderes das Equipes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5" />
            Líderes das Equipes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {equipes.length > 0 ? (
            equipes.map((equipe) => (
              <div key={equipe.id} className="p-3 bg-muted rounded-md flex items-center justify-between">
                <div>
                  {equipe.lider_detalhes ? (
                    <>
                      <p className="font-medium flex items-center gap-2">
                        {equipe.lider_detalhes.nome}
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Líder da equipe: <span className="font-medium">{equipe.nome}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{equipe.nome}</p>
                      <p className="text-sm text-muted-foreground">Sem líder definido</p>
                    </>
                  )}
                </div>
                <Badge variant="secondary">{equipe.nome}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma equipe criada ainda. Vá para a aba "Equipes" para criar equipes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Participantes ({participantes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {participantes.length > 0 ? (
            <div className="space-y-2">
              {participantes.map((participante) => (
                <div
                  key={participante.id}
                  className="p-3 bg-muted rounded-md flex items-center justify-between"
                >
                  <div>
                  <p className="font-medium">
                    {participante.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participante.email} • {participante.tipo_usuario}
                    </p>
                  </div>
                  {!participante.ativo && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">
                      Inativo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum participante no projeto
            </p>
          )}

          {canManage && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex gap-2">
                <Select
                  value={selectedParticipante}
                  onValueChange={setSelectedParticipante}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar participante" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosDisponiveis.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.nome} - {usuario.tipo_usuario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAdicionarParticipante}
                  disabled={loading || !selectedParticipante}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
