import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { supabase } from '@/lib/supabase';

// Default values
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
  resetPassword: async () => { },
  updatePassword: async () => { },
  isAuthenticated: false
};

// Create context
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para determinar se o usuário é admin
  const checkIsAdmin = (supabaseUser: any) => {
    // Lista de emails admin ou lógica específica
    const adminEmails = ['thiago.souza@exemplo.com', 'admin@knowhorse.com.br'];
    return adminEmails.includes(supabaseUser.email || '') || supabaseUser.user_metadata?.role === 'admin';
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          const isAdmin = checkIsAdmin(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            isAdmin: isAdmin,
            role: isAdmin ? 'admin' : 'member'
          });
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isAdmin = checkIsAdmin(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name,
          isAdmin: isAdmin,
          role: isAdmin ? 'admin' : 'member'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const isAdmin = checkIsAdmin(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          isAdmin: isAdmin,
          role: isAdmin ? 'admin' : 'member'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);

    try {
      console.log('Iniciando processo de logout...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro no signOut do Supabase:', error);
        throw error;
      }

      console.log('Supabase signOut bem-sucedido, limpando estado do usuário');
      // Limpar explicitamente o estado do usuário
      setUser(null);

      // Forçar limpeza de qualquer armazenamento local que possa estar mantendo o estado
      localStorage.removeItem('supabase.auth.token');

      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro completo durante logout:', error);
      // Mesmo com erro, tentamos limpar o estado do usuário
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create auth value object
  const authValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
