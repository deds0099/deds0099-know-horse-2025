import React, { useState } from 'react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CustomCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types';
import { supabase } from '@/lib/supabase';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Função real para salvar a inscrição no Supabase
const submitSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'isPaid'>): Promise<Subscription> => {
  try {
    console.log('Tentando salvar inscrição:', subscription);
    
    // Não verificamos mais duplicidade, permitindo múltiplas inscrições
    
    // Verificar quais colunas estão disponíveis na tabela
    const { data: columns, error: columnsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
      
    if (columnsError) {
      console.error('Erro ao verificar estrutura da tabela:', columnsError);
    }
    
    // Construir objeto para inserção baseado nas colunas disponíveis
    const insertData: any = {
      name: subscription.name,
      email: subscription.email,
      phone: subscription.phone,
      cpf: subscription.cpf,
      status: 'pending',
      is_paid: false,
      created_at: new Date().toISOString()
    };
    
    // Verificar se alguma coluna existe antes de incluir no objeto
    if (columns && columns.length > 0) {
      const columnNames = Object.keys(columns[0]);
      if (columnNames.includes('institution')) {
        insertData.institution = subscription.institution;
      }
    } else {
      // Se não conseguimos verificar as colunas, tentamos com os campos que sabemos que existem
      insertData.institution = subscription.institution;
    }

    console.log('Dados para inserção:', insertData);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Erro do Supabase:', error);
      throw new Error(`Erro ao salvar inscrição: ${error.message} (Código: ${error.code})`);
    }

    console.log('Inscrição salva com sucesso:', data);
    
    return {
      ...subscription,
      status: 'pending',
      id: data.id,
      createdAt: data.created_at,
      isPaid: data.is_paid
    };
  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    institution: '',
    status: 'pending' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !formData.institution) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Iniciando submissão do formulário:', formData);
      
      // Submit data
      const result = await submitSubscription(formData);
      console.log('Inscrição criada com sucesso:', result);
      
      // Show success message
      toast.success('Inscrição realizada com sucesso!');
      setIsSuccess(true);
      
      // Redirecionar para a página de pagamento da Yampi
      setTimeout(() => {
        window.location.href = "https://know-horse.pay.yampi.com.br/r/SX0MH1RNJ5";
      }, 1500);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        institution: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Erro detalhado ao submeter inscrição:', error);
      
      // Mensagem de erro mais específica
      const errorMessage = error.message || 'Ocorreu um erro ao processar sua inscrição';
      toast.error(errorMessage);
      
      if (error.code === '42P01') {
        toast.error('Erro: Tabela de inscrições não encontrada. Por favor, contate o suporte.');
      } else if (error.code === 'PGRST301') {
        toast.error('Erro de conexão com o banco de dados. Tente novamente mais tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Inscrição para o Congresso</h1>
              <p className="text-xl text-muted-foreground">
                Preencha o formulário abaixo para garantir sua participação no maior evento equestre do Brasil.
              </p>
            </div>
            
            <div className="mb-8 p-6 bg-primary/10 rounded-lg text-center animate-pulse">
              <div className="space-y-2">
                <p className="text-xl font-bold text-primary">
                  04/03 - 04/04
                </p>
                <p className="text-2xl font-bold text-primary">
                  1º LOTE: R$ 200,00
                </p>
                <div className="h-px bg-primary/20 my-3"></div>
                <p className="text-xl font-bold text-primary">
                  05/04 - 20/04
                </p>
                <p className="text-2xl font-bold text-primary">
                  2º LOTE: R$ 250,00
                </p>
                <div className="h-px bg-primary/20 my-3"></div>
                <p className="text-xl font-bold text-primary">
                  21/04 - 08/05
                </p>
                <p className="text-2xl font-bold text-primary">
                  3º LOTE: R$ 300,00
                </p>
              </div>
            </div>
            
            {isSuccess ? (
              <div
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-8 w-8 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Inscrição Realizada!</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Sua inscrição foi recebida com sucesso. Você será redirecionado para a página de pagamento da Yampi em instantes...
                </p>
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Redirecionando...</p>
                </div>
              </div>
            ) : (
              <CustomCard glassEffect>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Formulário de Inscrição</CardTitle>
                    <CardDescription>
                      Preencha seus dados pessoais e informe sua instituição.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        className="glass-input"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu-email@exemplo.com"
                        className="glass-input"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Deve ser o mesmo e-mail utilizado na hora do pagamento.</strong>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        className="glass-input"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        className="glass-input"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="institution">Instituição</Label>
                      <Input
                        id="institution"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="Nome da sua instituição"
                        className="glass-input"
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processando...' : 'Finalizar Inscrição'}
                    </Button>
                  </CardFooter>
                </form>
              </CustomCard>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
