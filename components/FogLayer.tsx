"use client";

import { useEffect, useRef } from "react";

export default function FogLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.max(3, Math.floor(window.innerWidth / 150));

      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.6,
          radius: Math.random() * 200 + 100,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.08 + 0.02,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speed;

        if (particle.x > canvas.width + particle.radius) {
          particle.x = -particle.radius;
          particle.y = Math.random() * canvas.height * 0.6;
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius,
        );
        gradient.addColorStop(0, `rgba(160, 160, 160, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(120, 120, 120, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(100, 100, 100, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
      createParticles();
    };

    resize();
    createParticles();
    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fog-layer" aria-hidden="true" />;
}
