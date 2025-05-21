
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BookOpen } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const StudioCarousel = () => {
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchStudios() {
      try {
        setLoading(true);
        
        // Récupérer les studios avec leurs images associées
        const { data: studiosData, error: studiosError } = await supabase
          .from('studios')
          .select('id, name, description, location');
          
        if (studiosError) throw studiosError;
        
        // Pour chaque studio, récupérer sa première image
        const studiosWithImages = await Promise.all(
          studiosData.map(async (studio) => {
            const { data: imageData, error: imageError } = await supabase
              .from('studio_images')
              .select('url')
              .eq('studio_id', studio.id)
              .order('order_index', { ascending: true })
              .limit(1);
              
            if (imageError) throw imageError;
            
            return {
              ...studio,
              imageUrl: imageData && imageData[0] ? imageData[0].url : 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg'
            };
          })
        );
        
        setStudios(studiosWithImages);
      } catch (error) {
        console.error('Erreur lors de la récupération des studios:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudios();
  }, []);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto">
        <ScrollAnimationWrapper animation="fade-down">
          <h2 className="mb-12 text-center text-5xl md:text-6xl font-bold">
            <span className="text-gradient">Our Studios</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="relative w-full overflow-hidden">
          <ScrollAnimationWrapper animation="fade-up" delay={200}>
            {loading ? (
              <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-podcast-accent"></div>
              </div>
            ) : studios.length === 0 ? (
              <div className="flex justify-center items-center h-[70vh] text-white text-xl">
                Aucun studio disponible pour le moment
              </div>
            ) : (
              <Carousel 
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {studios.map((studio) => (
                    <CarouselItem key={studio.id} className="pl-4 md:basis-4/5 lg:basis-3/4">
                      <div className="relative rounded-xl group">
                        {/* Conteneur flex pour le contenu */}
                        <div className={`flex flex-col ${isMobile ? 'h-auto' : 'h-[70vh]'}`}>
                          {/* Image centrée */}
                          <div className={`w-full ${isMobile ? 'h-[50vh]' : 'h-full'} overflow-hidden rounded-t-xl ${!isMobile && 'rounded-b-xl'}`}>
                            <div className="w-full h-full flex items-center justify-center bg-black">
                              <img
                                src={studio.imageUrl}
                                alt={`Studio ${studio.name}`}
                                className={`${isMobile ? 'w-full h-auto' : 'max-w-full max-h-full'} object-contain transition-transform duration-500 group-hover:scale-110`}
                                style={{ margin: 'auto' }}
                              />
                            </div>
                          </div>
                          
                          {/* Overlay semi-transparent pour une meilleure lisibilité du texte */}
                          {!isMobile && <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl"></div>}
                          
                          {/* Informations sur le studio - en bas à gauche sur desktop, centrées en haut sur mobile */}
                          {isMobile ? (
                            <div className="px-4 py-6 bg-black rounded-b-xl">
                              <h3 className="mb-2 text-3xl font-bold tracking-tight text-white text-center">
                                {studio.name}
                              </h3>
                              <p className="text-lg text-white/90 text-center mb-6">
                                {studio.location}
                              </p>
                              
                              {/* Bouton "Book Now" centré en bas sur mobile */}
                              <div className="flex justify-center">
                                <Link to="/booking">
                                  <Button 
                                    className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent-hover hover:to-pink-600 text-white rounded-full px-6 py-6 flex items-center gap-2 text-lg transition-transform hover:scale-105 duration-300"
                                  >
                                    <BookOpen className="h-5 w-5" />
                                    Book Now
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Version desktop - texte en bas à gauche */}
                              <div className="absolute bottom-10 left-10 max-w-md text-white">
                                <h3 className="mb-2 text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                                  {studio.name}
                                </h3>
                                <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                                  {studio.location}
                                </p>
                              </div>
                              
                              {/* Bouton "Book Now" - en bas à droite sur desktop */}
                              <div className="absolute bottom-10 right-10">
                                <Link to="/booking">
                                  <Button 
                                    className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent-hover hover:to-pink-600 text-white rounded-full px-6 py-6 flex items-center gap-2 text-lg transition-transform hover:scale-105 duration-300"
                                  >
                                    <BookOpen className="h-5 w-5" />
                                    Book Now
                                  </Button>
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <CarouselPrevious 
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-podcast-accent bg-black/40 text-podcast-accent hover:bg-black/60 hover:scale-110 transition-transform"
                  aria-label="Previous slide"
                />
                
                <CarouselNext 
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-podcast-accent bg-black/40 text-podcast-accent hover:bg-black/60 hover:scale-110 transition-transform"
                  aria-label="Next slide"
                />
              </Carousel>
            )}
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default StudioCarousel;
