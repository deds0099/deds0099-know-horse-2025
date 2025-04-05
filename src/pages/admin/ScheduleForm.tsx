import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';

const ScheduleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_published: false
  });
  
  const isEditMode = !!id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch data if editing
  useEffect(() => {
    const fetchScheduleItem = async () => {
      if (!isEditMode || !user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('schedule')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            image_url: data.image_url || '',
            is_published: data.is_published || false
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar item da programação:', error);
        toast.error('Erro ao carregar item da programação');
        navigate('/admin/schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleItem();
  }, [id, isEditMode, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      toast.loading(isEditMode ? 'Atualizando item...' : 'Salvando item...');
      const now = new Date().toISOString();
      
      const scheduleData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        is_published: formData.is_published,
        updated_at: now,
        // Campos necessários para o create
        date: new Date().toISOString().split('T')[0], // Data padrão (hoje) em formato YYYY-MM-DD
        start_time: '00:00:00', // Horário padrão
        end_time: '23:59:59', // Horário padrão
        speaker: '',
        speaker_bio: '',
        location: ''
      };
      
      if (isEditMode) {
        // Atualizando item existente
        const { error } = await supabase
          .from('schedule')
          .update({
            ...scheduleData,
            published_at: formData.is_published ? now : null
          })
          .eq('id', id);

        if (error) throw error;

        toast.dismiss();
        toast.success('Item atualizado com sucesso!');
      } else {
        // Criando novo item
        const { data, error } = await supabase
          .from('schedule')
          .insert([{
            ...scheduleData,
            published_at: formData.is_published ? now : null,
            created_at: now
          }])
          .select();

        if (error) throw error;

        toast.dismiss();
        toast.success('Item criado com sucesso!');
      }
      
      navigate('/admin/schedule');
    } catch (error: any) {
      toast.dismiss();
      console.error('Erro ao salvar item da programação:', error);
      toast.error(error.message || 'Erro ao salvar item da programação');
    } finally {
      setIsSubmitting(false);
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
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/admin/schedule')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Programação
            </Button>
            <h1 className="text-4xl font-bold mb-2">
              {isEditMode ? 'Editar Item da Programação' : 'Adicionar Item à Programação'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {isEditMode ? 'Atualize as informações do item' : 'Adicione um novo item à programação do evento'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando dados...</p>
            </div>
          ) : (
            <Card className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>{isEditMode ? 'Editar Item' : 'Novo Item'}</CardTitle>
                  <CardDescription>
                    Preencha as informações para {isEditMode ? 'atualizar' : 'criar'} um item na programação
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Digite o título do item"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Digite a descrição completa do item"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Por favor, use uma URL externa de imagem (ex: Imgur, Cloudinary, etc.)
                    </p>
                    {formData.image_url && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Pré-visualização:</p>
                        <div className="border rounded-md overflow-hidden">
                          <img
                            src={formData.image_url}
                            alt="Pré-visualização"
                            className="w-full h-auto object-contain"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem:', formData.image_url);
                              e.currentTarget.src = 'https://placehold.co/300x150/png?text=Imagem+inválida';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="is_published">
                      {formData.is_published ? 'Publicado' : 'Rascunho'}
                    </Label>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/schedule')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Atualizar' : 'Criar'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleForm; 