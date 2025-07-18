
import React from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for studios - Keep only Studio Eden
const mockStudios = [
  {
    id: 1,
    name: 'Studio Lyon',
    description: 'Notre studio d\'enregistrement professionnel au centre de Lyon',
    location: '280 Rue Vendôme, Lyon',
    imageUrl: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//IMG_0765-2.webp'
  }
];

const StudioCarousel = () => {
  const isMobile = useIsMobile();

  const handleWhatsAppRedirect = () => {
    window.open('https://wa.me/33766805041?text=Je%20souhaiterais%20r%C3%A9server%20une%20session%20pour%20le%20...', '_blank');
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto">
        <ScrollAnimationWrapper animation="fade-down">
          <h2 className="mb-12 text-center text-5xl md:text-6xl font-bold">
            <span className="text-gradient">Notre studio</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="relative w-full overflow-hidden">
          <ScrollAnimationWrapper animation="fade-up" delay={200}>
            <Carousel 
              opts={{
                align: "center",
              }}
              className="w-full flex justify-center"
            >
              <CarouselContent className="-ml-4 flex justify-center">
                {mockStudios.map((studio) => (
                  <CarouselItem key={studio.id} className="pl-4 md:basis-4/5 lg:basis-3/4">
                    <div className="relative rounded-xl overflow-hidden group">
                      {/* Image container with 16:9 aspect ratio */}
                      <div className="w-full aspect-video relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={studio.imageUrl}
                            alt={`Studio ${studio.name}`}
                            className="w-full h-full object-cover object-[50%_90%] transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
                        
                        {/* Content overlay - same position for both mobile and desktop */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                          <h3 className="mb-2 text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                            {studio.name}
                          </h3>
                          <p className="text-lg md:text-xl text-white/90 drop-shadow-md mb-6">
                            {studio.location}
                          </p>
                          
                          <div>
                            <Button 
                              className="bg-podcast-accent hover:bg-podcast-accent-hover text-white rounded-full px-6 py-6 flex items-center gap-2 text-lg transition-transform hover:scale-105 duration-300 font-normal"
                              onClick={handleWhatsAppRedirect}
                            >
                              <BookOpen className="h-5 w-5" />
                              Réserver via WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation arrows removed as there's only one studio */}
            </Carousel>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default StudioCarousel;
