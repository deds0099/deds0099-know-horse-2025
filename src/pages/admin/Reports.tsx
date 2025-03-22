import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// Função para buscar inscrições pagas
const fetchPaidSubscriptions = async () => {
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

// Função para formatar a data
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const Reports = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { 
    data: paidSubscriptions = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['paid-subscriptions'],
    queryFn: fetchPaidSubscriptions,
    enabled: !!user
  });
  
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar inscrições pagas');
      console.error(error);
    }
  }, [error]);

  const generatePDF = () => {
    try {
      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(20);
      doc.text('Relatório de Inscrições Pagas - Congresso Equestre 2025', 14, 20);
      
      // Adicionar data do relatório
      doc.setFontSize(10);
      doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 14, 30);
      
      // Adicionar total de inscrições
      doc.text(`Total de inscrições pagas: ${paidSubscriptions.length}`, 14, 40);
      
      // Preparar dados para a tabela
      const tableData = paidSubscriptions.map(subscription => [
        subscription.name,
        subscription.email,
        subscription.phone,
        subscription.cpf,
        subscription.institution,
        formatDate(subscription.created_at)
      ]);
      
      // Adicionar tabela
      autoTable(doc, {
        head: [['Nome', 'Email', 'Telefone', 'CPF', 'Instituição', 'Data de Inscrição']],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [136, 132, 216]
        }
      });
      
      // Salvar o PDF
      doc.save('inscricoes-pagas-congresso-equestre-2025.pdf');
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o relatório');
    }
  };
  
  if (isAuthLoading) {
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Relatórios</h1>
              <p className="text-muted-foreground">
                Gere relatórios das inscrições do Congresso Equestre 2025
              </p>
            </div>
            <Button onClick={() => navigate('/admin/dashboard')} className="mt-4 md:mt-0">
              Voltar para o Dashboard
            </Button>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/70 border border-white/20">
            <CardHeader>
              <CardTitle>Relatório de Inscrições Pagas</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : `${paidSubscriptions.length} inscrições pagas encontradas`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Este relatório inclui todas as inscrições marcadas como pagas, com os seguintes dados:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Nome completo do inscrito</li>
                  <li>Email de contato</li>
                  <li>Telefone</li>
                  <li>CPF</li>
                  <li>Instituição</li>
                  <li>Data de inscrição</li>
                </ul>
                <Button 
                  onClick={generatePDF}
                  disabled={isLoading || paidSubscriptions.length === 0}
                  className="w-full md:w-auto mt-4"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {isLoading ? 'Carregando...' : 'Gerar Relatório PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Reports; 