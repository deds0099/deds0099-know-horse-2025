import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CalendarClock, Users, MapPin, User, Tag, Info } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Minicourse } from '@/types';

// Função para formatar CPF
const formatCPF = (value: string) => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');

  // Aplica formatação: XXX.XXX.XXX-XX
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// Função para formatar telefone
const formatPhone = (value: string) => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');

  // Aplica formatação: (XX) XXXXX-XXXX
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }
  return numericValue.slice(0, 11);
};

const MinicourseRegister = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [minicourse, setMinicourse] = useState<Minicourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    institution: ''
  });

  // Buscar dados do minicurso
  useEffect(() => {
    const fetchMinicourse = async () => {
      if (!id) {
        toast.error('ID do minicurso não encontrado');
        navigate('/minicourses');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Buscando detalhes do minicurso:', id);
        
        const { data, error } = await supabase
          .from('minicourses')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .gt('vacancies_left', 0)
          .single();

        if (error) {
          console.error('Erro ao buscar minicurso:', error);
          throw error;
        }

        if (!data) {
          toast.error('Minicurso não encontrado ou indisponível');
          navigate('/minicourses');
          return;
        }

        console.log('Minicurso encontrado:', data);
        setMinicourse(data);
      } catch (error: any) {
        console.error('Erro ao carregar detalhes do minicurso:', error);
        toast.error('Erro ao carregar detalhes do minicurso');
        navigate('/minicourses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinicourse();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar formatações específicas
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!minicourse || !id) {
      toast.error('Erro ao identificar o minicurso');
      return;
    }

    // Validar formulário
    if (!formData.name.trim() || !formData.email.trim() || !formData.cpf.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor, informe um e-mail válido');
      return;
    }

    // Validar CPF (apenas verificação básica de formato)
    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      toast.error('Por favor, informe um CPF válido');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Processando inscrição...');

      // Verificar disponibilidade de vagas
      const { data: currentMinicourse, error: minicourseError } = await supabase
        .from('minicourses')
        .select('vacancies_left')
        .eq('id', id)
        .single();

      if (minicourseError) {
        throw minicourseError;
      }

      if (!currentMinicourse || currentMinicourse.vacancies_left <= 0) {
        toast.dismiss();
        toast.error('Não há mais vagas disponíveis para este minicurso');
        navigate('/minicourses');
        return;
      }

      // Criar a inscrição
      const { data, error } = await supabase
        .from('minicourse_registrations')
        .insert([{
          minicourse_id: id,
          name: formData.name,
          email: formData.email,
          cpf: cpfClean,
          phone: formData.phone.replace(/\D/g, ''),
          institution: formData.institution,
          is_paid: false,
          payment_url: 'https://know-horse.pay.yampi.com.br/r/IWTWBZ0IF0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar o número de vagas disponíveis
      const { error: updateError } = await supabase
        .from('minicourses')
        .update({ 
          vacancies_left: currentMinicourse.vacancies_left - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Erro ao atualizar vagas:', updateError);
        // Não lançar erro para não prejudicar a experiência do usuário
        // A vaga será corrigida pelo admin depois
      }

      toast.dismiss();
      toast.success('Inscrição realizada com sucesso! Redirecionando para o pagamento...');
      console.log('Registro criado:', data);
      
      // Redirecionar para o link de pagamento externo
      window.location.href = 'https://know-horse.pay.yampi.com.br/r/IWTWBZ0IF0';
      
      // Não é necessário limpar o formulário ou navegar internamente, pois estamos saindo do site

    } catch (error: any) {
      toast.dismiss();
      console.error('Erro ao processar inscrição:', error);
      toast.error(error.message || 'Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
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
              <p className="mt-4 text-lg">Carregando informações do minicurso...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!minicourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <p className="text-xl">Minicurso não encontrado ou indisponível.</p>
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
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/minicourses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Minicursos
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Detalhes do Minicurso */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Minicurso</CardTitle>
                  <CardDescription>Informações sobre o minicurso selecionado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg overflow-hidden border p-6 bg-white">
                    <div className="mb-6">
                      <div className="text-center mb-4">
                        <h1 className="text-3xl font-bold mb-2">
                          {minicourse.title || 'Minicurso'}
                        </h1>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          R$ {minicourse.price.toFixed(2)}
                        </Badge>
                        {minicourse.type && (
                          <Badge variant="secondary">
                            {minicourse.type}
                          </Badge>
                        )}
                        <Badge>
                          {minicourse.vacancies_left} vagas disponíveis
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span><strong>Data e Horário:</strong> {minicourse.date || 'A definir'} • {minicourse.time || 'A definir'}</span>
                        </div>
                        {minicourse.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span><strong>Local:</strong> {minicourse.location}</span>
                          </div>
                        )}
                        {minicourse.theme && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span><strong>Tema:</strong> {minicourse.theme}</span>
                          </div>
                        )}
                      </div>

                      {/* Instrutor */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-32 h-32 rounded-lg overflow-hidden border mb-3">
                          <img
                            src={minicourse.instructor_photo_url || '/placeholder-instructor.jpg'}
                            alt={minicourse.instructor || 'Instrutor'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-instructor.jpg';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">
                            {minicourse.instructor || 'Instrutor'}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">Importante:</p>
                        <p className="mt-1">
                          Caso o pagamento não seja identificado no prazo de duas horas, a inscrição poderá ser cancelada, tornando a vaga disponível para novos participantes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">Importante:</p>
                        <p className="mt-1">
                          Confira a data dos minicursos para que, em caso de inscrição em mais de um, não haja conflitos de horário. Não nos responsabilizamos por choques de agenda.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">Importante:</p>
                        <p className="mt-1">
                          Informamos que somente serão confirmadas como válidas as inscrições dos participantes que já realizaram sua inscrição no congresso.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Inscrição */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Formulário de Inscrição</CardTitle>
                  <CardDescription>Preencha seus dados para se inscrever no minicurso</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="required-field">Nome Completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Digite seu nome completo"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="required-field">E-mail</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Digite seu e-mail"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Usaremos este e-mail para enviar a confirmação da inscrição.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="cpf" className="required-field">CPF</Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="XXX.XXX.XXX-XX"
                          required
                          maxLength={14}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(XX) XXXXX-XXXX"
                          maxLength={15}
                        />
                      </div>

                      <div>
                        <Label htmlFor="institution">Instituição</Label>
                        <Input
                          id="institution"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="Digite sua instituição (opcional)"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processando...' : 'Confirmar Inscrição'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MinicourseRegister; 