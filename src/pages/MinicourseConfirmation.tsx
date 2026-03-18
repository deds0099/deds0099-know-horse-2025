import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, CalendarClock, Check, Download, MapPin, User } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Minicourse, MinicourseRegistration } from '@/types';

const MinicourseConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [registration, setRegistration] = useState<MinicourseRegistration | null>(null);
  const [minicourse, setMinicourse] = useState<Minicourse | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      navigate('/minicourses');
    }
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch registration data
      const { data: registrationData, error: registrationError } = await supabase
        .from('minicourse_registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (registrationError) {
        console.error('Erro ao buscar inscrição:', registrationError);
        throw registrationError;
      }

      if (!registrationData) {
        toast.error('Inscrição não encontrada');
        navigate('/minicourses');
        return;
      }

      setRegistration(registrationData);

      // Fetch minicourse data
      const { data: minicourseData, error: minicourseError } = await supabase
        .from('minicourses')
        .select('*')
        .eq('id', registrationData.minicourse_id)
        .single();

      if (minicourseError) {
        console.error('Erro ao buscar minicurso:', minicourseError);
        throw minicourseError;
      }

      if (!minicourseData) {
        toast.error('Minicurso não encontrado');
        navigate('/minicourses');
        return;
      }

      setMinicourse(minicourseData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da inscrição');
      navigate('/minicourses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!registration || !minicourse) return;

    try {
      // Create a receipt text
      const receiptContent = `
Comprovante de Inscrição - Minicurso
-----------------------------------
Título: ${minicourse.title || 'Minicurso'}
Nome: ${registration.name}
E-mail: ${registration.email}
CPF: ${registration.cpf}
Telefone: ${registration.phone || 'Não informado'}
Instituição: ${registration.institution || 'Não informada'}
-----------------------------------
Data do Minicurso: ${minicourse.date || 'A definir'}
Horário: ${minicourse.time || 'A definir'}
Local: ${minicourse.location || 'A definir'}
Valor: R$ ${minicourse.price.toFixed(2)}
-----------------------------------
Status de Pagamento: ${registration.is_paid ? 'PAGO' : 'AGUARDANDO PAGAMENTO'}
Data da Inscrição: ${new Date(registration.created_at).toLocaleDateString('pt-BR')}
ID da Inscrição: ${registration.id}
-----------------------------------
Informações Importantes:
- Apresente este comprovante no dia do evento.
- O pagamento deverá ser efetuado no local do evento.
- Em caso de dúvidas, entre em contato com a organização.
      `;
      
      // Create a blob and download it
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `comprovante_inscricao_${registration.id.substring(0, 8)}.txt`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Comprovante gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      toast.error('Erro ao gerar comprovante');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando dados da inscrição...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!registration || !minicourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <p className="text-xl">Dados da inscrição não encontrados.</p>
              <Button className="mt-4" onClick={() => navigate('/minicourses')}>
                Voltar para Minicursos
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/minicourses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Minicursos
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Inscrição Confirmada!</h1>
            <p className="text-xl text-muted-foreground">
              Sua inscrição para o minicurso foi realizada com sucesso!
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comprovante de Inscrição</CardTitle>
              <CardDescription>
                Detalhes da sua inscrição no minicurso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{minicourse.title || 'Minicurso'}</h3>
                {minicourse.description && (
                  <p className="text-muted-foreground">{minicourse.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Dados do Participante</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{registration.name}</span>
                      </div>
                      <p>E-mail: {registration.email}</p>
                      <p>CPF: {registration.cpf}</p>
                      {registration.phone && <p>Telefone: {registration.phone}</p>}
                      {registration.institution && <p>Instituição: {registration.institution}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Dados do Minicurso</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Data: {minicourse.date || 'A definir'}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Horário: {minicourse.time || 'A definir'}</span>
                      </div>
                      {minicourse.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Local: {minicourse.location}</span>
                        </div>
                      )}
                      <p>Valor: <strong>R$ {minicourse.price.toFixed(2)}</strong></p>
                      <p>Status: <span className={registration.is_paid ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                        {registration.is_paid ? "Pago" : "Aguardando pagamento"}
                      </span></p>
                      
                      {!registration.is_paid && (
                        <div className="mt-2">
                          <Button
                            onClick={() => window.location.href = 'https://know-horse.pay.yampi.com.br/r/IWTWBZ0IF0'}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Realizar Pagamento
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  ID da inscrição: {registration.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data da inscrição: {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 border rounded-lg bg-amber-50 border-amber-200 mb-8">
            <h3 className="font-semibold text-amber-800 mb-2">Informações Importantes</h3>
            <ul className="space-y-2 text-amber-700">
              <li>• Por favor, salve ou imprima este comprovante de inscrição.</li>
              <li>• O pagamento deverá ser efetuado no local do evento.</li>
              <li>• Sua inscrição só estará confirmada após o pagamento e validação pela organização.</li>
              <li>• Em caso de dúvidas, entre em contato com a organização do evento.</li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleDownloadReceipt}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Comprovante
            </Button>
            <Button 
              onClick={() => navigate('/minicourses')}
              className="w-full md:w-auto"
            >
              Ver Outros Minicursos
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MinicourseConfirmation; 