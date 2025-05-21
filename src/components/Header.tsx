
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/20' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="https://zqnejedmmwcumpqihupt.supabase.co/storage/v1/object/public/studio_images//logo.png" 
            alt="Logo" 
            className="h-8 md:h-10 rounded-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/contact" className="text-white hover:text-podcast-accent transition-colors font-bold">
            Nous contacter
          </Link>
          
          <Link to="/booking">
            <Button 
              className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent/90 hover:to-pink-500/90 font-bold text-white rounded-full px-6"
            >
              Réserver
            </Button>
          </Link>
          
          <Button variant="ghost" className="text-white hover:text-podcast-accent hover:bg-black/30 font-bold">
            Se connecter
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2" 
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/40 backdrop-blur-md">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <Link 
              to="/contact" 
              className="text-white hover:text-podcast-accent transition-colors w-full text-center py-2 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nous contacter
            </Link>
            
            <Link 
              to="/booking" 
              className="w-full px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button 
                className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent/90 hover:to-pink-500/90 font-bold text-white w-full rounded-full"
              >
                Réserver
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="text-white hover:text-podcast-accent hover:bg-black/30 w-full font-bold"
            >
              Se connecter
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
