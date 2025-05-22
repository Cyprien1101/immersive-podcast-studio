
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, BookText } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  // Obtenir les initiales de l'utilisateur pour l'avatar fallback
  const getInitials = () => {
    const fullName = user.user_metadata?.full_name || user.email || '';
    if (!fullName) return 'U';
    
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="border rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src={user.user_metadata?.avatar_url || ''}
              alt={user.user_metadata?.full_name || 'Avatar utilisateur'}
            />
            <AvatarFallback className="bg-podcast-accent text-black">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="bg-black border border-gray-800 text-white p-2 rounded-xl">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded-lg py-2">
          <User className="h-4 w-4 text-podcast-accent" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        
        <Link to="/booking-confirmation" className="block w-full">
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded-lg py-2">
            <BookText className="h-4 w-4 text-podcast-accent" />
            <span>Mes réservations</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-gray-700 my-2" />
        
        <DropdownMenuItem 
          onClick={signOut}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded-lg py-2"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
