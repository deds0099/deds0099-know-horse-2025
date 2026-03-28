import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPriceLots } from '@/config/priceLots';


const Index = () => {
  const [priceLots, setPriceLots] = React.useState<any[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(true);

  // Load prices
  useEffect(() => {
    const loadPrices = async () => {
      const lots = await fetchPriceLots();
      setPriceLots(lots);
      setIsLoadingPrices(false);
    };
    loadPrices();
  }, []);

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
              Congresso Equestre 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter animate-slide-in mb-4">
              Know Horse 2026
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-slide-in mb-8" style={{ animationDelay: '100ms' }}>
              Conectando profissionais, entusiastas e especialistas no mundo equestre através de conhecimento e networking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center animate-slide-in" style={{ animationDelay: '200ms' }}>
            </div>

            <div className="mt-10 max-w-md mx-auto">
              <img
                src="https://i.ibb.co/bg2QTJMN/Logo-Know-Horse-2026-feed-1.png"
                alt="Banner Know Horse 2026"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {isLoadingPrices ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-100 border border-slate-200 h-56 rounded-3xl"></div>
                ))
              ) : (
                priceLots.map((lot) => (
                  <div key={lot.number} className="group relative bg-white rounded-3xl overflow-hidden shadow-soft border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full">
                    {/* Top Accent Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em]">
                          {lot.period}
                        </div>
                        <span className="text-slate-100 font-black text-5xl absolute -right-2 top-6 select-none group-hover:text-primary/5 transition-colors">
                          0{lot.number}
                        </span>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-primary transition-colors duration-300">{lot.label}</h3>
                        <div className="w-10 h-1 bg-primary/20 rounded-full mt-2 group-hover:w-20 transition-all duration-500"></div>
                      </div>

                      <div className="mt-auto space-y-1">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Valor</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-400">R$</span>
                          <span className="text-4xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                            {lot.price.toFixed(0)}
                          </span>
                          <span className="text-lg font-bold text-slate-500">
                            ,{lot.price.toFixed(2).split('.')[1]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Bottom Pattern */}
                    <div className="h-1.5 w-full bg-slate-50 flex gap-1 px-4 overflow-hidden">
                      {Array(10).fill(0).map((_, i) => (
                        <div key={i} className="h-full w-4 bg-slate-100/50 rounded-full uppercase"></div>
                      ))}
                    </div>
                  </div>
                ))
              )}
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
