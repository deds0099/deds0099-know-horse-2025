import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Download } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const Submission = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tighter animate-slide-in mb-6">
              Submissão de Trabalhos
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-slide-in mb-12" style={{ animationDelay: '100ms' }}>
              Compartilhe sua pesquisa e conhecimento no mundo equestre através da submissão de resumos expandidos para o Know Horse 2025.
            </p>

            <div className="max-w-2xl w-full mx-auto">
              <div className="bg-card p-8 rounded-lg shadow-lg border border-border animate-slide-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center">
                  <FileText className="mr-2 h-6 w-6" />
                  Instruções de Submissão
                </h2>
                
                <div className="space-y-6 text-left">
                  <p className="text-muted-foreground">
                    Para submeter seu trabalho, consulte as regras de submissão de resumos expandidos disponíveis abaixo.
                    Os resumos serão avaliados por nossa comissão científica.
                  </p>
                  
                  <div className="flex flex-col gap-4 items-center mt-8">
                    <CustomButton asChild size="lg" className="w-full">
                      <a 
                        href="https://drive.google.com/file/d/1JPoNQWtqJNKtKitMGFoCXUtUIJCZCumD/view?usp=sharing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Regras de Submissão de Resumos Expandidos
                      </a>
                    </CustomButton>
                    
                    <CustomButton asChild size="lg" className="w-full">
                      <a 
                        href="https://drive.google.com/drive/folders/1l5ior7E3d95q_ft1KS50ILEynM45Cl7P?usp=drive_link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Modelo para Submissão
                      </a>
                    </CustomButton>
                    
                    <p className="text-sm text-muted-foreground pt-2">
                      Leia atentamente as regras antes de preparar seu resumo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <CustomButton asChild variant="outline">
                <Link to="/">
                  <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  Voltar para página inicial
                </Link>
              </CustomButton>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Submission; 