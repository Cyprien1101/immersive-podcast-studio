import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const {
    user,
    loading
  } = useAuth();
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
  const openAuthModal = () => {
    setAuthModalOpen(true);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  return <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/20' : 'bg-transparent'}`}>
        

        {/* Mobile Navigation */}
        {mobileMenuOpen && <div className="md:hidden bg-black/40 backdrop-blur-md">
            <nav className="flex flex-col items-center py-4 space-y-4">
              <Link to="/contact" className="text-white hover:text-podcast-accent transition-colors w-full text-center py-2 font-bold" onClick={() => setMobileMenuOpen(false)}>
                Nous contacter
              </Link>
              
              <Link to="/booking" className="w-full px-4" onClick={() => setMobileMenuOpen(false)}>
                <Button className="bg-gradient-to-r from-podcast-accent to-pink-500 hover:from-podcast-accent/90 hover:to-pink-500/90 font-bold text-white w-full rounded-full">
                  Réserver
                </Button>
              </Link>
              
              {!user && <Button variant="ghost" onClick={openAuthModal} className="text-white hover:text-podcast-accent hover:bg-black/30 w-full font-bold">
                  Se connecter
                </Button>}
            </nav>
          </div>}
      </header>

      {/* Modal d'authentification */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>;
};
export default Header;