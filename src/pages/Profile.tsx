
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BookingHeader from '@/components/booking/BookingHeader';
import { useAuth } from '@/context/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import UserBookings from '@/components/profile/UserBookings';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Set active tab based on URL fragment
  useEffect(() => {
    if (location.hash === '#bookings') {
      setActiveTab('bookings');
    }
  }, [location]);

  // If still loading or no user, show nothing
  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BookingHeader />
      
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-podcast-accent to-pink-500 p-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="h-24 w-24 border-4 border-white">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || ''}
                      alt={user.user_metadata?.full_name || 'Profil utilisateur'}
                    />
                    <AvatarFallback className="text-2xl bg-black text-podcast-accent">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-white">
                      {user.user_metadata?.full_name || 'Utilisateur'}
                    </h1>
                    <p className="text-white/80">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="p-6"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger 
                    value="profile"
                    className="data-[state=active]:bg-podcast-accent data-[state=active]:text-black"
                  >
                    Mon profil
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bookings"
                    className="data-[state=active]:bg-podcast-accent data-[state=active]:text-black"
                    onClick={() => navigate('/profile#bookings')}
                  >
                    Mes réservations
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="pt-6">
                  <ProfileInfo user={user} />
                </TabsContent>
                
                <TabsContent value="bookings" className="pt-6">
                  <UserBookings userId={user.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
