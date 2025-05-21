
import React, { useState, useEffect, useRef } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const contentTypes = ["Podcasts", "Vidéos YouTube", "Shorts"];

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
        {/* 1. Animated Text - Modified layout with REDUCED FONT SIZE */}
        <ScrollAnimationWrapper animation="fade-down">
          <div className="mb-8 text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white flex flex-col items-center">
              <span className="mb-2">L'endroit idéal pour vos</span>
              <span className={cn(
                "text-gradient-static text-5xl md:text-6xl lg:text-7xl transition-opacity duration-600",
                isAnimating ? "opacity-0" : "opacity-100"
              )}>
                {contentTypes[activeIndex]}
              </span>
            </h2>
          </div>
        </ScrollAnimationWrapper>

        {/* 2. Three-column Grid with consistent media heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Video 16:9 - Updated with new video URL */}
          <ScrollAnimationWrapper animation="fade-right" delay={200}>
            <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <AspectRatio ratio={16/9} className="w-full">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source 
                        src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//videos%20et%20podcast-2.mp4" 
                        type="video/mp4" 
                      />
                      Votre navigateur ne prend pas en charge les vidéos HTML5.
                    </video>
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Format Vidéo</h3>
                  <p className="text-xs text-gray-400">Enregistrement studio professionnel</p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Center Column - Changed from Image to Video 16:9 */}
          <ScrollAnimationWrapper animation="fade-up" delay={400}>
            <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <AspectRatio ratio={16/9} className="w-full">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source 
                        src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//videos%20et%20podcast-1.mp4" 
                        type="video/mp4" 
                      />
                      Votre navigateur ne prend pas en charge les vidéos HTML5.
                    </video>
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Format Podcast</h3>
                  <p className="text-xs text-gray-400">Création audio professionnelle</p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Right Column - Video 16:9 */}
          <ScrollAnimationWrapper animation="fade-left" delay={600}>
            <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <AspectRatio ratio={16/9} className="w-full">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source 
                        src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//reels%20website%20.mp4" 
                        type="video/mp4" 
                      />
                      Votre navigateur ne prend pas en charge les vidéos HTML5.
                    </video>
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Format Réseaux Sociaux</h3>
                  <p className="text-xs text-gray-400">Optimisé pour les réseaux sociaux</p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
