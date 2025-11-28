"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Passenger, PassengerStatus, STATUS_LABELS } from '@/lib/supabaseClient';
import { Plane, Bed, User, Calendar, Clock, ArrowRight, ArrowLeft, AlertCircle, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface PassengerDetailsSheetProps {
  passenger: Passenger | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: PassengerStatus) => void;
}

const STATUS_STYLES: Record<PassengerStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  picked_up: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  housed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
};

export function PassengerDetailsSheet({ passenger, isOpen, onClose, onStatusChange }: PassengerDetailsSheetProps) {
  if (!passenger) return null;

  const cycleStatus = () => {
    const statusOrder: PassengerStatus[] = ['pending', 'picked_up', 'housed'];
    const currentIndex = statusOrder.indexOf(passenger.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(passenger.id, nextStatus);
  };

  const styles = STATUS_STYLES[passenger.status];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {passenger.first_name} {passenger.last_name}
          </SheetTitle>
          {passenger.is_urgent && (
            <Badge variant="destructive" className="w-fit">
              <AlertCircle className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          )}
        </SheetHeader>

        <div className="space-y-6 pb-6">
          <div className={clsx('p-4 rounded-xl', styles.bg)}>
            <div className="flex items-center justify-between">
              <span className={clsx('font-semibold', styles.text)}>Statut</span>
              <Button onClick={cycleStatus} className="min-h-[44px]" size="lg">
                {STATUS_LABELS[passenger.status]}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Informations de vol
            </h3>
            <div className="space-y-3 pl-7">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{passenger.flight_date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Heure</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{passenger.flight_time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Plane className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Compagnie & Vol</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{passenger.airline}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {passenger.direction === 'arrival' ? (
                  <ArrowRight className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <ArrowLeft className="w-5 h-5 text-blue-500 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Direction</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {passenger.direction === 'arrival' ? 'Arrivée' : 'Départ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Hébergement
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lieu</p>
                <p className="font-semibold text-slate-900 dark:text-white">{passenger.accommodation}</p>
              </div>
              {passenger.host_info && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-900 dark:text-amber-200 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {passenger.host_info}
                  </p>
                </div>
              )}
            </div>
          </div>

          {passenger.tags && passenger.tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 pl-7">
                {passenger.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
