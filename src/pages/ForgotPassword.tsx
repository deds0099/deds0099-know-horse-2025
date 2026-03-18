import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, informe seu e-mail');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success('Link de recuperação enviado para seu e-mail!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Erro ao enviar link de recuperação. Verifique o e-mail e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Recuperar Senha</h1>
              <p className="text-muted-foreground">
                Enviaremos um link para você redefinir sua senha
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/70 border border-white/20 transition-all duration-300 overflow-hidden">
              {isSent ? (
                <div className="p-8 text-center space-y-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Confira seu e-mail</h2>
                  <p className="text-muted-foreground">
                    Enviamos as instruções para <strong>{email}</strong>. 
                    Se você não vir o e-mail em instantes, verifique sua pasta de spam.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/login">Voltar para Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Esqueceu a senha?</CardTitle>
                    <CardDescription>
                      Digite o e-mail associado à sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </Button>
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para Login
                    </Link>
                  </CardFooter>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
