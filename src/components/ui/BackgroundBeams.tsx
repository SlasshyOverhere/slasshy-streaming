import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={`absolute inset-0 h-full w-full overflow-hidden bg-neutral-950 ${className}`}
    >
      <div className="absolute h-full w-full bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="absolute left-0 top-0 h-[100vh] w-[100vw] overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 opacity-40 overflow-visible">
           {/* Decorative Gradients acting as 'beams' */}
           <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 blur-[100px] opacity-20 animate-beam-rotate origin-center" />
           <div className="absolute inset-0 bg-gradient-to-t from-red-500 to-purple-500 blur-[100px] opacity-20 animate-beam-rotate origin-center animation-delay-2000" style={{ animationDirection: 'reverse' }} />
        </div>
        
        <svg
          className="pointer-events-none fixed inset-0 h-full w-full [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              x="-1"
              y="-1"
            >
              <path d="M.5 40V.5H40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)" />
        </svg>
      </div>
    </div>
  );
};