
import React from 'react';
import ServiceCard from './ServiceCard';
import { Mic, Video, Radio, Share2, Palette, BarChart } from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const services = [
  {
    title: "Enregistrement Audio",
    description: "Capturez un son de qualité professionnelle avec notre équipement haut de gamme et nos opérateurs sur place.",
    icon: Mic
  },
  {
    title: "Production Vidéo",
    description: "Tournage libre pour podcast, YouTube et autres formats avec changement de plans en direct et opérateur qualifié.",
    icon: Video
  },
  {
    title: "Post-production",
    description: "Montage et mixage professionnel disponible avec nos forfaits premium pour un résultat final impeccable.",
    icon: Radio
  },
  {
    title: "Distribution",
    description: "Diffusez votre podcast sur toutes les plateformes majeures avec nos conseils et outils adaptés.",
    icon: Share2
  },
  {
    title: "Identité Visuelle",
    description: "Créez une identité visuelle forte pour votre podcast avec notre équipe de designers créatifs.",
    icon: Palette
  },
  {
    title: "Analyses & Statistiques",
    description: "Suivez les performances de votre podcast et obtenez des informations précieuses sur votre audience.",
    icon: BarChart
  }
];

const ServiceSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <ScrollAnimationWrapper animation="zoom-in">
          <h2 className="mb-4 text-center text-4xl font-bold">
            <span className="text-gradient">Nos Services</span>
          </h2>
          
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
            Une gamme complète de services pour transformer votre vision en un podcast professionnel de haute qualité
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
