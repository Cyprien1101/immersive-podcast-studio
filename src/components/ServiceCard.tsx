
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, Icon }) => {
  return (
    <div className="service-card rounded-xl p-6">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-podcast-accent/20">
        <Icon className="h-8 w-8 text-podcast-accent" />
      </div>
      
      <h3 className="mb-4 text-xl font-semibold text-podcast-accent">{title}</h3>
      
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default ServiceCard;
