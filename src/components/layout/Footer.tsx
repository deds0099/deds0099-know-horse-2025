import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-16 bg-secondary text-secondary-foreground animate-fade-in">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">KnowHorse</h3>
            <p className="text-sm text-secondary-foreground/80">
              A plataforma definitiva para conhecimento e eventos equestres.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Notícias
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Inscrição
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/70">
          <p>© {currentYear} KnowHorse. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
