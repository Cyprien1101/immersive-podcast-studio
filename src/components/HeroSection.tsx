
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial setup - hide elements
    if (titleRef.current) {
      titleRef.current.style.opacity = '0';
      titleRef.current.style.transform = 'translateY(30px)';
      titleRef.current.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
    }
    
    if (descRef.current) {
      descRef.current.style.opacity = '0';
      descRef.current.style.transform = 'translateY(30px)';
      descRef.current.style.transition = 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s';
    }
    
    if (buttonRef.current) {
      buttonRef.current.style.opacity = '0';
      buttonRef.current.style.transform = 'translateY(30px)';
      buttonRef.current.style.transition = 'opacity 1s ease-out 0.6s, transform 1s ease-out 0.6s';
    }
    
    // Animate elements after a short delay
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }
      
      if (descRef.current) {
        descRef.current.style.opacity = '1';
        descRef.current.style.transform = 'translateY(0)';
      }
      
      if (buttonRef.current) {
        buttonRef.current.style.opacity = '1';
        buttonRef.current.style.transform = 'translateY(0)';
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="relative min-h-screen w-full overflow-hidden pt-16">
        {/* Background video */}
        <video 
          className="absolute inset-0 min-h-full min-w-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source 
            src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//site-web-1.mp4" 
            type="video/mp4" 
          />
          Your browser does not support HTML5 videos.
        </video>
        
        {/* Dark overlay with upper part gradient for better integration with header */}
        <div className="absolute inset-0 hero-overlay"></div>
        
        {/* Centered content with animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 ref={titleRef} className="mb-6 max-w-3xl text-3xl font-bold leading-tight md:text-5xl lg:text-7xl">
            <span className="text-gradient-static">Studio Premium</span> pour vos 
            <span className="text-gradient-static"> podcasts</span>
          </h1>
          
          <p ref={descRef} className="mb-8 max-w-xl text-lg text-white md:text-xl">
            Espaces professionnels pour enregistrer, produire et diffuser vos contenus audio et vidéo
          </p>
          
          <div ref={buttonRef}>
            <Link to="/booking">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent/90 hover:to-pink-500/90 font-bold text-white rounded-full px-8"
              >
                Réserver
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
