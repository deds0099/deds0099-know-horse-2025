import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { News } from '@/types';

const AdminNews = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch news data
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNews(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  const handleTogglePublish = async (newsItem: News) => {
    try {
      const newPublishState = !newsItem.is_published;
      const { error } = await supabase
        .from('news')
        .update({
          is_published: newPublishState,
          published_at: newPublishState ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsItem.id);

      if (error) throw error;

      toast.success(`Notícia ${newPublishState ? 'publicada' : 'despublicada'} com sucesso!`);
      fetchNews(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao alterar status da notícia:', error);
      toast.error(error.message || 'Erro ao alterar status da notícia');
    }
  };

  const handleDelete = async (newsItem: News) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsItem.id);

      if (error) throw error;

      toast.success('Notícia excluída com sucesso!');
      fetchNews(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao excluir notícia:', error);
      toast.error(error.message || 'Erro ao excluir notícia');
    }
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Notícias</h1>
              <p className="text-xl text-muted-foreground">
                Gerencie as notícias do site
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/news/new')}
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Notícia
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando notícias...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia cadastrada'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-6 bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                      {item.summary && (
                        <p className="text-muted-foreground mb-4">{item.summary}</p>
                      )}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {item.published_at && (
                          <p className="text-sm text-muted-foreground">
                            Publicado em: {new Date(item.published_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`publish-${item.id}`}
                          checked={item.is_published}
                          onCheckedChange={() => handleTogglePublish(item)}
                        />
                        <Label htmlFor={`publish-${item.id}`}>
                          {item.is_published ? 'Publicado' : 'Rascunho'}
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminNews;
