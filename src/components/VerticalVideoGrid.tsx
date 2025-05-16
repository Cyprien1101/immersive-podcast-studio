
import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// Données simulées pour les vidéos
const videoData = Array(6).fill({
  videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4",
  title: "Format vertical"
});

const VerticalVideoGrid = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "center",
    dragFree: true,
    containScroll: false,
    slidesToScroll: 1
  });

  // Configuration pour un défilement automatique continu
  const autoScroll = useCallback((emblaApi) => {
    if (!emblaApi) return;
    
    let scrollDirection = 1;
    
    const animate = () => {
      if (!emblaApi.canScrollNext()) {
        scrollDirection = -1;
      } else if (!emblaApi.canScrollPrev()) {
        scrollDirection = 1;
      }
      
      emblaApi.scrollNext(true);
      timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, 3000);
    };
    
    let animationId = requestAnimationFrame(animate);
    let timeoutId = null;
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Auto-scrolling effect
  useEffect(() => {
    if (!emblaApi) return;
    
    const cleanup = autoScroll(emblaApi);
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [emblaApi, autoScroll]);

  return (
    <section className="py-6 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-center text-xl font-bold">
          <span className="text-gradient-static">Exemples de Formats Verticaux Livrés</span>
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
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
                      <h3 className="text-podcast-accent font-medium text-xs">Format Vertical #{index + 1}</h3>
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
