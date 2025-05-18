
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
import { supabase } from "@/integrations/supabase/client";

// Enhanced studio data with proper names and addresses
const studioData = [
  {
    id: 1,
    name: "Studio Eden",
    description: "Spacious environment ideal for podcasts with multiple guests, equipped with Neumann microphones and SSL preamps.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg",
    address: "12 Rue du Son, Paris 10e"
  },
  {
    id: 2,
    name: "Studio Alpha",
    description: "Intimate studio for one-on-one interviews, with premium acoustic treatment and adjustable lighting.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg",
    address: "34 Avenue des Fréquences, Lyon"
  },
  {
    id: 3,
    name: "Studio Nova",
    description: "Configured for video podcasts with green screen, LED lighting, and 4K cameras for professional results.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg",
    address: "8 Boulevard du Mix, Marseille"
  },
  {
    id: 4,
    name: "Studio Céleste",
    description: "Our largest space for live events, capable of hosting an audience and equipped for live streaming.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg",
    address: "21 Rue des Voix, Bordeaux"
  }
];

const StudioCarousel = () => {
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
                {studioData.map((studio) => (
                  <CarouselItem key={studio.id} className="pl-4 md:basis-4/5 lg:basis-3/4">
                    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl group">
                      <div className="w-full h-full overflow-hidden">
                        <img
                          src={studio.imageUrl}
                          alt={`Studio ${studio.name}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
                        />
                      </div>
                      
                      {/* Semi-transparent overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      
                      {/* Studio info overlay - bottom left */}
                      <div className="absolute bottom-10 left-10 max-w-md text-white">
                        <h3 className="mb-2 text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                          {studio.name}
                        </h3>
                        <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                          {studio.address}
                        </p>
                      </div>
                      
                      {/* Book now button - bottom right */}
                      <div className="absolute bottom-10 right-10">
                        <Button 
                          className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent-hover hover:to-pink-600 text-white rounded-full px-6 py-6 flex items-center gap-2 text-lg transition-transform hover:scale-105 duration-300"
                        >
                          <BookOpen className="h-5 w-5" />
                          Book Now
                        </Button>
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
