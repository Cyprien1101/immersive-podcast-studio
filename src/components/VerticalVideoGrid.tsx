
import React from 'react';

// Données simulées pour les vidéos
const videoData = Array(6).fill({
  videoUrl: "https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//03252-1-1.mp4",
  title: "Format vertical"
});

const VerticalVideoGrid = () => {
  return (
    <section className="py-20 bg-podcast-muted">
      <div className="container px-4 mx-auto">
        <h2 className="mb-12 text-center text-4xl font-bold">
          <span className="text-gradient">Exemples de Formats Verticaux Livrés</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {videoData.map((item, index) => (
            <div key={index} className="group overflow-hidden rounded-lg shadow-xl transition-all hover:shadow-2xl">
              <div className="video-container mx-auto bg-black">
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
              <div className="bg-podcast-dark p-4">
                <h3 className="text-podcast-accent font-medium">Format Vertical #{index + 1}</h3>
                <p className="text-sm text-gray-400">Format optimisé pour les réseaux sociaux</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoGrid;
