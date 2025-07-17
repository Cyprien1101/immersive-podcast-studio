
import React from 'react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const VerticalVideoGrid = () => {
  const videos = [
    { src: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/videos/podroom-videos/vid1.mp4", title: "Video 1" },
    { src: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/videos/podroom-videos/vid2.mp4", title: "Video 2" },
    { src: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/videos/podroom-videos/vid3.mp4", title: "Video 3" }
  ];

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <ScrollAnimationWrapper animation="fade-up">
          <h2 className="text-xl md:text-2xl text-center mb-8 font-bold text-white">
            Studio de podcast à Lyon : <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-pink-500 bg-clip-text text-transparent animate-pulse-slow">Podroom</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {videos.map((video, index) => (
            <ScrollAnimationWrapper 
              key={index} 
              animation="fade-up" 
              delay={index * 100}
            >
              <div className="video-container bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <video
                  src={video.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
