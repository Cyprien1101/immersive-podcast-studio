
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userId: string) => void;
  serviceName: string;
  serviceType: 'subscription' | 'hourPackage';
  serviceId: string;
}

const AuthDialog = ({ isOpen, onClose, onAuthSuccess, serviceName, serviceType, serviceId }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("connexion");
  const [loading, setLoading] = useState<boolean>(false);
  
  // État pour le formulaire de connexion
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  
  // État pour le formulaire d'inscription
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerFullName, setRegisterFullName] = useState<string>("");
  const [registerPhone, setRegisterPhone] = useState<string>("");
  
  // Gestionnaire de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      toast.success("Connexion réussie");
      
      if (data.user) {
        // Sauvegarder la sélection de service
        localStorage.setItem('selectedService', JSON.stringify({
          id: serviceId,
          name: serviceName,
          type: serviceType
        }));
        
        onAuthSuccess(data.user.id);
        onClose();
      }
      
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };
  
  // Gestionnaire d'inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!registerPhone.trim()) {
      toast.error("Le numéro de téléphone est obligatoire");
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerFullName,
            phone_number: registerPhone
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte.");
      
      if (data.user) {
        // Sauvegarder la sélection de service
        localStorage.setItem('selectedService', JSON.stringify({
          id: serviceId,
          name: serviceName,
          type: serviceType
        }));
        
        onAuthSuccess(data.user.id);
        onClose();
      }
      
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {activeTab === "connexion" ? "Connexion" : "Créer un compte"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connexion">Connexion</TabsTrigger>
              <TabsTrigger value="inscription">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connexion" className="mt-4">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Se connecter
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="inscription" className="mt-4">
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Nom complet</Label>
                    <Input 
                      id="register-fullname" 
                      type="text" 
                      value={registerFullName} 
                      onChange={(e) => setRegisterFullName(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">
                      Numéro de téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="register-phone" 
                      type="tel" 
                      value={registerPhone} 
                      onChange={(e) => setRegisterPhone(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    S'inscrire
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
