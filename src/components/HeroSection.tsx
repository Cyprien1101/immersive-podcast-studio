
import React, { useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  
  const scrollToNextSection = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        {/* Vidéo de fond */}
        <video 
          className="absolute inset-0 min-h-full min-w-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source 
            src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//site-web-1.mp4" 
            type="video/mp4" 
          />
          Votre navigateur ne prend pas en charge les vidéos HTML5.
        </video>
        
        {/* Overlay sombre pour meilleure lisibilité */}
        <div className="absolute inset-0 hero-overlay"></div>
        
        {/* Contenu centré */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 max-w-3xl text-3xl font-bold leading-tight animate-fade-in md:text-5xl lg:text-7xl">
            <span className="text-gradient">Studio Premium</span> pour vos 
            <span className="text-podcast-accent"> podcasts</span>
          </h1>
          
          <p className="mb-8 max-w-xl text-lg text-gray-200 animate-fade-in md:text-xl">
            Des espaces professionnels pour enregistrer, produire et diffuser vos contenus audio et vidéo
          </p>
          
          <Button 
            size="lg" 
            className="animate-scale-in bg-podcast-accent hover:bg-podcast-accent-hover text-white"
          >
            Réserver maintenant
          </Button>
          
          <button 
            onClick={scrollToNextSection}
            className="absolute bottom-8 animate-float cursor-pointer rounded-full p-2 text-white hover:text-podcast-accent"
            aria-label="Défiler vers le bas"
          >
            <ArrowDown size={32} />
          </button>
        </div>
      </section>
      <div ref={nextSectionRef}></div>
    </>
  );
};

export default HeroSection;
