import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.animate-on-scroll');
    animatableElements.forEach((el) => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 animate-fade-in">
              Congresso Equestre 2025
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter animate-slide-in mb-4">
              Know Horse 2025
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-slide-in mb-8" style={{ animationDelay: '100ms' }}>
              Conectando profissionais, entusiastas e especialistas no mundo equestre através de conhecimento e networking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center animate-slide-in" style={{ animationDelay: '200ms' }}>
            </div>
            
            <div className="mt-10 max-w-4xl mx-auto">
              <img 
                src="https://uploaddeimagens.com.br/images/004/885/691/original/11.jpg?1742242673"
                alt="Cavalo em movimento"
                className="w-full h-auto rounded-lg shadow-lg mx-auto animate-fade-in"
                style={{ animationDelay: '300ms' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-subtle from-background to-accent/30 relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 p-4 bg-primary/10 rounded-lg w-full animate-pulse">
              <div className="space-y-2">
                <p className="text-xl font-bold text-primary">
                  04/03 - 10/04
                </p>
                <p className="text-2xl font-bold text-primary">
                  1º LOTE: R$ 200,00
                </p>
                <div className="h-px bg-primary/20 my-3"></div>
                <p className="text-xl font-bold text-primary">
                  11/04 - 20/04
                </p>
                <p className="text-2xl font-bold text-primary">
                  2º LOTE: R$ 250,00
                </p>
                <div className="h-px bg-primary/20 my-3"></div>
                <p className="text-xl font-bold text-primary">
                  21/04 - 08/05
                </p>
                <p className="text-2xl font-bold text-primary">
                  3º LOTE: R$ 300,00
                </p>
              </div>
            </div>
            <CustomButton asChild size="lg" className="animate-pulse">
              <Link to="/register">
                Inscreva-se Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </CustomButton>
            <div className="mt-4 text-center text-muted-foreground">
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <CustomButton asChild variant="outline" size="lg">
                  <a href="https://wa.me/message/XSIKMZI2ZAKME1" target="_blank" rel="noopener noreferrer">
                    Contato via WhatsApp
                  </a>
                </CustomButton>
              </div>
              <p className="text-sm mt-2">Em caso de problemas com a inscrição entre em contato pelo whatsapp</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent"></div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
