
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

// Sample data for studios
const studioData = [
  {
    id: 1,
    name: "Studio A",
    description: "Spacious environment ideal for podcasts with multiple guests, equipped with Neumann microphones and SSL preamps.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
  },
  {
    id: 2,
    name: "Studio B",
    description: "Intimate studio for one-on-one interviews, with premium acoustic treatment and adjustable lighting.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
  },
  {
    id: 3,
    name: "Studio C",
    description: "Configured for video podcasts with green screen, LED lighting, and 4K cameras for professional results.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
  },
  {
    id: 4,
    name: "Studio D",
    description: "Our largest space for live events, capable of hosting an audience and equipped for live streaming.",
    imageUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
  }
];

const StudioCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === studioData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? studioData.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <ScrollAnimationWrapper animation="fade-down">
          <h2 className="mb-12 text-center text-4xl font-bold">
            <span className="text-gradient">Our Studios</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="relative">
          {/* Navigation buttons */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border-podcast-accent bg-black/40 text-podcast-accent hover:bg-black/60 md:-left-16"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border-podcast-accent bg-black/40 text-podcast-accent hover:bg-black/60 md:-right-16"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          
          {/* Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {studioData.map((studio) => (
                <div key={studio.id} className="min-w-full px-4">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/2">
                      <ScrollAnimationWrapper animation="fade-right">
                        <div className="overflow-hidden rounded-lg shadow-2xl">
                          <img
                            src={studio.imageUrl}
                            alt={`Studio ${studio.name}`}
                            className="h-auto w-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      </ScrollAnimationWrapper>
                    </div>
                    
                    <div className="md:w-1/2">
                      <ScrollAnimationWrapper animation="fade-left" delay={200}>
                        <h3 className="mb-4 text-3xl font-bold text-podcast-accent">{studio.name}</h3>
                        <p className="mb-6 text-lg text-gray-300">{studio.description}</p>
                        <Button className="bg-podcast-accent hover:bg-podcast-accent-hover text-white">
                          Discover this studio
                        </Button>
                      </ScrollAnimationWrapper>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Slide indicators */}
          <ScrollAnimationWrapper animation="fade-up" delay={300}>
            <div className="mt-8 flex justify-center gap-2">
              {studioData.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-3 w-3 rounded-full transition-all",
                    activeSlide === index 
                      ? "bg-podcast-accent w-8" 
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default StudioCarousel;
