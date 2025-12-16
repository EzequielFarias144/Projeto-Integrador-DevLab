import { Code2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">DevLab</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestão completa de projetos educacionais para instituições de ensino.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Segurança
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 DevLab. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;