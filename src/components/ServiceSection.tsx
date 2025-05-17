
import React from 'react';
import ServiceCard from './ServiceCard';
import { Mic, Video, Radio, Share2, Palette, BarChart } from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const services = [
  {
    title: "Audio Recording",
    description: "Capture professional-quality sound with our high-end equipment and experienced engineers.",
    icon: Mic
  },
  {
    title: "Video Production",
    description: "Transform your podcast into engaging video content with our dedicated video production team.",
    icon: Video
  },
  {
    title: "Post-production",
    description: "Editing, mixing, and mastering by professionals for an impeccable final result.",
    icon: Radio
  },
  {
    title: "Distribution",
    description: "Broadcast your podcast on all major platforms with our integrated distribution service.",
    icon: Share2
  },
  {
    title: "Branding",
    description: "Create a strong visual identity for your podcast with our team of creative designers.",
    icon: Palette
  },
  {
    title: "Analytics & Insights",
    description: "Track your podcast's performance and get valuable insights about your audience.",
    icon: BarChart
  }
];

const ServiceSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <ScrollAnimationWrapper animation="zoom-in">
          <h2 className="mb-4 text-center text-4xl font-bold">
            <span className="text-gradient">Our Services</span>
          </h2>
          
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
            A complete range of services to transform your vision into a high-quality professional podcast
          </p>
        </ScrollAnimationWrapper>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ScrollAnimationWrapper 
              key={index} 
              animation="fade-up" 
              delay={index * 150}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                Icon={service.icon}
              />
            </ScrollAnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
