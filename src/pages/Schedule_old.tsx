// BACKUP DO ARQUIVO ORIGINAL DE PROGRAMAÇÃO
// Este arquivo não está mais sendo usado no projeto

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

const SchedulePage = () => {
  const [scheduleItems, setScheduleItems] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        console.log('Buscando programação publicada...');
        const { data, error } = await supabase
          .from('schedule')
          .select('*')
          .eq('is_published', true);

        if (error) {
          console.error('Erro ao buscar programação:', error);
          console.error('Detalhes do erro:', error.details);
          
          if (error.hint) {
            console.error('Dica para correção:', error.hint);
          }
          
          if (error.code) {
            console.error('Código do erro:', error.code);
          }
          
          setError(`Erro: ${error.message}`);
          throw error;
        }

        console.log('Itens de programação encontrados:', data?.length);
        console.log('Dados recebidos:', data);
        
        // Definir os dados
        setScheduleItems(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar programação:', error);
        setError('Não foi possível carregar a programação. Tente novamente mais tarde.');
        toast.error('Erro ao carregar programação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Filtrar itens da programação com base na pesquisa
  const filteredSchedule = scheduleItems.filter(item => {
    if (!item) return false;
    
    const titleMatch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descriptionMatch = item.description ? item.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return titleMatch || descriptionMatch;
  });

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erro!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
              <Button
                variant="default" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
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
          
          <div className="max-w-4xl mx-auto mb-10">
            {/* Barra de pesquisa */}
            <div className="flex gap-4 mb-6">
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
                {searchTerm ? 'Nenhum item encontrado na programação' : 'Nenhum item de programação publicado ainda'}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {filteredSchedule.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-l-4 border-l-primary">
                    <div className="flex flex-col md:flex-row">
                      {item.image_url && (
                        <div className="w-full">
                          <img
                            src={item.image_url}
                            alt={item.title || 'Imagem da programação'}
                            className="w-full h-auto object-contain rounded-lg"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem:', item.image_url);
                              e.currentTarget.src = 'https://placehold.co/600x400/png?text=Imagem+não+disponível';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className={`flex-1 ${item.image_url ? 'md:w-3/4' : 'w-full'}`}>
                        <CardHeader>
                          <CardTitle>{item.title || 'Sem título'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose max-w-none">
                            <p>{item.description || 'Sem descrição'}</p>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SchedulePage; 