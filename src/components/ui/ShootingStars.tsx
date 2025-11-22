import React, { useEffect, useState, useRef } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#FF5555",
  trailColor = "#FF5555",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState<ShootingStar | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const createStar = () => {
      const { width, height } = svgRef.current ? svgRef.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      const x = Math.random() * width;
      const y = 0;
      const angle = 315; // Diagonal from top right
      const scale = 1 + Math.random();
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      const distance = 0;

      setStar({ id: Date.now(), x, y, angle, scale, speed, distance });
    };

    const animationLoop = () => {
      setStar((prevStar) => {
        if (!prevStar) return null;
        const newDistance = prevStar.distance + prevStar.speed;
        if (newDistance > 1000) { // Reset after travel
           return null;
        }
        return { ...prevStar, distance: newDistance };
      });
    };

    const timer = setInterval(() => {
        if(!star) createStar();
    }, Math.random() * (maxDelay - minDelay) + minDelay);
    
    const frame = setInterval(animationLoop, 20);

    return () => {
      clearInterval(timer);
      clearInterval(frame);
    };
  }, [star, minSpeed, maxSpeed, minDelay, maxDelay]);

  if (!star) return null;

  return (
    <svg
      ref={svgRef}
      className={`pointer-events-none absolute inset-0 h-full w-full z-10 ${className}`}
    >
      <rect
        key={star.id}
        x={star.x}
        y={star.y}
        width={starWidth * star.scale}
        height={starHeight}
        fill="url(#gradient)"
        transform={`translate(${star.distance * Math.cos((star.angle * Math.PI) / 180)}, ${
          star.distance * Math.sin((star.angle * Math.PI) / 180)
        }) rotate(${star.angle})`}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};