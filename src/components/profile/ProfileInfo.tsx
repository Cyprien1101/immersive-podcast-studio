
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo = ({ user }: ProfileInfoProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informations personnelles</CardTitle>
          <CardDescription className="text-gray-400">
            Vos informations de base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400">Nom complet</h3>
            <p className="text-white">{user.user_metadata?.full_name || 'Non renseigné'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-400">Email</h3>
            <p className="text-white">{user.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-400">Téléphone</h3>
            <p className="text-white">{user.user_metadata?.phone_number || 'Non renseigné'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Aide et assistance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Pour toute question concernant vos réservations, veuillez nous contacter au 07 66 80 50 41.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfo;
