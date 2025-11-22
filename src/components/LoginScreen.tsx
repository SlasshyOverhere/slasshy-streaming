import React from 'react';
import { Button } from './ui/Button';
import { Clapperboard, Lock, ArrowRight } from 'lucide-react';
import { StarsBackground } from './ui/StarsBackground';
import { ShootingStars } from './ui/ShootingStars';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral-950 antialiased selection:bg-red-500/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <StarsBackground className="opacity-50" />
        <ShootingStars />
      </div>
      
      {/* Dark Overlay for contrast */}
      <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* Content Overlay */}
      <div className="z-10 flex w-full flex-col items-center justify-center px-4 animate-float">
        <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:p-12 ring-1 ring-white/5">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_40px_-10px_rgba(220,38,38,0.6)]">
              <Clapperboard className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Slasshy Streaming
            </h1>
            <p className="text-base text-neutral-300">
              The next-generation entertainment dashboard.
            </p>
          </div>

          {/* Action */}
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
               <div className="flex items-center gap-4">
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900">
                    <Lock className="h-5 w-5 text-neutral-400" />
                 </div>
                 <div>
                   <h3 className="text-sm font-medium text-white">Secure Gateway</h3>
                   <p className="text-xs text-neutral-400">Powered by Auth0 authentication</p>
                 </div>
               </div>
            </div>

            <Button 
              onClick={onLogin} 
              variant="shimmer" 
              size="lg" 
              className="w-full text-base font-semibold shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              Enter Platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
             <p className="text-xs font-medium text-neutral-500">
               By entering, you agree to our Terms of Service.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};