
import React from 'react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const TrustedBy = () => {
  // Logos directs fournis par l'utilisateur
  const logos = [
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//gones.png', name: 'gones' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//lesfonda.png', name: 'lesfonda' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//microorange.png', name: 'microorange' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//moggo.png', name: 'moggo' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//naali.png', name: 'naali' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//noveo.png', name: 'noveo' },
    { url: 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/confiance//si.png', name: 'si' }
  ];

  // Dupliquer les logos pour créer un effet infini fluide
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-8 bg-black">
      <div className="container mx-auto px-4">
        <ScrollAnimationWrapper animation="fade-down">
          <h3 className="text-3xl md:text-4xl text-center mb-6 font-bold text-white">
            Ils nous ont fait <span className="text-gradient-hero">confiance</span>
          </h3>
        </ScrollAnimationWrapper>

        <div className="relative overflow-hidden">
          <ScrollAnimationWrapper animation="fade-up">
            <div className="logos-scroll-container overflow-hidden relative">
              <div className="flex logos-carousel-fast animate-scroll-fast">
                {duplicatedLogos.map((logo, i) => (
                  <div key={`${logo.name}-${i}`} className="mx-8 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={logo.url} 
                      alt={`${logo.name} logo`} 
                      className="h-12 max-w-[120px] md:h-16 md:max-w-[160px] object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-300" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>

        <ScrollAnimationWrapper animation="fade-up">
          <h3 className="text-2xl md:text-3xl text-center mt-8 font-bold text-white">
            Studio de podcast à Lyon : <span className="text-gradient-hero">Podroom</span>
          </h3>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default TrustedBy;
