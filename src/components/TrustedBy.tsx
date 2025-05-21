
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const TrustedBy = () => {
  const [logos, setLogos] = useState<{url: string; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .storage
          .from('confiance')
          .list('', {
            sortBy: { column: 'name', order: 'asc' },
          });
        
        if (error) {
          throw error;
        }

        if (data) {
          // Filter out folders and get only files
          const fileLogos = data.filter(item => !item.name.endsWith('/'));
          
          // Map to get the URLs
          const logoData = fileLogos.map(file => ({
            url: `${supabase.storage.from('confiance').getPublicUrl(file.name).data.publicUrl}`,
            name: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for name
          }));

          setLogos(logoData);
        }
      } catch (err) {
        console.error('Error fetching logos:', err);
        setError('Failed to load logos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []);

  // Duplicate the logos to create a seamless infinite effect
  const duplicatedLogos = [...logos, ...logos];

  if (error) {
    // Return an empty div if there's an error - don't disrupt the page flow
    console.error(error);
    return <div className="h-16"></div>;
  }

  return (
    <section className="py-8 bg-black">
      <div className="container mx-auto px-4">
        <ScrollAnimationWrapper animation="fade-down">
          <h3 className="text-xl md:text-2xl text-center mb-6 text-gray-300">
            Ils nous ont fait confiance
          </h3>
        </ScrollAnimationWrapper>

        {isLoading ? (
          <div className="flex justify-around items-center py-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-24 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <ScrollAnimationWrapper animation="fade-up">
              <div className="logos-scroll-container overflow-hidden relative">
                <div className="flex logos-carousel animate-scroll">
                  {duplicatedLogos.map((logo, i) => (
                    <div key={`${logo.name}-${i}`} className="mx-8 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={logo.url} 
                        alt={`${logo.name} logo`} 
                        className="h-12 max-w-[120px] md:h-16 md:max-w-[160px] object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-300" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustedBy;
