
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
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for studios
const mockStudios = [
  {
    id: 1,
    name: 'Studio Eden',
    description: 'Our premier recording studio in downtown Los Angeles',
    location: 'Los Angeles, CA',
    imageUrl: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg'
  },
  {
    id: 2,
    name: 'Studio Harmony',
    description: 'A peaceful recording environment with state-of-the-art equipment',
    location: 'New York, NY',
    imageUrl: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg'
  },
  {
    id: 3,
    name: 'Studio Rhythm',
    description: 'Perfect for bands and musical collaborations',
    location: 'Austin, TX',
    imageUrl: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg'
  },
  {
    id: 4,
    name: 'Studio Beats',
    description: 'Urban studio designed for hip-hop and electronic music',
    location: 'Miami, FL',
    imageUrl: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg'
  },
];

const StudioCarousel = () => {
  const isMobile = useIsMobile();

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
            <Carousel 
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {mockStudios.map((studio) => (
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
                              className="max-w-full max-h-full object-contain"
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
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default StudioCarousel;
