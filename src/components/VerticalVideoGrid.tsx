
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

// Données simulées pour les vidéos
const videoData = Array(6).fill({
  videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4",
  title: "Format vertical"
});

const VerticalVideoGrid = () => {
  return (
    <section className="py-8 bg-podcast-muted">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-center text-2xl font-bold">
          <span className="text-gradient">Exemples de Formats Verticaux Livrés</span>
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {videoData.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <div className="group overflow-hidden rounded-lg shadow-xl transition-all hover:shadow-2xl">
                    <div className="video-container mx-auto bg-black h-[300px] md:h-[350px]">
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
                    <div className="bg-podcast-dark p-2">
                      <h3 className="text-podcast-accent font-medium text-sm">Format Vertical #{index + 1}</h3>
                      <p className="text-xs text-gray-400">Format optimisé pour les réseaux sociaux</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
          
          <div className="flex justify-center gap-4 mt-3 md:hidden">
            <Button variant="outline" size="icon" className="rounded-full bg-podcast-dark hover:bg-podcast-accent">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Précédent</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-podcast-dark hover:bg-podcast-accent">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Suivant</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
