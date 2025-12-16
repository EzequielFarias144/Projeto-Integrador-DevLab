import { Button } from "@/components/ui/button";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold">DevLab</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
              Recursos
            </a>
            <a
              onClick={() => navigate("/projetos-publicos")}
              className="text-foreground hover:text-primary transition-colors font-medium cursor-pointer"
            >
              Projetos Públicos
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              Sobre
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                <Button variant="default" onClick={() => navigate("/projects")}>Meus Projetos</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>Entrar</Button>
                <Button variant="default" onClick={() => navigate("/auth")}>Começar Grátis</Button>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a
              href="#features"
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Recursos
            </a>
            <a
              href="#pricing"
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Preços
            </a>
            <a
              href="#about"
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Sobre
            </a>
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                  <Button variant="default" className="w-full" onClick={() => navigate("/projects")}>
                    Meus Projetos
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/auth")}>
                    Entrar
                  </Button>
                  <Button variant="default" className="w-full" onClick={() => navigate("/auth")}>
                    Começar Grátis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;