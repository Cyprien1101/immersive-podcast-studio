
import React from 'react';
import ServiceCard from './ServiceCard';
import { Mic, Video, Radio, Share2, Palette, BarChart } from 'lucide-react';

const services = [
  {
    title: "Enregistrement Audio",
    description: "Capturez un son de qualité professionnelle avec notre équipement haut de gamme et nos ingénieurs expérimentés.",
    icon: Mic
  },
  {
    title: "Production Vidéo",
    description: "Transformez votre podcast en contenu vidéo engageant avec notre équipe de production vidéo dédiée.",
    icon: Video
  },
  {
    title: "Post-production",
    description: "Montage, mixage et mastering par des professionnels pour un résultat final impeccable.",
    icon: Radio
  },
  {
    title: "Distribution",
    description: "Diffusez votre podcast sur toutes les plateformes majeures avec notre service de distribution intégré.",
    icon: Share2
  },
  {
    title: "Branding",
    description: "Créez une identité visuelle forte pour votre podcast avec notre équipe de designers créatifs.",
    icon: Palette
  },
  {
    title: "Analyses & Insights",
    description: "Suivez les performances de votre podcast et obtenez des insights précieux sur votre audience.",
    icon: BarChart
  }
];

const ServiceSection = () => {
  return (
    <section className="py-20 bg-podcast-dark">
      <div className="container px-4 mx-auto">
        <h2 className="mb-4 text-center text-4xl font-bold">
          <span className="text-gradient">Nos Services</span>
        </h2>
        
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
          Une gamme complète de services pour transformer votre vision en un podcast professionnel de haute qualité
        </p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                Icon={service.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
