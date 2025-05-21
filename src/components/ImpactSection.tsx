
import React, { useState, useEffect, useRef } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

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
        {/* 1. Animated Text - Modified layout with REDUCED FONT SIZE */}
        <ScrollAnimationWrapper animation="fade-down">
          <div className="mb-8 text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white flex flex-col items-center">
              <span className="mb-2">The ideal place for your</span>
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
          {/* Left Column - Video 16:9 */}
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
                        src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//reels%20website%20.mp4" 
                        type="video/mp4" 
                      />
                      Your browser does not support HTML5 videos.
                    </video>
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Video Format</h3>
                  <p className="text-xs text-gray-400">Professional studio recording</p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Center Column - Image 16:9 - MIS À JOUR AVEC LA NOUVELLE IMAGE */}
          <ScrollAnimationWrapper animation="fade-up" delay={400}>
            <div className="overflow-hidden rounded-lg bg-black shadow-lg transform hover:scale-[1.02] transition-transform duration-300 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <AspectRatio ratio={16/9} className="w-full">
                    <img
                      src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//photo%20studio.jpg"
                      alt="Studio Podcast"
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Podcast Format</h3>
                  <p className="text-xs text-gray-400">Professional audio creation</p>
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
                      Your browser does not support HTML5 videos.
                    </video>
                  </AspectRatio>
                </div>
                <div className="p-3 bg-black">
                  <h3 className="text-podcast-accent font-medium text-sm">Social Media Format</h3>
                  <p className="text-xs text-gray-400">Optimized for social networks</p>
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
