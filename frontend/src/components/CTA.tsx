import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Pronto para transformar a gestão dos seus
            <span className="block text-accent">
              projetos acadêmicos?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Junte-se a centenas de instituições que já organizaram seus projetos educacionais com o DevLab.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="xl" className="group" onClick={() => navigate("/auth")}>
              Começar Gratuitamente
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="xl" onClick={() => navigate("/auth")}>
              Criar Conta
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4">
            Sem cartão de crédito • Configuração em 5 minutos • Suporte dedicado
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;