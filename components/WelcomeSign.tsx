'use client';

import { X } from 'lucide-react';
import { Passenger } from '@/lib/supabaseClient';

interface WelcomeSignProps {
  passenger: Passenger | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeSign({ passenger, isOpen, onClose }: WelcomeSignProps) {
  if (!isOpen || !passenger) return null;

  const fullName = `${passenger.first_name} ${passenger.last_name}`;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 cursor-pointer"
      onClick={onClose}
    >
      {/* Close button - positioned absolutely */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
        aria-label="Fermer"
      >
        <X className="w-6 h-6 text-slate-600" />
      </button>

      {/* CMCI Logo Section */}
      <div className="flex-shrink-0 mb-8">
        <div className="text-center">
          <div className="text-4xl md:text-6xl font-black text-blue-900 mb-2">
            CMCI
          </div>
          <div className="text-sm md:text-lg text-slate-600 font-medium tracking-wide">
            CENTRE MISSIONNAIRE CHRÉTIEN INTERNATIONAL
          </div>
        </div>
      </div>

      {/* Passenger Name - Main Content */}
      <div className="flex-1 flex items-center justify-center w-full max-w-6xl">
        <div className="text-center w-full">
          <h1 
            className="font-black text-slate-900 leading-tight break-words px-4"
            style={{
              fontSize: 'clamp(2.5rem, 12vw, 8rem)',
              lineHeight: '0.9'
            }}
          >
            {fullName}
          </h1>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="flex-shrink-0 mt-8 text-center">
        <div className="text-xl md:text-3xl font-bold text-blue-800 mb-2">
          Bienvenue • Welcome
        </div>
        <div className="text-sm md:text-base text-slate-500 font-medium">
          Jubilé CMCI 2025 • Yaoundé
        </div>
      </div>

      {/* Tap to close hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Appuyez pour fermer
        </div>
      </div>
    </div>
  );
}
