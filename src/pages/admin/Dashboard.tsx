import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchSubscriptions = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_paid', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
};

const fetchSubscriptionsByMonth = async () => {
  // Esta query agrupa as inscrições pagas por mês
  const { data, error } = await supabase
    .from('subscriptions')
    .select('created_at')
    .eq('is_paid', true)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Processar os dados para agrupar por mês
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const subscriptionsByMonth = Array(12).fill(0).map((_, index) => ({
    month: months[index],
    count: 0
  }));
  
  if (data) {
    data.forEach(subscription => {
      const date = new Date(subscription.created_at);
      const monthIndex = date.getMonth();
      subscriptionsByMonth[monthIndex].count += 1;
    });
  }
  
  // Retornar apenas os meses que têm dados ou os últimos 6 meses
  return subscriptionsByMonth.filter(month => month.count > 0).slice(-6);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  // Buscar inscrições
  const { 
    data: subscriptions = [], 
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
    enabled: !!user
  });
  
  // Buscar inscrições por mês para o gráfico
  const { 
    data: subscriptionsByMonth = [], 
    isLoading: isLoadingChart,
    error: chartError
  } = useQuery({
    queryKey: ['subscriptionsByMonth'],
    queryFn: fetchSubscriptionsByMonth,
    enabled: !!user
  });
  
  // Mostrar erros de carregamento, se houver
  useEffect(() => {
    if (subscriptionsError) {
      toast.error('Erro ao carregar inscrições: ' + subscriptionsError.message);
    }
    if (chartError) {
      toast.error('Erro ao carregar dados do gráfico: ' + chartError.message);
    }
  }, [subscriptionsError, chartError]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  const totalSubscriptions = subscriptions.length;
  
  // Calcular crescimento em relação ao mês anterior
  const calculateGrowth = () => {
    if (subscriptionsByMonth.length < 2) return 0;
    
    const currentMonth = subscriptionsByMonth[subscriptionsByMonth.length - 1].count;
    const previousMonth = subscriptionsByMonth[subscriptionsByMonth.length - 2].count;
    
    if (previousMonth === 0) return 100;
    return Math.round((currentMonth - previousMonth) / previousMonth * 100);
  };
  
  const growth = calculateGrowth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-xl text-muted-foreground">
              Bem-vindo, {user.email}. Gerencie o Congresso Equestre 2025.
            </p>
          </div>
          
          <div className="mb-8 p-6 bg-primary/10 rounded-lg text-center animate-pulse">
            <div className="space-y-2">
              <p className="text-xl font-bold text-primary">
                04/03 - 13/04
              </p>
              <p className="text-2xl font-bold text-primary">
                1º LOTE: R$ 200,00
              </p>
              <div className="h-px bg-primary/20 my-3"></div>
              <p className="text-xl font-bold text-primary">
                14/04 - 30/04
              </p>
              <p className="text-2xl font-bold text-primary">
                2º LOTE: R$ 250,00
              </p>
              <div className="h-px bg-primary/20 my-3"></div>
              <p className="text-xl font-bold text-primary">
                01/05 - 08/05
              </p>
              <p className="text-2xl font-bold text-primary">
                3º LOTE: R$ 300,00
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/70 border border-white/20 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Inscrições Pagas</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoadingSubscriptions ? (
                  <div className="h-10 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                    <span>Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{totalSubscriptions}</div>
                    <p className="text-sm text-muted-foreground">
                      {growth > 0 ? `+${growth}%` : `${growth}%`} em relação ao mês anterior
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2 backdrop-blur-sm bg-white/70 border border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Inscrições Pagas nos Últimos Meses</CardTitle>
                <CardDescription>
                  Evolução do número de inscrições pagas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingChart ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subscriptionsByMonth}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 border border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerencie recursos do congresso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-between" onClick={() => navigate('/admin/news')}>
                  Gerenciar Notícias <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline" onClick={() => navigate('/admin/schedule')}>
                  Gerenciar Programação <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline" onClick={() => navigate('/admin/subscriptions')}>
                  Ver Inscrições <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline" onClick={() => navigate('/admin/reports')}>
                  Relatórios <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  Configurações <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
