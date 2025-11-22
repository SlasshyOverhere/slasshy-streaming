import React, { useState, useEffect, useRef } from "react";

interface StarsBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

export const StarsBackground: React.FC<StarsBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        
        // Calculate number of stars
        const area = width * height;
        const numStars = Math.floor(area * starDensity);
        
        const newStars = Array.from({ length: numStars }).map(() => {
          const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
          return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 0.05 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            twinkleSpeed: shouldTwinkle
              ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
              : null,
          };
        });
        setStars(newStars);
      }
    };

    updateStars();
    window.addEventListener("resize", updateStars);
    return () => window.removeEventListener("resize", updateStars);
  }, [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        let opacity = star.opacity;
        if (star.twinkleSpeed) {
          opacity = 0.5 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full bg-transparent mix-blend-screen ${className}`}
    />
  );
};