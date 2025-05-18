
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BookingHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
      {/* Logo on the left */}
      <Link to="/">
        <div className="h-12 w-auto overflow-hidden rounded-lg border-2 border-white hover:scale-105 transition-transform duration-300">
          <img 
            src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//logo.png" 
            alt="Studio Logo" 
            className="h-full object-cover"
          />
        </div>
      </Link>
      
      {/* Navigation elements on the right */}
      <div className="flex items-center gap-3">
        {/* Home button with house icon */}
        <Link to="/">
          <Button 
            variant="outline" 
            size="icon"
            className="bg-transparent border-white text-white hover:bg-black/20 hover:text-white rounded-full"
          >
            <Home size={20} />
          </Button>
        </Link>
        
        {/* Sign in button */}
        <Button 
          className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent-hover hover:to-pink-600 text-white rounded-full px-6 py-2 transition-transform hover:scale-105 duration-300"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};

export default BookingHeader;
