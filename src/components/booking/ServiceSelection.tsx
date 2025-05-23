import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useBooking } from '@/context/BookingContext';

const ServiceSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setServiceInfo } = useBooking();
  
  const handleServiceSelect = (service) => {
    setServiceInfo(service);
    navigate('/booking-confirmation');
  };
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-8">
        Sélectionnez un Service
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-[#111112] border border-[#292930] rounded-xl p-6 hover:border-podcast-accent cursor-pointer transition-all"
          onClick={() => handleServiceSelect({ id: '1', name: 'Abonnement Mensuel', type: 'subscription' })}
        >
          <h3 className="text-xl font-medium text-podcast-accent mb-2">Abonnement Mensuel</h3>
          <p className="text-gray-300">Accès illimité au studio pendant un mois</p>
          <div className="mt-4">
            <Button className="bg-podcast-accent text-white">Sélectionner</Button>
          </div>
        </div>
        
        <div 
          className="bg-[#111112] border border-[#292930] rounded-xl p-6 hover:border-podcast-accent cursor-pointer transition-all"
          onClick={() => handleServiceSelect({ id: '2', name: 'Pack Horaire', type: 'hourPackage' })}
        >
          <h3 className="text-xl font-medium text-podcast-accent mb-2">Pack Horaire</h3>
          <p className="text-gray-300">Achetez des heures à utiliser quand vous voulez</p>
          <div className="mt-4">
            <Button className="bg-podcast-accent text-white">Sélectionner</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
