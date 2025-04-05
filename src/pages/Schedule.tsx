import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Schedule } from '@/types';

// Enum para tamanhos de imagem
enum ImageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  FULL = 'full'
}

const imageSizeClasses = {
  [ImageSize.SMALL]: 'w-1/3',
  [ImageSize.MEDIUM]: 'w-2/3',
  [ImageSize.FULL]: 'w-full'
};

const ScheduleList = () => {
  const [scheduleItems, setScheduleItems] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        console.log('Buscando programação publicada...');
        const { data, error } = await supabase
          .from('schedule')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar programação:', error);
          throw error;
        }

        console.log('Itens de programação encontrados:', data?.length);
        setScheduleItems(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar programação:', error);
        toast.error('Erro ao carregar programação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const filteredSchedule = scheduleItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Carregando programação...</p>
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
            <h1 className="text-4xl font-bold mb-4">Programação do Evento</h1>
            <p className="text-xl text-muted-foreground md:w-3/4 lg:w-1/2 mx-auto">
              Confira a programação completa do Congresso Equestre 2025.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar na programação..."
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

          {filteredSchedule.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? 'Nenhum item encontrado na programação' : 'Nenhum item publicado ainda'}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {filteredSchedule.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className={`relative mx-auto w-full`}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', item.image_url);
                          e.currentTarget.src = 'https://placehold.co/600x400/png?text=Imagem+não+disponível';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{item.title ? item.title : ''}</CardTitle>
                    {item.description && (
                      <CardDescription>{item.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {item.description ? <p>{item.description}</p> : null}
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

export default ScheduleList; 