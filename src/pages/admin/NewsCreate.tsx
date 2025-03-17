import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AdminNewsCreate = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    video_url: '',
    isPublished: false
  });
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublished: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading('Salvando notícia...');
      console.log('Tentando criar notícia:', {
        ...formData,
        published_at: formData.isPublished ? new Date().toISOString() : null
      });

      const { data, error } = await supabase
        .from('news')
        .insert([{
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          image_url: formData.image_url,
          video_url: formData.video_url,
          is_published: formData.isPublished,
          published_at: formData.isPublished ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        toast.dismiss();
        console.error('Erro detalhado ao criar notícia:', error);
        throw error;
      }

      toast.dismiss();
      console.log('Notícia criada com sucesso:', data);
      toast.success('Notícia criada com sucesso!');
      navigate('/admin/news');
    } catch (error: any) {
      toast.dismiss();
      console.error('Erro ao criar notícia:', error);
      toast.error(error.message || 'Erro ao criar notícia');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
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
              onClick={() => navigate('/admin/news')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Notícias
            </Button>
            <h1 className="text-4xl font-bold mb-2">Criar Nova Notícia</h1>
            <p className="text-xl text-muted-foreground">
              Adicione uma nova notícia ao site
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detalhes da Notícia</CardTitle>
                <CardDescription>
                  Preencha as informações para criar uma nova notícia
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
                  <Tabs defaultValue="image" onValueChange={(value) => setUploadType(value as 'image' | 'video')}>
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
                          <div className="relative aspect-video w-full overflow-hidden rounded-md">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
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
                          <div className="relative w-full aspect-video">
                            <video 
                              src={formData.video_url} 
                              controls 
                              className="w-full h-full object-cover"
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
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isPublished">Publicar imediatamente</Label>
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
                      <Save className="mr-2 h-4 w-4" /> Salvar Notícia
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

export default AdminNewsCreate;
