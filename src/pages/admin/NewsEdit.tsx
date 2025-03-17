import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { News } from '@/types';

const AdminNewsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    video_url: '',
    is_published: false
  });
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [currentMedia, setCurrentMedia] = useState<'image' | 'video' | 'none'>('none');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (!id) return;

        console.log('Buscando notícia:', id);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao buscar notícia:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Notícia não encontrada');
        }

        console.log('Notícia encontrada:', data);
        setFormData({
          title: data.title,
          summary: data.summary || '',
          content: data.content,
          image_url: data.image_url || '',
          video_url: data.video_url || '',
          is_published: data.is_published
        });

        // Determinar qual tipo de mídia está sendo usada
        if (data.image_url) {
          setCurrentMedia('image');
          setUploadType('image');
        } else if (data.video_url) {
          setCurrentMedia('video');
          setUploadType('video');
        }
      } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        toast.error('Erro ao carregar notícia');
        navigate('/admin/news');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchNews();
    }
  }, [id, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Se mudou de imagem para vídeo, limpar a URL da imagem
      let imageUrl = formData.image_url;
      let videoUrl = formData.video_url;
      
      if (currentMedia === 'video' && uploadType === 'video') {
        imageUrl = '';
      }
      
      // Se mudou de vídeo para imagem, limpar a URL do vídeo
      if (currentMedia === 'image' && uploadType === 'image') {
        videoUrl = '';
      }

      toast.loading('Salvando alterações...');
      console.log('Atualizando notícia:', {
        id,
        ...formData,
        image_url: imageUrl,
        video_url: videoUrl,
        published_at: formData.is_published ? new Date().toISOString() : null
      });

      const { error } = await supabase
        .from('news')
        .update({
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          image_url: imageUrl,
          video_url: videoUrl,
          is_published: formData.is_published,
          published_at: formData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast.dismiss();
        console.error('Erro detalhado ao atualizar notícia:', error);
        throw error;
      }

      toast.dismiss();
      console.log('Notícia atualizada com sucesso');
      toast.success('Notícia atualizada com sucesso!');
      navigate('/admin/news');
    } catch (error: any) {
      toast.dismiss();
      console.error('Erro ao atualizar notícia:', error);
      toast.error(error.message || 'Erro ao atualizar notícia');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando notícia...</p>
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
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/admin/news')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Notícias
            </Button>
            <h1 className="text-4xl font-bold mb-2">Editar Notícia</h1>
            <p className="text-xl text-muted-foreground">
              Atualize as informações da notícia
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detalhes da Notícia</CardTitle>
                <CardDescription>
                  Edite as informações da notícia
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Digite o título da notícia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumo</Label>
                  <Input
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Digite um breve resumo da notícia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Digite o conteúdo completo da notícia"
                    rows={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mídia</Label>
                  <Tabs defaultValue={uploadType} onValueChange={(value) => setUploadType(value as 'image' | 'video')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="image">Imagem</TabsTrigger>
                      <TabsTrigger value="video">Vídeo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="image" className="space-y-4 pt-4">
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
                          <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                            <img
                              src={formData.image_url}
                              alt="Imagem atual"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <p className="text-white text-sm font-medium">Imagem atual</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="video" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="video_url">URL do Vídeo</Label>
                        <Input
                          id="video_url"
                          name="video_url"
                          value={formData.video_url}
                          onChange={handleInputChange}
                          placeholder="https://exemplo.com/video.mp4"
                        />
                        <p className="text-sm text-muted-foreground">
                          Por favor, use uma URL externa de vídeo (ex: YouTube, Vimeo, etc.)
                        </p>
                        {formData.video_url && (
                          <div className="relative w-full overflow-hidden rounded-md mb-4">
                            <video 
                              src={formData.video_url} 
                              controls 
                              className="w-full"
                            >
                              Seu navegador não suporta a tag de vídeo.
                            </video>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is_published">Publicar imediatamente</Label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/news')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminNewsEdit; 