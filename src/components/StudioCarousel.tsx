
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
                    <div className="relative rounded-xl overflow-hidden group transition-transform duration-300 hover:scale-105">
                      {/* Image container with overlay */}
                      <div className={`w-full ${isMobile ? 'h-[50vh]' : 'h-[70vh]'} relative`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={studio.imageUrl}
                            alt={`Studio ${studio.name}`}
                            className="w-full h-full object-cover"
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
