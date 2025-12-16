import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                Gestão de Projetos Educacionais
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Organize seus
              <span className="block text-primary">
                projetos acadêmicos
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              DevLab centraliza a gestão de projetos, equipes e estudantes em uma única plataforma. 
              Diga adeus às planilhas e relatórios manuais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" onClick={() => navigate("/auth")}>
                Começar Gratuitamente
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="xl" className="group" onClick={() => navigate("/projetos-publicos")}>
                <PlayCircle className="mr-2 group-hover:scale-110 transition-transform" />
                Ver Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold">+ de 1000 estudantes</p>
                <p className="text-xs text-muted-foreground">usando o DevLab</p>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
            <img
              src={heroImage}
              alt="Estudantes colaborando em projetos"
              className="relative rounded-2xl shadow-large w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;