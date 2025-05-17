
import React, { useState, useEffect, useRef } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

const contentTypes = ["Podcasts", "Youtube Videos", "Shorts"];

const ImpactSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup the animation loop
    timerRef.current = setInterval(() => {
      setIsAnimating(true);
      
      // After fade-out animation completes, change the content
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % contentTypes.length);
        setIsAnimating(false);
      }, 600);
      
    }, 3000); // Change every 3 seconds

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <section className="bg-black py-12 px-4">
      <div className="container mx-auto">
        {/* 1. Animated Text - Modified layout */}
        <div className="mb-8 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white animate-fade-in flex flex-col items-center">
            <span className="mb-2">Le lieu idéal pour vos</span>
            <span className={cn(
              "text-gradient-static text-5xl md:text-6xl lg:text-7xl transition-opacity duration-600",
              isAnimating ? "opacity-0" : "opacity-100"
            )}>
              {contentTypes[activeIndex]}
            </span>
          </h2>
        </div>

        {/* 2. Three-column Grid with consistent media heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Horizontal Videos (Stacked) */}
          <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in h-full">
            <div className="h-full flex flex-col">
              <div className="flex-grow flex flex-col">
                {/* First Video */}
                <div className="flex-1">
                  <AspectRatio ratio={16/9} className="w-full">
                    <video
                      className="w-full h-full object-cover"
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
                  </AspectRatio>
                </div>
                
                {/* Second Video */}
                <div className="flex-1 border-t border-gray-800">
                  <AspectRatio ratio={16/9} className="w-full">
                    <video
                      className="w-full h-full object-cover"
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
                  </AspectRatio>
                </div>
              </div>
              <div className="p-3 bg-podcast-dark">
                <h3 className="text-podcast-accent font-medium text-sm">Format Vidéo</h3>
                <p className="text-xs text-gray-400">Enregistrement en studio professionnel</p>
              </div>
            </div>
          </div>

          {/* Center Column - Images (Stacked) */}
          <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in h-full" style={{animationDelay: '0.2s'}}>
            <div className="h-full flex flex-col">
              <div className="flex-grow flex flex-col">
                {/* First Image */}
                <div className="flex-1">
                  <AspectRatio ratio={16/9} className="w-full">
                    <img
                      src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
                      alt="Studio Podcast"
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
                
                {/* Second Image */}
                <div className="flex-1 border-t border-gray-800">
                  <AspectRatio ratio={16/9} className="w-full">
                    <img
                      src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg"
                      alt="Studio Podcast"
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              </div>
              <div className="p-3 bg-podcast-dark">
                <h3 className="text-podcast-accent font-medium text-sm">Format Podcast</h3>
                <p className="text-xs text-gray-400">Création audio professionnelle</p>
              </div>
            </div>
          </div>

          {/* Right Column - Vertical Video */}
          <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in h-full" style={{animationDelay: '0.4s'}}>
            <div className="h-full flex flex-col">
              <div className="flex-grow flex items-center justify-center bg-black">
                <div className="w-full max-w-[200px]">
                  <AspectRatio ratio={9/16} className="w-full">
                    <video
                      className="w-full h-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source 
                        src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4" 
                        type="video/mp4" 
                      />
                      Votre navigateur ne prend pas en charge les vidéos HTML5.
                    </video>
                  </AspectRatio>
                </div>
              </div>
              <div className="p-3 bg-podcast-dark">
                <h3 className="text-podcast-accent font-medium text-sm">Format Vertical</h3>
                <p className="text-xs text-gray-400">Optimisé pour les réseaux sociaux</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
