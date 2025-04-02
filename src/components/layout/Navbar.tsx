import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Notícias', path: '/news' },
    { name: 'Submissão', path: '/submission' },
    { name: 'Inscrição', path: '/register' }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Notícias', path: '/admin/news' },
    { name: 'Inscrições', path: '/admin/subscriptions' }
  ];

  const getLinks = () => {
    if (isAuthenticated && user?.isAdmin) {
      return adminLinks;
    }
    return navLinks;
  };

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout na Navbar...');
      await logout();
      console.log('Logout realizado com sucesso, redirecionando para página inicial');
      
      // Forçar um delay antes do redirecionamento para garantir que o estado seja atualizado
      setTimeout(() => {
        console.log('Executando redirecionamento para home');
        navigate('/', { replace: true });
        
        // Forçar recarga da página para garantir um estado limpo
        setTimeout(() => {
          console.log('Forçando recarga da página');
          window.location.href = '/';
        }, 100);
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer logout na Navbar:', error);
      toast?.error?.('Erro ao fazer logout. Tente recarregar a página.');
      
      // Mesmo com erro, tenta redirecionar
      navigate('/', { replace: true });
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center"
          >
            <img 
              src="https://uploaddeimagens.com.br/images/004/885/693/original/LOGO_KNOW_HORSE_2025-1-removebg-preview.png?1742243395" 
              alt="KnowHorse Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {getLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary hover:bg-accent/50'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="ml-2"
              >
                Sair
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="ml-2"
              >
                <Link to="/login">Admin</Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent/50 focus:outline-none"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background pt-16 animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {getLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-3 rounded-md text-lg font-medium transition-colors animate-slide-in',
                  location.pathname === link.path
                    ? 'bg-accent text-primary'
                    : 'text-foreground hover:bg-accent/50 hover:text-primary'
                )}
                style={{ animationDelay: '100ms' }}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="w-full mt-4 animate-slide-in"
                style={{ animationDelay: '200ms' }}
              >
                Sair
              </Button>
            ) : (
              <Button
                asChild
                variant="default"
                className="w-full mt-4 animate-slide-in"
                style={{ animationDelay: '200ms' }}
              >
                <Link to="/login">Admin</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
