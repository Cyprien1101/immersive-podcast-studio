
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

// Apply a global style to override button font-weight
const Index = () => {
  return (
    <div className="min-h-screen bg-podcast-dark relative">
      <style jsx global>{`
        .button-weight-normal {
          font-weight: normal !important;
        }
        a.font-normal, button.font-normal {
          font-weight: normal !important;
        }
      `}</style>
      <Header />
      <div className="content-wrapper">
        <HeroSection />
        <TrustedBy />
        <ImpactSection />
        <StudioCarousel />
        <VerticalVideoGrid />
        <ServiceSection />
        <FaqSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
