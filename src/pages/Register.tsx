import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types';
import { supabase } from '@/lib/supabase';
import { fetchPriceLots, getActiveLotFromList, PriceLot } from '@/config/priceLots';
import { openCheckout } from '@/lib/mercadopago';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Função real para salvar a inscrição no Supabase
const saveRegistration = async (data: Omit<Subscription, 'id' | 'created_at' | 'is_paid'>) => {
  const { data: result, error } = await supabase
    .from('subscriptions')
    .insert([
      {
        ...data,
        is_paid: false
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return result;
};

const createPreference = async (subscriptionId: string, email: string, name: string, price: number, title: string, cpf: string, paymentMethod?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('mercadopago-preference', {
      body: {
        subscriptionId,
        email,
        name,
        amount: price,
        cpf,
        title: title || 'Inscrição Know Horse 2026',
        paymentMethod
      }
    });

    if (error) {
      console.error('Erro na Edge Function:', error);
      throw error;
    }
    return data;
  } catch (err: any) {
    console.error('Erro ao gerar link de pagamento:', err);
    throw err;
  }
};

const PriceTable = ({ lots, isLoading }: { lots: PriceLot[], isLoading: boolean }) => {
  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="animate-pulse bg-slate-100 border border-slate-200 h-28 rounded-2xl"></div>
      ))}
    </div>
  );
  if (lots.length === 0) return null;

  return (
    <div className="mb-12 animate-fade-in px-2">
      <h3 className="text-[10px] font-black text-slate-400 mb-8 text-center uppercase tracking-[0.3em]">Cronograma de Valores 2026</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lots.map((lot) => (
          <div key={lot.number} className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
                  {lot.period}
                </span>
                <span className="text-slate-100 font-bold text-2xl leading-none">0{lot.number}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">{lot.label}</h4>
              <div className="mt-auto pt-2 border-t border-dashed border-slate-100">
                <p className="text-2xl font-black text-primary tracking-tight">
                  <span className="text-xs mr-0.5">R$</span>
                  {lot.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [priceLots, setPriceLots] = useState<PriceLot[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    institution: '',
  });

  // Carregar lotes de preço
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const fetchedLots = await fetchPriceLots();
        setPriceLots(fetchedLots);
      } catch (err) {
        console.error('Erro ao carregar preços:', err);
      } finally {
        setIsLoadingPrices(false);
      }
    };
    loadPrices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Iniciando cadastro:', formData.email);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'member'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast.error('Este e-mail já está cadastrado. Tente fazer login.');
          setIsSubmitting(false);
          return;
        }
        throw authError;
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error('Não foi possível obter o ID do usuário após o cadastro.');

      // 2. Salvar na tabela de inscrições vinculado ao Auth
      const registration = await saveRegistration({
        user_id: userId,
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        institution: formData.institution,
      });

      console.log('Inscrição salva:', registration.id);

      // 3. Obter o preço
      const price = 5;
      const activeLot = getActiveLotFromList(priceLots);
      const title = activeLot ? `Inscrição ${activeLot.label} - Know Horse 2026` : 'Inscrição Regular - Know Horse 2026';

      // 4. Gerar preferência do Mercado Pago
      const preference = await createPreference(
        registration.id,
        formData.email,
        formData.name,
        price,
        title,
        formData.cpf,
        paymentMethod
      );

      toast.success('Inscrição realizada com sucesso! Redirecionando para o pagamento...');

      // 5. Redirecionar para o checkout do Mercado Pago
      if (preference && (preference.preference_id || preference.init_point)) {
        if (preference.preference_id) {
          openCheckout(preference.preference_id);
        } else {
          window.location.href = preference.init_point;
        }
      } else {
        throw new Error('Link de pagamento não gerado.');
      }

    } catch (error: any) {
      console.error('Erro completo no cadastro:', error);

      let errorMessage = 'Erro ao processar inscrição. Tente novamente.';

      if (error.context?.details?.message) {
        errorMessage = `Mercado Pago: ${error.context.details.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Inscrição Know Horse 2026</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para garantir sua vaga no congresso.</p>
          </div>

          <div className="animate-on-scroll">
            <PriceTable lots={priceLots} isLoading={isLoadingPrices} />

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
                  Sua inscrição foi recebida com sucesso. Você será redirecionado para a página de pagamento em instantes...
                </p>
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Redirecionando...</p>
                </div>
              </div>
            ) : (
              <Card>
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
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Este e-mail será usado para seu acesso à área do inscrito.</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Criar uma Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Você usará esta senha para acessar sua área do inscrito.
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
                        required
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                      <Label className="text-base font-bold">Forma de Pagamento</Label>
                      <RadioGroup
                        defaultValue="pix"
                        onValueChange={(v) => setPaymentMethod(v as 'pix' | 'card')}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                          <Label
                            htmlFor="pix"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all"
                          >
                            <div className="flex items-center justify-between w-full mb-3">
                              <span className="font-bold text-slate-700">PIX</span>
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-primary' : 'border-slate-300'}`}>
                                {paymentMethod === 'pix' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <div className="text-3xl font-black text-primary tracking-tight">R$ 5,00</div>
                            <div className="text-[10px] text-slate-500 mt-3 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">Liberação Instantânea</div>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="card" id="card" className="peer sr-only" />
                          <Label
                            htmlFor="card"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all"
                          >
                            <div className="flex items-center justify-between w-full mb-3">
                              <span className="font-bold text-slate-700">Cartão</span>
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-slate-300'}`}>
                                {paymentMethod === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <div className="text-3xl font-black text-primary tracking-tight">R$ 5,00</div>
                            <div className="text-[10px] text-slate-500 mt-3 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">Até 12x no Cartão</div>
                          </Label>
                        </div>
                      </RadioGroup>
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
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
