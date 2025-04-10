import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, Copy, Download, FileText, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Minicourse, MinicourseRegistration } from '@/types';
// PDF generation imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MinicourseRegistrations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [minicourse, setMinicourse] = useState<Minicourse | null>(null);
  const [registrations, setRegistrations] = useState<MinicourseRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch minicourse and registrations data
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
      return;
    }

    if (user && id) {
      fetchData();
    }
  }, [user, isAuthLoading, id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch minicourse data
      const { data: minicourseData, error: minicourseError } = await supabase
        .from('minicourses')
        .select('*')
        .eq('id', id)
        .single();

      if (minicourseError) throw minicourseError;

      if (!minicourseData) {
        toast.error('Minicurso não encontrado');
        navigate('/admin/minicourses');
        return;
      }

      setMinicourse(minicourseData);

      // Fetch registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('minicourse_registrations')
        .select('*')
        .eq('minicourse_id', id)
        .order('created_at', { ascending: false });

      if (registrationsError) throw registrationsError;

      setRegistrations(registrationsData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePaid = async (registration: MinicourseRegistration) => {
    try {
      const now = new Date().toISOString();
      const newIsPaid = !registration.is_paid;
      
      const updates = {
        is_paid: newIsPaid,
        paid_at: newIsPaid ? now : null,
        updated_at: now
      };

      const { error } = await supabase
        .from('minicourse_registrations')
        .update(updates)
        .eq('id', registration.id);

      if (error) throw error;

      toast.success(`Inscrição marcada como ${newIsPaid ? 'paga' : 'não paga'}`);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Erro ao atualizar status de pagamento:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
      .then(() => toast.success('E-mail copiado para a área de transferência'))
      .catch(() => toast.error('Erro ao copiar e-mail'));
  };

  const exportToPDF = () => {
    if (!registrations.length) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título do documento
      const minicourseTitle = minicourse?.title || 'Minicurso';
      doc.setFontSize(16);
      doc.text(`Inscrições - ${minicourseTitle}`, 14, 20);
      
      // Informações do minicurso
      doc.setFontSize(12);
      const date = new Date().toLocaleDateString('pt-BR');
      doc.text(`Data de geração: ${date}`, 14, 30);
      
      if (minicourse) {
        doc.text(`Vagas: ${minicourse.vacancies_left} / ${minicourse.vacancies}`, 14, 38);
        doc.text(`Valor: R$ ${minicourse.price.toFixed(2)}`, 14, 46);
        if (minicourse.date && minicourse.time) {
          doc.text(`Data e horário: ${minicourse.date} - ${minicourse.time}`, 14, 54);
        }
        if (minicourse.location) {
          doc.text(`Local: ${minicourse.location}`, 14, 62);
        }
      }
      
      doc.line(14, 70, 196, 70); // Linha horizontal
      
      // Converter registros para o formato da tabela
      const tableData = registrations.map(registration => [
        registration.name,
        registration.email,
        registration.cpf,
        registration.phone || '-',
        registration.institution || '-',
        registration.is_paid ? 'Pago' : 'Não pago',
        new Date(registration.created_at).toLocaleDateString('pt-BR'),
        registration.paid_at ? new Date(registration.paid_at).toLocaleDateString('pt-BR') : '-'
      ]);
      
      // Criar a tabela com a função importada corretamente
      autoTable(doc, {
        startY: 75,
        head: [['Nome', 'Email', 'CPF', 'Telefone', 'Instituição', 'Status', 'Data Inscrição', 'Data Pagamento']],
        body: tableData,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 35 }, // Nome
          1: { cellWidth: 40 }, // Email
          2: { cellWidth: 25 }, // CPF
          3: { cellWidth: 20 }, // Telefone
          4: { cellWidth: 25 }, // Instituição
          5: { cellWidth: 15 }, // Status
          6: { cellWidth: 18 }, // Data Inscrição
          7: { cellWidth: 18 }  // Data Pagamento
        }
      });
      
      // Obter a posição Y final da tabela
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Estatísticas no rodapé
      const totalPaid = registrations.filter(r => r.is_paid).length;
      const totalUnpaid = registrations.length - totalPaid;
      
      doc.setFontSize(11);
      doc.text(`Total de inscrições: ${registrations.length}`, 14, finalY);
      doc.text(`Inscrições pagas: ${totalPaid}`, 14, finalY + 8);
      doc.text(`Inscrições não pagas: ${totalUnpaid}`, 14, finalY + 16);
      
      // Adicionar rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Know Horse Hub - Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, doc.internal.pageSize.width - 65, doc.internal.pageSize.height - 10);
      }
      
      // Salvar o PDF
      const fileName = `inscricoes_${minicourse?.title.replace(/\s+/g, '_') || 'minicurso'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório PDF gerado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar relatório PDF. Verifique o console para mais detalhes.');
    }
  };

  const handleDeleteRegistration = async (registration: MinicourseRegistration) => {
    if (!confirm(`Tem certeza que deseja excluir a inscrição de ${registration.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // Remover a inscrição
      const { error: deleteError } = await supabase
        .from('minicourse_registrations')
        .delete()
        .eq('id', registration.id);

      if (deleteError) throw deleteError;

      // Sempre devolver a vaga ao minicurso quando uma inscrição é excluída
      if (minicourse) {
        const { error: updateError } = await supabase
          .from('minicourses')
          .update({ 
            vacancies_left: minicourse.vacancies_left + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', minicourse.id);
        
        if (updateError) {
          console.error('Erro ao atualizar vagas disponíveis:', updateError);
          // Continuar mesmo com erro para não prejudicar a experiência do usuário
        }
      }

      toast.success('Inscrição excluída com sucesso');
      fetchData(); // Atualizar dados
    } catch (error: any) {
      console.error('Erro ao excluir inscrição:', error);
      toast.error('Erro ao excluir inscrição');
    }
  };

  // Filter registrations based on search term and active tab
  const filteredRegistrations = registrations.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cpf.includes(searchTerm) ||
      (item.phone && item.phone.includes(searchTerm)) ||
      (item.institution && item.institution.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'paid') return matchesSearch && item.is_paid;
    if (activeTab === 'unpaid') return matchesSearch && !item.is_paid;
    
    return matchesSearch;
  });

  // Loading state
  if (isAuthLoading || (isLoading && !minicourse)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/admin/minicourses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Minicursos
          </Button>

          {minicourse && (
            <div className="mb-8">
              <div className="text-center md:text-left mb-4">
                <h1 className="text-3xl font-bold mb-2">{minicourse.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    R$ {minicourse.price.toFixed(2)}
                  </Badge>
                  <Badge>
                    {minicourse.vacancies_left} / {minicourse.vacancies} vagas disponíveis
                  </Badge>
                  {minicourse.type && (
                    <Badge variant="secondary">
                      {minicourse.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Inscrições</CardTitle>
              <CardDescription>
                Gerencie as inscrições para este minicurso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, e-mail, CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    className="shrink-0"
                    onClick={exportToPDF}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Exportar PDF
                  </Button>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">
                      Todas ({registrations.length})
                    </TabsTrigger>
                    <TabsTrigger value="paid">
                      Pagas ({registrations.filter(r => r.is_paid).length})
                    </TabsTrigger>
                    <TabsTrigger value="unpaid">
                      Não Pagas ({registrations.filter(r => !r.is_paid).length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4">
                    {renderRegistrationsTable(filteredRegistrations)}
                  </TabsContent>
                  
                  <TabsContent value="paid" className="mt-4">
                    {renderRegistrationsTable(filteredRegistrations)}
                  </TabsContent>
                  
                  <TabsContent value="unpaid" className="mt-4">
                    {renderRegistrationsTable(filteredRegistrations)}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );

  function renderRegistrationsTable(items: MinicourseRegistration[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Nenhuma inscrição encontrada com esses critérios de busca' 
              : activeTab === 'all' 
                ? 'Nenhuma inscrição realizada para este minicurso' 
                : activeTab === 'paid' 
                  ? 'Nenhuma inscrição paga para este minicurso' 
                  : 'Nenhuma inscrição não paga para este minicurso'}
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="hidden md:table-cell">CPF</TableHead>
              <TableHead className="hidden md:table-cell">Instituição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Data Inscrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="truncate max-w-[150px]">{item.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopyEmail(item.email)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.cpf}</TableCell>
                <TableCell className="hidden md:table-cell">{item.institution || '-'}</TableCell>
                <TableCell>
                  {item.is_paid ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Pago
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      Não pago
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant={item.is_paid ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleTogglePaid(item)}
                    >
                      {item.is_paid ? (
                        <>
                          <X className="mr-1 h-4 w-4" /> Não pago
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Pago
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteRegistration(item)}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default MinicourseRegistrations; 