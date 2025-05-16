
import React from 'react';
import HeroSection from '@/components/HeroSection';
import ImpactSection from '@/components/ImpactSection';
import StudioCarousel from '@/components/StudioCarousel';
import VerticalVideoGrid from '@/components/VerticalVideoGrid';
import ServiceSection from '@/components/ServiceSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-podcast-dark">
      <HeroSection />
      <ImpactSection />
      <StudioCarousel />
      <VerticalVideoGrid />
      <ServiceSection />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Index;
