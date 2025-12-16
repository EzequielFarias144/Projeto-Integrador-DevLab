import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, usuariosService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha_atual: "",
    nova_senha: "",
    confirmar_senha: "",
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    const currentUser = authService.getUser();
    setUser(currentUser);
    setFormData({
      nome: currentUser?.nome || "",
      email: currentUser?.email || "",
      senha_atual: "",
      nova_senha: "",
      confirmar_senha: "",
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    // Se estiver alterando senha, validar
    if (formData.nova_senha) {
      if (!formData.senha_atual) {
        toast.error("Senha atual é obrigatória para alterar a senha");
        return;
      }

      if (formData.nova_senha !== formData.confirmar_senha) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (formData.nova_senha.length < 6) {
        toast.error("Nova senha deve ter pelo menos 6 caracteres");
        return;
      }
    }

    setLoading(true);

    try {
      const updateData: any = {
        nome: formData.nome,
        email: formData.email,
      };

      // Adicionar senhas apenas se estiver alterando
      if (formData.nova_senha) {
        updateData.senha_atual = formData.senha_atual;
        updateData.nova_senha = formData.nova_senha;
      }

      const response = await usuariosService.updateProfile(updateData);
      
      // Atualizar usuário no localStorage
      const updatedUser = response.usuario;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Se alterou senha, precisa fazer login novamente
      if (formData.nova_senha) {
        toast.success("Perfil atualizado! Faça login novamente com a nova senha.");
        authService.logout();
        navigate("/auth");
      } else {
        toast.success("Perfil atualizado com sucesso!");
        setUser(updatedUser);
        // Limpar campos de senha
        setFormData({
          ...formData,
          senha_atual: "",
          nova_senha: "",
          confirmar_senha: "",
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-heading font-semibold">Meu Perfil</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Usuário</Label>
                  <Input
                    value={user?.tipo_usuario || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    O tipo de usuário não pode ser alterado
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deixe em branco se não quiser alterar a senha
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha_atual">Senha Atual</Label>
                      <Input
                        id="senha_atual"
                        name="senha_atual"
                        type="password"
                        value={formData.senha_atual}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nova_senha">Nova Senha</Label>
                      <Input
                        id="nova_senha"
                        name="nova_senha"
                        type="password"
                        value={formData.nova_senha}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmar_senha">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmar_senha"
                        name="confirmar_senha"
                        type="password"
                        value={formData.confirmar_senha}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
