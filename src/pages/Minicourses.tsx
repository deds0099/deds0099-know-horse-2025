import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, CalendarClock, Users, MapPin, User, Tag } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Minicourse } from '@/types';
import { Link } from 'react-router-dom';

const MinicourseList = () => {
  const [minicourses, setMinicourses] = useState<Minicourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinicourses = async () => {
      try {
        console.log('Buscando minicursos publicados...');
        const { data, error } = await supabase
          .from('minicourses')
          .select('*')
          .eq('is_published', true)
          .gt('vacancies_left', 0)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar minicursos:', error);
          throw error;
        }

        console.log('Minicursos encontrados:', data?.length);
        setMinicourses(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar minicursos:', error);
        toast.error('Erro ao carregar minicursos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinicourses();
  }, []);

  const filteredMinicourses = minicourses.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterClick = (id: string) => {
    navigate(`/minicourses/register/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando minicursos...</p>
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
            <h1 className="text-4xl font-bold mb-4">Minicursos Disponíveis</h1>
            <p className="text-xl text-muted-foreground md:w-3/4 lg:w-1/2 mx-auto">
              Inscreva-se nos minicursos do Congresso Equestre 2025 e aprimore seus conhecimentos.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar minicursos..."
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

          {filteredMinicourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhum minicurso encontrado' : 'Nenhum minicurso disponível no momento'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMinicourses.map((item) => (
                <Card key={item.id} className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={item.image_url || '/placeholder-minicourse.jpg'}
                      alt={item.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-minicourse.jpg';
                      }}
                    />
                    <div className="absolute top-1 right-1">
                      <Badge variant="secondary" className="bg-white/90 text-black text-xs px-2 py-0.5">
                        {item.vacancies_left} vagas
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary/50 shrink-0">
                          <img
                            src={item.instructor_photo_url || '/placeholder-instructor.jpg'}
                            alt={item.instructor}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-instructor.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-base font-bold">{item.instructor}</p>
                          <p className="text-sm font-semibold text-muted-foreground">{item.theme}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.date || 'Data a definir'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.time || 'Horário a definir'}</span>
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                      )}
                      {item.type && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>{item.type}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 border-t flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {item.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      <Button asChild size="sm">
                        <Link to={`/minicourses/register/${item.id}`}>
                          Inscrever-se
                        </Link>
                      </Button>
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

export default MinicourseList; 