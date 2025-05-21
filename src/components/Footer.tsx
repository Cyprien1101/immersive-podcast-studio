import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Linkedin, Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <footer className="bg-black py-12 text-gray-300">
      <div className="container px-4 mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-2xl font-bold text-podcast-accent">Podroom Studio</h3>
            <p className="mb-4 text-sm text-gray-400">
              Des espaces professionnels pour enregistrer, produire et diffuser vos contenus audio et vidéo.
            </p>
            <Link to="/contact">
              <Button variant="default" size="sm" className="hover:scale-105 transition-transform">
                Nous Contacter
              </Button>
            </Link>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-podcast-accent">Nos Studios</a></li>
              
              
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Contact</h4>
            <address className="not-italic">
              <p className="mb-2">280 Rue Vendôme Lyon</p>
              
              <p className="mb-2">cyprien@podroom.fr</p>
              <p>+33 7 66 80 50 41</p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
          <p className="mb-4 text-sm text-gray-500 md:mb-0">
            &copy; {new Date().getFullYear()} Premium Studio. Tous droits réservés.
          </p>
          
          <div className="flex items-center">
            <div className="mr-6 flex space-x-4">
              <a href="https://www.linkedin.com/in/cyprien-baudouin-ab7a34327/" className="text-gray-400 hover:text-podcast-accent" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/podroom_lyon/" className="text-gray-400 hover:text-podcast-accent" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            
            <Button variant="outline" size="icon" className="rounded-full border-podcast-accent text-podcast-accent hover:bg-podcast-accent hover:text-white" onClick={scrollToTop} aria-label="Retour en haut">
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;