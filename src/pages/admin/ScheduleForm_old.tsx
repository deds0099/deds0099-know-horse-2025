import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { Schedule } from '@/types';

type FormData = {
  title: string;
  description: string;
  image_url: string;
  is_published: boolean;
};

const initialFormData: FormData = {
  title: '',
  description: '',
  image_url: '',
  is_published: false
};

const ScheduleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !!id;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const fetchScheduleItem = async () => {
      if (!isEditMode) return;

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
            title: data.title,
            description: data.description,
            image_url: data.image_url || '',
            is_published: data.is_published
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

    if (user) {
      fetchScheduleItem();
    }
  }, [id, isEditMode, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      const now = new Date().toISOString();
      
      if (isEditMode) {
        // Atualizar item existente
        console.log('Atualizando item existente:', formData);
        
        const dataToUpdate = {
          title: formData.title || '',
          description: formData.description || '',
          image_url: formData.image_url || null,
          is_published: formData.is_published,
          updated_at: now,
          published_at: formData.is_published ? now : null
        };
        
        console.log('Dados que serão enviados (update):', dataToUpdate);
        
        const { error } = await supabase
          .from('schedule')
          .update(dataToUpdate)
          .eq('id', id);

        if (error) {
          console.error('Erro detalhado ao atualizar:', error);
          throw error;
        }
        
        toast.success('Item atualizado com sucesso!');
      } else {
        // Criar novo item - adicionando valores padrão para campos removidos mas ainda necessários no banco
        const dataToInsert = {
          title: formData.title || '',
          description: formData.description || '',
          image_url: formData.image_url || null,
          is_published: formData.is_published,
          // Campos que ainda podem ser necessários no banco de dados
          date: new Date().toISOString().split('T')[0], // Data padrão (hoje) em formato YYYY-MM-DD
          start_time: '00:00:00', // Horário padrão
          end_time: '23:59:59', // Horário padrão
          speaker: '',
          speaker_bio: '',
          location: '',
          created_at: now,
          updated_at: now,
          published_at: formData.is_published ? now : null
        };
        
        console.log('Dados que serão enviados (insert):', dataToInsert);
        
        const { data, error } = await supabase
          .from('schedule')
          .insert(dataToInsert)
          .select();

        if (error) {
          console.error('Erro detalhado ao inserir:', error);
          throw error;
        }
        
        console.log('Resposta do servidor após insert:', data);
        
        toast.success('Item criado com sucesso!');
      }
      
      // Redirecionar para a lista
      navigate('/admin/schedule');
    } catch (error: any) {
      console.error('Erro ao salvar item da programação:', error);
      const errorMessage = error.message || 'Erro ao salvar item da programação';
      console.error('Mensagem de erro:', errorMessage);
      
      if (error.details) {
        console.error('Detalhes do erro:', error.details);
      }
      
      if (error.hint) {
        console.error('Dica para correção:', error.hint);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
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
              variant="outline"
              onClick={() => navigate('/admin/schedule')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <h1 className="text-4xl font-bold">
              {isEditMode ? 'Editar Item da Programação' : 'Novo Item da Programação'}
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              {isEditMode ? 'Atualize as informações do item da programação' : 'Adicione um novo item à programação'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando...</p>
            </div>
          ) : (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Item' : 'Novo Item'}</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para {isEditMode ? 'editar' : 'criar'} um item na programação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url">URL da Imagem</Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Opcional: Imagem relacionada ao item
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
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin/schedule')}
                      className="mr-2"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEditMode ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScheduleForm; 