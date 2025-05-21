
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TrustedBy from '@/components/TrustedBy';
import ImpactSection from '@/components/ImpactSection';
import StudioCarousel from '@/components/StudioCarousel';
import VerticalVideoGrid from '@/components/VerticalVideoGrid';
import ServiceSection from '@/components/ServiceSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-podcast-dark">
      <Header />
      <HeroSection />
      <TrustedBy />
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
