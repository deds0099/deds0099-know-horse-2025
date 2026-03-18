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
import { Schedule } from '@/types';

const AdminSchedule = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleItems, setScheduleItems] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch schedule data
  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setScheduleItems(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar programação:', error);
      toast.error('Erro ao carregar programação');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  const handleTogglePublish = async (scheduleItem: Schedule) => {
    try {
      const newPublishState = !scheduleItem.is_published;
      const { error } = await supabase
        .from('schedule')
        .update({
          is_published: newPublishState,
          published_at: newPublishState ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleItem.id);

      if (error) throw error;

      toast.success(`Item ${newPublishState ? 'publicado' : 'despublicado'} com sucesso!`);
      fetchSchedule(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao alterar status do item:', error);
      toast.error(error.message || 'Erro ao alterar status do item');
    }
  };

  const handleDelete = async (scheduleItem: Schedule) => {
    if (!window.confirm('Tem certeza que deseja excluir este item da programação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', scheduleItem.id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      fetchSchedule(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      toast.error(error.message || 'Erro ao excluir item');
    }
  };

  const filteredSchedule = scheduleItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-4xl font-bold mb-2">Programação</h1>
              <p className="text-xl text-muted-foreground">
                Gerencie a programação do evento
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/schedule/new')}
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Item
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar na programação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando programação...</p>
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhum item encontrado na programação' : 'Nenhum item cadastrado na programação'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedule.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-6 bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold mb-2">{item.title ? item.title : ''}</h2>
                      {item.description && (
                        <p className="text-muted-foreground mb-4">{item.description}</p>
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
                          onClick={() => navigate(`/admin/schedule/edit/${item.id}`)}
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

export default AdminSchedule; 