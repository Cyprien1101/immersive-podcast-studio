
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const VerticalVideoGrid = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <ScrollAnimationWrapper animation="fade-down">
          <h2 className="mb-12 text-center text-4xl md:text-5xl font-bold text-gradient-hero">
            Nos montages
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <ScrollAnimationWrapper animation="fade-up" delay={100}>
            <div className="video-container overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <AspectRatio ratio={9/16} className="w-full">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source 
                    src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//montage%201.mp4" 
                    type="video/mp4" 
                  />
                  Votre navigateur ne prend pas en charge les vidéos HTML5.
                </video>
              </AspectRatio>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="fade-up" delay={200}>
            <div className="video-container overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <AspectRatio ratio={9/16} className="w-full">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source 
                    src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//montage%202.mp4" 
                    type="video/mp4" 
                  />
                  Votre navigateur ne prend pas en charge les vidéos HTML5.
                </video>
              </AspectRatio>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="fade-up" delay={300}>
            <div className="video-container overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <AspectRatio ratio={9/16} className="w-full">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source 
                    src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//montage%203.mp4" 
                    type="video/mp4" 
                  />
                  Votre navigateur ne prend pas en charge les vidéos HTML5.
                </video>
              </AspectRatio>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="fade-up" delay={400}>
            <div className="video-container overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <AspectRatio ratio={9/16} className="w-full">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source 
                    src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//montage%204.mp4" 
                    type="video/mp4" 
                  />
                  Votre navigateur ne prend pas en charge les vidéos HTML5.
                </video>
              </AspectRatio>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
