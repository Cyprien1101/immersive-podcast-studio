
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';

const BookingHeader = () => {
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
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
          
          {/* User menu or Sign in button */}
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse"></div>
          ) : user ? (
            <UserMenu />
          ) : (
            <Button 
              onClick={() => setAuthModalOpen(true)}
              className="bg-black text-white border border-white rounded-full px-6 py-2 transition-transform hover:scale-105 hover:bg-gray-800 duration-300"
            >
              Connexion
            </Button>
          )}
        </div>
      </div>

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default BookingHeader;
