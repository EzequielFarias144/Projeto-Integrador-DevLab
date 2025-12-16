import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("estudante");
  const [cpf, setCpf] = useState("");

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const nome = formData.get("nome") as string;
    const cpf = formData.get("cpf") as string;
    
    // Usar email como username (sem espaços ou caracteres especiais)
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      await authService.register({
        username,
        email,
        password,
        nome,
        cpf,
        tipo_usuario: tipoUsuario,
      });
      
      // Fazer login automático após registro
      await authService.login({ username, password });
      await authService.getCurrentUser();
      
      toast.success("Cadastro realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao fazer cadastro");
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const usernameOrEmail = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    // Se for email, extrair o username (mesmo padrão do registro)
    const username = usernameOrEmail.includes('@') 
      ? usernameOrEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      : usernameOrEmail;

    try {
      await authService.login({ username, password });
      await authService.getCurrentUser();
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      // Limpar dados antigos em caso de erro
      authService.logout();
      toast.error(error.response?.data?.detail || "Usuário ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para página inicial
        </Button>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>
              Entre na sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email ou Usuário</Label>
                  <Input
                    id="signin-email"
                    name="signin-email"
                    type="text"
                    placeholder="seu@email.com ou seu_usuario"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    name="signin-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Usuário</Label>
                  <Select name="tipo" value={tipoUsuario} onValueChange={setTipoUsuario} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estudante">Estudante</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
