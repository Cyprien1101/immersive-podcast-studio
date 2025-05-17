
import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// Sample data for videos
const videoData = Array(6).fill({
  videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4",
  title: "Vertical Format"
});

const VerticalVideoGrid = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
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
    <section className="py-6 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-center text-xl font-bold">
          <span className="text-gradient-static">Examples of Delivered Vertical Formats</span>
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {videoData.map((item, index) => (
                <div key={index} className="min-w-0 shrink-0 grow-0 pl-4 md:basis-1/3 lg:basis-1/4">
                  <div className="group overflow-hidden rounded-lg shadow-xl transition-all hover:shadow-2xl">
                    <div className="video-container mx-auto bg-black h-[250px] md:h-[280px]">
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={item.videoUrl} type="video/mp4" />
                        Your browser does not support HTML5 videos.
                      </video>
                    </div>
                    <div className="bg-podcast-dark p-2">
                      <h3 className="text-podcast-accent font-medium text-xs">Vertical Format #{index + 1}</h3>
                      <p className="text-xs text-gray-400">Format optimized for social media</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
