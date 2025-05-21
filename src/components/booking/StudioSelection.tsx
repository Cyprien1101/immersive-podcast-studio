
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import { MapPin } from 'lucide-react';

interface StudioSelectionProps {
  studios: any[];
  studioImages: any[];
  onSelectStudio: (studio: any) => void;
}

const StudioSelection: React.FC<StudioSelectionProps> = ({ 
  studios, 
  studioImages, 
  onSelectStudio 
}) => {
  // Function to get the first image for a studio
  const getStudioImage = (studioId: string) => {
    const image = studioImages.find(img => img.studio_id === studioId);
    return image ? image.url : 'https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//2ljj5___T8TdQ___k8MKt___1.jpg';
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-8">
        Sélectionner un Studio
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {studios.map((studio) => (
          <ScrollAnimationWrapper animation="fade-up" key={studio.id}>
            <Card className="rounded-2xl overflow-hidden bg-black border-gray-800 text-white hover:shadow-lg hover:shadow-podcast-accent/20 transition-all">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={getStudioImage(studio.id)} 
                  alt={studio.name}
                  className="w-full h-full object-cover rounded-t-xl transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              
              <CardHeader className="pb-2">
                <h3 className="text-2xl font-bold tracking-tight text-podcast-accent">
                  {studio.name}
                </h3>
                <div className="flex items-center text-gray-300 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{studio.location}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 line-clamp-3 mb-6">
                  {studio.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-podcast-accent">
                    <span className="text-lg font-bold">{studio.price_per_hour}€</span>
                    <span className="text-sm text-gray-300">/heure</span>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent-hover hover:to-pink-600 text-white rounded-full px-6 py-2 flex items-center gap-2 transition-transform hover:scale-105 duration-300"
                    onClick={() => onSelectStudio(studio)}
                  >
                    Choisir ce studio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimationWrapper>
        ))}
      </div>
    </div>
  );
};

export default StudioSelection;
