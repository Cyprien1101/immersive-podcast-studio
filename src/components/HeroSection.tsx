
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Animation state for changing words
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const words = ['Podcasts', 'Shorts', 'Vidéos', 'Publicités'];

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

  // Effect for word rotation with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsVisible(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [words.length]);

  const handleWhatsAppRedirect = () => {
    window.open('https://wa.me/33766805041?text=Je%20souhaiterais%20r%C3%A9server%20une%20session%20pour%20le%20...', '_blank');
  };

  return (
    <>
      <section className="relative min-h-screen w-full overflow-hidden pt-16">
        {/* Background video */}
        <video className="absolute inset-0 min-h-full min-w-full object-cover" autoPlay muted loop playsInline>
          <source src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//site-web-1.mp4" type="video/mp4" />
          Your browser does not support HTML5 videos.
        </video>
        
        {/* Dark overlay with slightly increased opacity on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 md:from-black/15 md:to-black/45"></div>
        
        {/* Centered content with animation - slightly lower on desktop */}
        <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-center md:pt-8 px-4 text-center">
          <h1 ref={titleRef} className="mb-6 max-w-4xl text-4xl sm:text-5xl font-bold leading-tight md:text-5xl lg:text-7xl text-white">
            <span className="block">L'endroit idéal pour vos</span>
            <span className="relative inline-block">
              <div className="absolute inset-x-0 -top-2 -bottom-2 bg-gradient-to-b from-transparent via-black/30 to-transparent blur-sm"></div>
              <span 
                className={`relative bg-gradient-to-r from-[#655dff] to-pink-400 bg-clip-text text-transparent transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                {words[currentWordIndex]}
              </span>
            </span>
          </h1>
          
          <p ref={descRef} className="mb-8 max-w-xl text-lg text-white md:text-xl">
            Espace professionnel clé en main pour enregistrer et produire vos contenus audio et vidéo
          </p>
          
          <div ref={buttonRef}>
            <Button 
              size="lg" 
              className="bg-podcast-accent hover:bg-podcast-accent-hover font-bold text-white rounded-full px-8"
              onClick={handleWhatsAppRedirect}
            >
              Réserver via WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
