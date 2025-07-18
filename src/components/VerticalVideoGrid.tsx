
import React from 'react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

// Video data with new reels
const videoData = [
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-1.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-3.mp4"
  },
  {
    videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//clips%20site%20web%20reels-5.mp4"
  }
];

const teaserUrl = "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//teaser.mp4";
const vslUrl = "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//Teaser%20formation%202.mp4";

const VerticalVideoGrid = () => {
  return (
    <section className="py-20 bg-black w-full">
      <div className="container px-4 mx-auto max-w-7xl">
        <ScrollAnimationWrapper animation="zoom-in" className="mb-12">
          <h2 className="text-center text-4xl md:text-5xl font-bold">
            <span className="text-gradient-hero">Nos montages</span>
          </h2>
        </ScrollAnimationWrapper>
        
        <ScrollAnimationWrapper animation="fade-up" delay={300}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left side - 3 reels in a row */}
            <div className="flex flex-col">
              <div className="text-center mb-2">
                <h3 className="text-white text-lg font-bold">Shorts</h3>
              </div>
              <div className="flex flex-row gap-2 sm:gap-4 justify-center">
                {videoData.map((item, index) => (
                  <div key={index} className="flex-1 max-w-[120px] sm:max-w-[200px]">
                    <div className="group overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-105">
                      <div className="video-container bg-black h-[200px] sm:h-[360px]">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Teaser videos stacked */}
            <div className="space-y-8">
              {/* First teaser */}
              <div>
                <h3 className="text-white text-lg font-bold text-center mb-2">Teaser</h3>
                <div className="group overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-105">
                  <video
                    className="w-full h-[200px] sm:h-[360px] object-cover rounded-2xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={teaserUrl} type="video/mp4" />
                    Your browser does not support HTML5 videos.
                  </video>
                </div>
              </div>

              {/* Second teaser - VSL */}
              <div>
                <h3 className="text-white text-lg font-bold text-center mb-2">VSL</h3>
                <div className="group overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:scale-105">
                  <video
                    className="w-full h-[200px] sm:h-[360px] object-cover rounded-2xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={vslUrl} type="video/mp4" />
                    Your browser does not support HTML5 videos.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
