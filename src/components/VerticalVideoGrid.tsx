
import React, { useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// Données simulées pour les vidéos - doublées pour un effet de boucle infinie plus fluide
const videoData = Array(12).fill({
  videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4",
  title: "Format vertical"
});

const VerticalVideoGrid = () => {
  const autoplayRef = useRef<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    inViewThreshold: 0.7
  });

  // Configuration pour un défilement fluide et continu
  const autoplay = useCallback(() => {
    if (!emblaApi) return;

    // Vitesse de défilement - valeur plus basse pour un défilement plus lent et fluide
    const scrollInterval = 50; // milliseconds between scrolls
    const scrollAmount = 0.5; // small increment for smooth scrolling
    
    const scroll = () => {
      if (emblaApi) {
        // Using scrollNext with a small increment for a smooth continuous scrolling effect
        emblaApi.scrollNext(true);
        
        // Schedule the next scroll
        autoplayRef.current = window.setTimeout(() => {
          requestAnimationFrame(scroll);
        }, scrollInterval);
      }
    };
    
    // Démarrer l'animation fluide
    autoplayRef.current = window.setTimeout(() => {
      requestAnimationFrame(scroll);
    }, scrollInterval);
    
    // Nettoyage
    return () => {
      if (autoplayRef.current !== null) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [emblaApi]);

  // Démarrer le défilement automatique
  useEffect(() => {
    if (!emblaApi) return;
    
    // Attendre que le carousel soit prêt
    emblaApi.on('init', autoplay);
    emblaApi.on('reInit', autoplay);
    
    // Lancer l'autoplay directement après le montage
    const cleanup = autoplay();
    
    return () => {
      cleanup && cleanup();
      if (autoplayRef.current !== null) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [emblaApi, autoplay]);

  return (
    <section className="py-6 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-center text-xl font-bold">
          <span className="text-gradient-static">Exemples de Formats Verticaux Livrés</span>
        </h2>
        
        <div className="relative max-w-full mx-auto overflow-hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {videoData.map((item, index) => (
                <div key={index} className="min-w-0 shrink-0 grow-0 pl-4 md:basis-1/3 lg:basis-1/4">
                  <div className="group overflow-hidden rounded-lg shadow-xl transition-all hover:shadow-2xl">
                    <div className="video-container mx-auto bg-black h-[250px] md:h-[280px]">
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={item.videoUrl} type="video/mp4" />
                        Votre navigateur ne prend pas en charge les vidéos HTML5.
                      </video>
                    </div>
                    <div className="bg-black p-2">
                      <h3 className="text-podcast-accent font-medium text-xs">Format Vertical #{(index % 6) + 1}</h3>
                      <p className="text-xs text-gray-400">Format optimisé pour les réseaux sociaux</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
