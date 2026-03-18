import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Edit, Plus, Search, Trash2, Users, CalendarClock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Minicourse } from '@/types';

const AdminMinicourses = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [minicourses, setMinicourses] = useState<Minicourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch minicourses data
  const fetchMinicourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('minicourses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMinicourses(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar minicursos:', error);
      toast.error('Erro ao carregar minicursos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMinicourses();
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  const handleTogglePublish = async (minicourse: Minicourse) => {
    try {
      const newPublishState = !minicourse.is_published;
      const { error } = await supabase
        .from('minicourses')
        .update({
          is_published: newPublishState,
          published_at: newPublishState ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', minicourse.id);

      if (error) throw error;

      toast.success(`Minicurso ${newPublishState ? 'publicado' : 'despublicado'} com sucesso!`);
      fetchMinicourses(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao alterar status do minicurso:', error);
      toast.error(error.message || 'Erro ao alterar status do minicurso');
    }
  };

  const handleDelete = async (minicourse: Minicourse) => {
    if (!window.confirm('Tem certeza que deseja excluir este minicurso? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Check if there are any registrations for this minicourse
      const { data: registrations, error: checkError } = await supabase
        .from('minicourse_registrations')
        .select('id')
        .eq('minicourse_id', minicourse.id);

      if (checkError) throw checkError;

      if (registrations && registrations.length > 0) {
        return toast.error('Não é possível excluir este minicurso pois existem inscrições associadas a ele.');
      }

      const { error } = await supabase
        .from('minicourses')
        .delete()
        .eq('id', minicourse.id);

      if (error) throw error;

      toast.success('Minicurso excluído com sucesso!');
      fetchMinicourses(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao excluir minicurso:', error);
      toast.error(error.message || 'Erro ao excluir minicurso');
    }
  };

  const filteredMinicourses = minicourses.filter(item =>
    (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.theme || '').toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-4xl font-bold mb-2">Minicursos</h1>
              <p className="text-xl text-muted-foreground">
                Gerencie os minicursos do evento
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/minicourses/new')}
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Minicurso
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar minicursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando minicursos...</p>
            </div>
          ) : filteredMinicourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhum minicurso encontrado' : 'Nenhum minicurso cadastrado'}
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/admin/minicourses/new')}
              >
                <Plus className="mr-2 h-4 w-4" /> Criar Minicurso
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMinicourses.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-6 bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-center md:text-left mb-3">
                        <h2 className="text-2xl font-semibold">{item.title || 'Minicurso sem título'}</h2>
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground my-2 line-clamp-2">{item.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{item.date || 'Data a definir'} • {item.time || 'Horário a definir'}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Local: {item.location}</span>
                          </div>
                        )}
                        <div className="flex items-center text-primary font-medium">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{item.vacancies_left} / {item.vacancies} vagas disponíveis</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-end gap-2">
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
                          size="sm"
                          onClick={() => navigate(`/admin/minicourses/${item.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/admin/minicourses/registrations/${item.id}`)}
                        >
                          <Users className="h-4 w-4" />
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

export default AdminMinicourses; 