import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
const Landing = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Animation setup for elements
    const elements = [{
      ref: titleRef,
      delay: 0
    }, {
      ref: subtitleRef,
      delay: 300
    }, {
      ref: videoRef,
      delay: 600
    }, {
      ref: ctaRef,
      delay: 900
    }, {
      ref: calendlyRef,
      delay: 1200
    }];
    elements.forEach(({
      ref,
      delay
    }) => {
      if (ref.current) {
        ref.current.style.opacity = '0';
        ref.current.style.transform = 'translateY(30px)';
        ref.current.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
      }
    });

    // Animate elements with staggered delays
    elements.forEach(({
      ref,
      delay
    }) => {
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateY(0)';
        }
      }, delay + 100);
    });

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  const scrollToCalendly = () => {
    calendlyRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen bg-podcast-dark">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="px-4 py-[9px]">
          <div className="container mx-auto max-w-4xl text-center">
            {/* Headline */}
            <h1 ref={titleRef} className="mb-8 text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Crée le <span className="text-gradient-static">podcast</span> dont tout le monde parle à <span className="text-gradient-static">Lyon</span>
            </h1>

            {/* Subheadline */}
            <p ref={subtitleRef} className="mb-12 text-lg md:text-xl text-podcast-light max-w-3xl mx-auto leading-relaxed">On gère toute la production : tournage, montage, et surtout la diffusion quotidienne sur Instagram, TikTok, YouTube Shorts… avec tous les formats verticaux prêts à booster ta visibilité. 

Toi, tu viens parler au micro et tu repars avec un podcast clé en main.</p>

            {/* VSL Video Section */}
            <div ref={videoRef} className="mb-12">
              <div className="relative max-w-4xl mx-auto">
                <div className="mb-4">
                  <span className="inline-block bg-podcast-accent/20 text-podcast-accent px-4 py-2 rounded-full text-sm font-medium">
                    Vidéo de présentation temporaire
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video className="w-full h-auto max-h-[600px] object-cover" controls poster="">
                    <source src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//site-web-1.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas les vidéos HTML5.
                  </video>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div ref={ctaRef} className="mb-16">
              
            </div>
          </div>
        </section>

        {/* Calendly Section */}
        <section ref={calendlyRef} className="px-4 bg-podcast-soft-black py-[16px]">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Choisissez votre <span className="text-gradient-static">créneau</span>
              </h2>
              <p className="text-podcast-light text-lg">
                Planifiez votre rendez-vous pour discuter de votre projet podcast
              </p>
            </div>
            
            {/* Calendly Widget */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="calendly-inline-widget" data-url="https://calendly.com/cyprien-red" style={{
              minWidth: '320px',
              height: '700px'
            }}></div>
            </div>
          </div>
        </section>
      </main>
    </div>;
};
export default Landing;