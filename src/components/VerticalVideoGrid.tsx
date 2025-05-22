
import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

// Video data with new reels
const videoData = [
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-1.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-2.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-3.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-4.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-5.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-6.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-7.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//reel.mp4"
  }
];

const VerticalVideoGrid = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: true,
  });
  
  // Auto-scrolling effect
  useEffect(() => {
    if (emblaApi) {
      const interval = setInterval(() => {
        emblaApi.scrollNext();
      }, 3000); // Scroll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [emblaApi]);

  return (
    <section className="py-10 bg-black w-full">
      <div className="container px-0 mx-auto max-w-[100%]">
        <ScrollAnimationWrapper animation="zoom-in" className="mb-8">
          <h2 className="text-center text-3xl font-bold">
            <span className="text-gradient-static">Nos shorts et reels</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <ScrollAnimationWrapper animation="fade-up" delay={300}>
          <div className="relative w-full">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {videoData.map((item, index) => (
                  <div key={index} className="min-w-0 shrink-0 grow-0 pl-4 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                    <div className="group overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-105">
                      <div className="video-container mx-auto bg-black h-[320px] md:h-[360px]">
                        <video
                          className="h-full w-full object-cover rounded-2xl"
                          autoPlay
                          muted
                          loop
                          playsInline
                        >
                          <source src={item.videoUrl} type="video/mp4" />
                          Your browser does not support HTML5 videos.
                        </video>
                      </div>
                      {/* Removed text below videos */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
