import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, BarChart3, Shield, Zap, FileText } from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Gestão de Projetos",
    description: "Organize e acompanhe todos os projetos acadêmicos em um só lugar com visão completa de status e progresso.",
  },
  {
    icon: Users,
    title: "Equipes Dinâmicas",
    description: "Gerencie equipes, defina líderes e atribua papéis específicos para cada membro do projeto.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Completos",
    description: "Gere relatórios detalhados sobre participação, histórico e desempenho de estudantes em projetos.",
  },
  {
    icon: Shield,
    title: "Controle de Acesso",
    description: "Diferentes níveis de permissão para coordenadores, professores e estudantes com segurança garantida.",
  },
  {
    icon: Zap,
    title: "Atualizações em Tempo Real",
    description: "Acompanhe mudanças nas equipes e projetos instantaneamente, sem atrasos ou informações defasadas.",
  },
  {
    icon: FileText,
    title: "Histórico Completo",
    description: "Acesse o histórico completo de cada estudante: projetos, equipes, papéis e trajetória acadêmica.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Tudo que você precisa para
            <span className="block text-accent">
              gerenciar projetos educacionais
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Recursos completos para coordenadores, professores e estudantes trabalharem juntos de forma organizada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-medium group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;