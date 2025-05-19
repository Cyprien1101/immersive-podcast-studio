
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
  disabledDays: (date: Date) => boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ date, setDate, disabledDays }) => {
  return (
    <Card className="bg-podcast-dark border-gray-800 text-white h-fit">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Select Date</h3>
        
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-podcast-dark border-gray-700 hover:bg-gray-800"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-podcast-dark border-gray-700">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                disabled={disabledDays}
                className="pointer-events-auto"
                classNames={{
                  day_selected: "bg-black text-white hover:bg-gray-800",
                  day_today: "bg-gray-700 text-white",
                  day: "text-white hover:bg-gray-800 focus:bg-gray-800",
                  caption_label: "text-white",
                  head_cell: "text-gray-400"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateSelector;
