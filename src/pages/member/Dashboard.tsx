import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CustomCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, Clock, CreditCard, BookOpen, User as UserIcon, RefreshCw, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Subscription, MinicourseRegistration } from '@/types';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { openCheckout } from '@/lib/mercadopago';
import { fetchPriceLots, getActiveLotFromList } from '@/config/priceLots';

const PIX_PRICE = 200;
const CARD_PRICE = 220;

const MemberDashboard = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [pendingPaymentItem, setPendingPaymentItem] = useState<{ id: string; title: string; price: number } | null>(null);

    // 1. Query para Inscrição do Congresso
    const {
        data: subscription,
        isLoading: isSubLoading,
        refetch: refetchSub
    } = useQuery({
        queryKey: ['member-subscription', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .or(`user_id.eq.${user.id},email.eq.${user.email}`)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                ...data,
                createdAt: data.created_at,
                paidAt: data.paid_at
            } as Subscription;
        },
        enabled: !!user
    });

    // 2. Query para Minicursos
    const {
        data: minicourses = [],
        isLoading: isMiniLoading,
        refetch: refetchMini
    } = useQuery({
        queryKey: ['member-minicourses', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('minicourse_registrations')
                .select(`
                    *,
                    minicourse:minicourses(*)
                `)
                .or(`user_id.eq.${user.id},email.eq.${user.email}`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    // 3. Query para Lotes de Preço
    const {
        data: priceLots = [],
        isLoading: isLotsLoading
    } = useQuery({
        queryKey: ['price-lots'],
        queryFn: fetchPriceLots
    });

    const activeLot = getActiveLotFromList(priceLots);
    const price = activeLot ? 200 : 200; // Valor padrão se não houver lote

    // 4. Efeito para Realtime - Atualiza a UI instantaneamente quando o Admin muda o status
    useEffect(() => {
        if (!user) return;

        // Listener para subscriptions
        const subChannel = supabase
            .channel('member-sub-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    console.log('Realtime update: subscription changed for user', user.id);
                    queryClient.invalidateQueries({ queryKey: ['member-subscription', user.id] });
                }
            )
            .subscribe();

        // Listener para minicourses
        const miniChannel = supabase
            .channel('member-mini-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // UPDATE ou DELETE
                    schema: 'public',
                    table: 'minicourse_registrations',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    console.log('Realtime update: minicourses changed for user', user.id);
                    queryClient.invalidateQueries({ queryKey: ['member-minicourses', user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subChannel);
            supabase.removeChannel(miniChannel);
        };
    }, [user, queryClient]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Manipular retorno do pagamento
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            toast.success('Pagamento processado com sucesso! Sua inscrição será atualizada em instantes.', {
                duration: 6000
            });
            // Limpa o parâmetro da URL sem recarregar a página
            navigate('/member/dashboard', { replace: true });
        } else if (paymentStatus === 'failure') {
            toast.error('O pagamento não foi concluído. Por favor, tente novamente ou escolha outro método.');
            navigate('/member/dashboard', { replace: true });
        } else if (paymentStatus === 'pending') {
            toast.info('Seu pagamento está em processamento. Assim que for confirmado, sua inscrição será atualizada.');
            navigate('/member/dashboard', { replace: true });
        }
    }, [searchParams, navigate]);

    const openPaymentDialog = (item: { id: string; title: string; price: number; isPromo?: boolean }) => {
        setPendingPaymentItem(item);
        if (item.isPromo) {
            handlePayment('pix', item.price, item.title);
        } else {
            setPaymentDialogOpen(true);
        }
    };

    const handlePayment = async (paymentMethod: 'pix' | 'card', customAmount?: number, customTitle?: string) => {
        if (!pendingPaymentItem) return;
        setPaymentDialogOpen(false);
        
        let amount = customAmount || pendingPaymentItem.price;
        let title = customTitle || pendingPaymentItem.title;

        if (!customAmount && pendingPaymentItem.title.includes('Inscrição Regular')) {
            amount = paymentMethod === 'pix' ? PIX_PRICE : CARD_PRICE;
        }
        
        const toastId = toast.loading('Gerando link de pagamento...');
        try {
            const { data, error } = await supabase.functions.invoke('mercadopago-preference', {
                body: {
                    subscriptionId: pendingPaymentItem.id,
                    title,
                    amount,
                    paymentMethod,
                    email: user?.email, // Passando e-mail para pré-preencher no MP
                    name: user?.full_name || ''
                }
            });

            if (error) throw error;

            if (data?.preference_id) {
                openCheckout(data.preference_id);
            } else if (data?.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error('Link não gerado');
            }
        } catch (err: any) {
            console.error('Erro ao gerar pagamento:', err);
            const detail = err.context?.details?.message || err.message || '';
            toast.error(`Erro ao gerar pagamento: ${detail}`, { id: toastId });
        }
    };

    const handleManualRefresh = () => {
        refetchSub();
        refetchMini();
        toast.success('Dados atualizados!');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <Navbar />

            <main className="flex-1 pt-28 pb-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Minha Área</h1>
                            <p className="text-muted-foreground">
                                Bem-vindo de volta, {user?.email}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                                <RefreshCw size={16} className="mr-2" />
                                Atualizar
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/minicourses">Ver Minicursos</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status do Congresso */}
                        <CustomCard glassEffect className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Inscrição no Congresso</CardTitle>
                                    <CardDescription>Status atual da sua participação</CardDescription>
                                </div>
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <UserIcon size={24} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isSubLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-20 w-full" />
                                    </div>
                                ) : subscription ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/50 rounded-lg border border-slate-200 gap-4">
                                        <div className="flex items-center gap-4">
                                            {subscription.is_paid ? (
                                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                                    <Clock size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-lg">{subscription.name}</p>
                                                <p className="text-sm text-muted-foreground">{subscription.institution}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                            <Badge variant={subscription.is_paid ? "default" : "secondary"} className={subscription.is_paid ? "bg-green-600" : "bg-amber-500"}>
                                                {subscription.is_paid ? 'Pagamento Confirmado' : 'Aguardando Pagamento'}
                                            </Badge>
                                            {!subscription.is_paid && (
                                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5"
                                                        onClick={() => openPaymentDialog({
                                                            id: subscription.id,
                                                            title: `Inscrição Regular - Know Horse 2026`,
                                                            price: PIX_PRICE
                                                        })}
                                                    >
                                                        <CreditCard size={16} className="mr-2" />
                                                        Lote Regular
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                                                        onClick={() => openPaymentDialog({
                                                            id: subscription.id,
                                                            title: `Lote PROMOCIONAL - Know Horse 2026`,
                                                            price: 150,
                                                            isPromo: true
                                                        })}
                                                    >
                                                        <QrCode size={16} className="mr-2" />
                                                        Lote Promocional (R$ 150)
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                        <p className="text-muted-foreground mb-4">Você ainda não tem uma inscrição iniciada.</p>
                                        <Button asChild>
                                            <Link to="/register">Fazer Inscrição</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </CustomCard>

                        {/* Resumo Rápido */}
                        <Card className="bg-primary text-primary-foreground">
                            <CardHeader>
                                <CardTitle>Destaques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2">
                                    <span>Minicursos</span>
                                    <span className="font-bold text-xl">
                                        {isMiniLoading ? <Skeleton className="h-6 w-8 bg-primary-foreground/20" /> : minicourses.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2">
                                    <span>Lote Atual</span>
                                    <span className="font-bold">
                                        {isLotsLoading ? (
                                            <Skeleton className="h-6 w-16 bg-primary-foreground/20" />
                                        ) : (
                                            activeLot?.label || 'A definir'
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs text-primary-foreground/70 mt-4 italic">
                                    Prepare-se para o maior evento acadêmico equestre em Abril de 2026!
                                </p>
                            </CardContent>
                        </Card>

                        {/* Lista de Minicursos */}
                        <CustomCard glassEffect className="md:col-span-3">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="text-primary" size={24} />
                                    <div>
                                        <CardTitle>Meus Minicursos</CardTitle>
                                        <CardDescription>Cursos que você selecionou para participar</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isMiniLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-32 w-full" />
                                        ))}
                                    </div>
                                ) : minicourses.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {minicourses.map((reg) => (
                                            <div key={reg.id} className="p-4 bg-white/50 rounded-lg border border-slate-200">
                                                <h3 className="font-bold mb-1 line-clamp-1">{reg.minicourse?.title}</h3>
                                                <p className="text-xs text-muted-foreground mb-3">{reg.minicourse?.date} às {reg.minicourse?.time}</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <Badge variant={reg.is_paid ? "default" : "outline"} className={reg.is_paid ? "bg-green-600" : ""}>
                                                        {reg.is_paid ? 'Confirmado' : 'Pendente'}
                                                    </Badge>
                                                    {!reg.is_paid && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="ghost" className="text-primary h-8 p-0 px-2" asChild>
                                                                <Link to={`/minicourses/register/${reg.minicourse_id}`}>Ver detalhes</Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs border-green-600 text-green-600 hover:bg-green-50"
                                                                onClick={() => openPaymentDialog({
                                                                    id: reg.id,
                                                                    title: `Minicurso: ${reg.minicourse?.title}`,
                                                                    price: reg.minicourse?.price || 0
                                                                })}
                                                            >
                                                                <CreditCard size={12} className="mr-1" />
                                                                Pagar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                                        <p className="text-muted-foreground mb-4">Você ainda não se inscreveu em nenhum minicurso.</p>
                                        <Button asChild variant="outline">
                                            <Link to="/minicourses">Ver Opções Disponíveis</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </CustomCard>
                    </div>
                </div>
            </main>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Como deseja pagar?</DialogTitle>
                        <DialogDescription>
                            Escolha o método de pagamento para continuar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <button
                            onClick={() => handlePayment('pix')}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                        >
                            <QrCode size={32} className="text-green-600" />
                            <span className="font-bold text-green-700">Pix</span>
                            <span className="text-lg font-extrabold text-green-700">R$ {PIX_PRICE}</span>
                            <span className="text-xs text-muted-foreground">À vista</span>
                        </button>
                        <button
                            onClick={() => handlePayment('card')}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            <CreditCard size={32} className="text-blue-600" />
                            <span className="font-bold text-blue-700">Cartão</span>
                            <span className="text-lg font-extrabold text-blue-700">R$ {CARD_PRICE}</span>
                            <span className="text-xs text-muted-foreground">Até 12x</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default MemberDashboard;
