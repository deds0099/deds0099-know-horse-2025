import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { News } from '@/types';

const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log('Buscando notícias publicadas...');
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar notícias:', error);
          throw error;
        }

        console.log('Notícias encontradas:', data?.length);
        setNews(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar notícias:', error);
        toast.error('Erro ao carregar notícias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando notícias...</p>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Notícias e Atualizações</h1>
            <p className="text-xl text-muted-foreground md:w-3/4 lg:w-1/2 mx-auto">
              Fique por dentro das últimas novidades e atualizações sobre o Congresso Equestre 2025.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="shrink-0"
              >
                Limpar
              </Button>
            </div>
          </div>

          {filteredNews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia publicada ainda'}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {filteredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="relative h-48 w-full">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {item.video_url && (
                    <div className="relative w-full aspect-video">
                      <video 
                        src={item.video_url} 
                        controls 
                        className="w-full h-full object-cover"
                        poster={item.image_url || undefined}
                      >
                        Seu navegador não suporta a tag de vídeo.
                      </video>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    {item.summary && (
                      <CardDescription>{item.summary}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{item.content}</p>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Publicado em: {new Date(item.published_at!).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsList;
