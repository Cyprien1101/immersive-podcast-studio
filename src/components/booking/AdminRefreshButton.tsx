
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminRefreshButton = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-availability', {
        method: 'POST',
      });

      if (error) {
        console.error('Error refreshing availability:', error);
        toast.error('Erreur lors du rafraîchissement des créneaux');
        return;
      }

      console.log('Refresh response:', data);
      
      if (data.success) {
        toast.success(`Créneaux rafraîchis avec succès. ${data.stats.deletedCount || 0} supprimés, ${data.stats.newSlotsCount || 0} créés.`);
      } else {
        toast.error(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Exception during refresh:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="absolute top-2 right-2 flex items-center gap-1 bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
      onClick={handleRefresh}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Rafraîchir disponibilités
    </Button>
  );
};

export default AdminRefreshButton;
