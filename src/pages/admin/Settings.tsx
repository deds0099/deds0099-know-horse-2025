import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, ArrowLeft, Calendar, DollarSign, Tag, Trash2, Plus, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { fetchPriceLots, PriceLot } from '@/config/priceLots';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettings = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lots, setLots] = useState<PriceLot[]>([]);
    const [deletedLotIds, setDeletedLotIds] = useState<string[]>([]);
    const { logout, updatePassword } = useAuth();

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Fetch price lots
    const loadPriceLots = async () => {
        try {
            setIsLoading(true);
            const data = await fetchPriceLots();
            setLots(data);
            setDeletedLotIds([]); // Reset deletions on reload
        } catch (error: any) {
            console.error('Erro ao carregar lotes:', error);
            toast.error('Erro ao carregar configurações de preços');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadPriceLots();
        }
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !user) {
            toast.error('Você precisa estar logado para acessar esta página');
            navigate('/login');
        }
    }, [user, isAuthLoading, navigate]);

    const handleInputChange = (index: number, field: keyof PriceLot, value: any) => {
        const updatedLots = [...lots];
        updatedLots[index] = { ...updatedLots[index], [field]: value };
        setLots(updatedLots);
    };

    const handleAddLot = () => {
        const nextNumber = lots.length > 0 ? Math.max(...lots.map(l => l.number)) + 1 : 1;
        const newLot: PriceLot = {
            number: nextNumber,
            label: `${nextNumber}º LOTE`,
            price: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setLots([...lots, newLot]);
    };

    const handleRemoveLot = (index: number) => {
        const lotToRemove = lots[index];
        if (lotToRemove.id) {
            setDeletedLotIds([...deletedLotIds, lotToRemove.id]);
        }
        const updatedLots = lots.filter((_, i) => i !== index);
        setLots(updatedLots);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // 1. Handle Deletions
            if (deletedLotIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('price_lots')
                    .delete()
                    .in('id', deletedLotIds);

                if (deleteError) throw deleteError;
            }

            // 2. Handle Upserts (Inserts and Updates)
            for (const lot of lots) {
                const lotData = {
                    number: lot.number,
                    label: lot.label,
                    price: lot.price,
                    start_date: lot.startDate,
                    end_date: lot.endDate,
                    updated_at: new Date().toISOString()
                };

                if (lot.id) {
                    // Update existing
                    const { error } = await supabase
                        .from('price_lots')
                        .update(lotData)
                        .eq('id', lot.id);
                    if (error) throw error;
                } else {
                    // Insert new
                    const { error } = await supabase
                        .from('price_lots')
                        .insert([lotData]);
                    if (error) throw error;
                }
            }

            toast.success('Configurações de preços salvas com sucesso!');
            loadPriceLots(); // Refresh
        } catch (error: any) {
            console.error('Erro ao salvar preços:', error);
            toast.error(error.message || 'Erro ao salvar alterações');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await updatePassword(newPassword);
            toast.success('Senha atualizada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Erro ao atualizar senha:', error);
            toast.error(error.message || 'Erro ao atualizar senha');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isAuthLoading || !user) {
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                            </Button>
                            <h1 className="text-4xl font-bold">Configurações de Preços</h1>
                        </div>
                        <Button onClick={handleAddLot} className="bg-green-600 hover:bg-green-700">
                            <Tag className="h-4 w-4 mr-2" /> Adicionar Novo Lote
                        </Button>
                    </div>

                    <Tabs defaultValue="prices" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                            <TabsTrigger value="prices" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Preços
                            </TabsTrigger>
                            <TabsTrigger value="account" className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Minha Conta
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="prices" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <p className="text-xl text-muted-foreground mb-8 text-center md:text-left">
                                Gerencie os lotes de inscrição do congresso. Essas alterações refletem imediatamente no site e no checkout.
                            </p>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {lots.map((lot, index) => (
                                        <Card key={lot.id || index} className="overflow-hidden border-primary/20 relative group">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => handleRemoveLot(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remover</span>
                                            </Button>
                                            <CardHeader className="bg-primary/5">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Tag className="h-5 w-5 text-primary" />
                                                    Lote {lot.number}
                                                </CardTitle>
                                                <CardDescription>Configuração do período e valor </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`num-${index}`}>Número do Lote</Label>
                                                        <Input
                                                            id={`num-${index}`}
                                                            type="number"
                                                            value={lot.number}
                                                            onChange={(e) => handleInputChange(index, 'number', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`label-${index}`}>Nome exibido (Label)</Label>
                                                        <Input
                                                            id={`label-${index}`}
                                                            value={lot.label}
                                                            onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                                                            placeholder="Ex: 1º LOTE"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`price-${index}`}>Preço (R$)</Label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id={`price-${index}`}
                                                                type="number"
                                                                className="pl-9"
                                                                value={lot.price}
                                                                onChange={(e) => handleInputChange(index, 'price', parseFloat(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`start-${index}`}>Data de Início</Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id={`start-${index}`}
                                                                type="datetime-local"
                                                                className="pl-9"
                                                                value={new Date(lot.startDate).toISOString().slice(0, 16)}
                                                                onChange={(e) => handleInputChange(index, 'startDate', new Date(e.target.value).toISOString())}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`end-${index}`}>Data de Término</Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id={`end-${index}`}
                                                                type="datetime-local"
                                                                className="pl-9"
                                                                value={new Date(lot.endDate).toISOString().slice(0, 16)}
                                                                onChange={(e) => handleInputChange(index, 'endDate', new Date(e.target.value).toISOString())}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
                                        <Button
                                            variant="outline"
                                            onClick={handleAddLot}
                                            className="w-full md:w-auto border-dashed border-2 p-8 h-auto flex flex-col items-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                                        >
                                            <Plus className="h-8 w-8 opacity-20" />
                                            <span>Adicionar Outro Lote</span>
                                        </Button>

                                        <Button
                                            size="lg"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full md:w-auto px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-6 w-6 mr-2" />
                                                    Publicar Alterações
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="max-w-2xl mx-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-primary" />
                                            Segurança da Conta
                                        </CardTitle>
                                        <CardDescription>
                                            Mantenha sua conta admin segura alterando sua senha regularmente.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Email da Conta</Label>
                                            <Input value={user.email} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">O email não pode ser alterado por aqui.</p>
                                        </div>

                                        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">Nova Senha</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="new-password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Mínimo 6 caracteres"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                                <Input
                                                    id="confirm-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Digite novamente"
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-md font-semibold mt-4"
                                                disabled={isUpdatingPassword}
                                            >
                                                {isUpdatingPassword ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Atualizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-4 w-4 mr-2" />
                                                        Atualizar Senha
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                    <CardFooter className="bg-yellow-50 border-t border-yellow-100 flex flex-col items-start p-6">
                                        <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                            <Tag className="h-4 w-4 rotate-90" /> {/* Simulating a warning icon with Tag since I didn't import AlertTriangle */}
                                            <span>Importante</span>
                                        </div>
                                        <p className="text-sm text-yellow-700">
                                            Ao mudar sua senha, você continuará logado nesta sessão, mas precisará da nova senha para futuros logins em outros dispositivos.
                                        </p>
                                    </CardFooter>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminSettings;
