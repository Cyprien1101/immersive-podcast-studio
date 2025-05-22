
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarPlus, Clock, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { format, addHours, set } from 'date-fns';
import { toast } from 'sonner';
import { fr } from 'date-fns/locale';

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    summary: '',
    description: '',
    location: '',
    startTime: '09:00',
    endTime: '10:00',
    colorId: '1'
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsDialogOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleCreateEvent = async () => {
    if (!selectedDate) return;
    
    setIsCreatingEvent(true);
    
    try {
      // Format dates in RFC3339 format as required by Google Calendar API
      const startDate = set(selectedDate, {
        hours: parseInt(eventDetails.startTime.split(':')[0], 10),
        minutes: parseInt(eventDetails.startTime.split(':')[1], 10),
        seconds: 0,
        milliseconds: 0
      });
      
      const endDate = set(selectedDate, {
        hours: parseInt(eventDetails.endTime.split(':')[0], 10),
        minutes: parseInt(eventDetails.endTime.split(':')[1], 10),
        seconds: 0,
        milliseconds: 0
      });
      
      // Create the event
      const { data, error } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          summary: eventDetails.summary,
          description: eventDetails.description,
          location: eventDetails.location,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          colorId: eventDetails.colorId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsDialogOpen(false);
      toast.success("Évènement créé avec succès");
      
      // Réinitialiser le formulaire
      setEventDetails({
        summary: '',
        description: '',
        location: '',
        startTime: '09:00',
        endTime: '10:00',
        colorId: '1'
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'événement:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de créer l\'événement'}`);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const colorOptions = [
    { id: '1', name: 'Bleu Lavande', color: 'bg-blue-400' },
    { id: '2', name: 'Sauge', color: 'bg-green-400' },
    { id: '3', name: 'Raisin', color: 'bg-purple-400' },
    { id: '4', name: 'Flamant', color: 'bg-pink-400' },
    { id: '5', name: 'Banane', color: 'bg-yellow-400' },
    { id: '6', name: 'Mandarine', color: 'bg-orange-400' },
    { id: '7', name: 'Paon', color: 'bg-teal-400' },
    { id: '8', name: 'Graphite', color: 'bg-gray-400' },
    { id: '9', name: 'Myrtille', color: 'bg-blue-600' },
    { id: '10', name: 'Basilic', color: 'bg-green-600' },
    { id: '11', name: 'Tomate', color: 'bg-red-500' }
  ];

  const dateDisplay = selectedDate 
    ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) 
    : '';

  return (
    <>
      <Card className="booking-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <CalendarPlus className="h-5 w-5 mr-2 text-podcast-accent" />
            Calendrier Administrateur
          </CardTitle>
          <CardDescription>
            Sélectionnez une date pour créer un nouvel événement
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md bg-black/20 border border-gray-800"
          />
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-podcast-soft-black rounded-xl border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-podcast-accent">
              Créer un événement
            </DialogTitle>
            <DialogDescription>
              {dateDisplay}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Titre de l'événement</Label>
              <Input
                id="summary"
                name="summary"
                placeholder="Réunion d'équipe"
                value={eventDetails.summary}
                onChange={handleInputChange}
                className="bg-podcast-dark border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Détails de l'événement..."
                value={eventDetails.description}
                onChange={handleInputChange}
                className="bg-podcast-dark border-gray-700 min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                name="location"
                placeholder="Bureau, en ligne, etc."
                value={eventDetails.location}
                onChange={handleInputChange}
                className="bg-podcast-dark border-gray-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Heure de début
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={eventDetails.startTime}
                  onChange={handleInputChange}
                  className="bg-podcast-dark border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Heure de fin
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={eventDetails.endTime}
                  onChange={handleInputChange}
                  className="bg-podcast-dark border-gray-700"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="colorId">Couleur</Label>
              <div className="grid grid-cols-11 gap-1">
                {colorOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={`w-6 h-6 rounded-full ${option.color} ${eventDetails.colorId === option.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                    title={option.name}
                    onClick={() => setEventDetails({ ...eventDetails, colorId: option.id })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-3 sm:flex-row justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            
            <Button 
              onClick={handleCreateEvent} 
              className="bg-podcast-accent hover:bg-podcast-accent/80 text-black"
              disabled={isCreatingEvent || !eventDetails.summary || !eventDetails.startTime || !eventDetails.endTime}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              {isCreatingEvent ? 'Création...' : 'Créer l\'événement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCalendar;
