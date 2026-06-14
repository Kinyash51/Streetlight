"use client";

import { useEffect, useRef } from "react";

export default function ParallaxLayers() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = container.querySelectorAll<HTMLElement>(".parallax-layer");

    const handleScroll = () => {
      const scrollY = window.scrollY;

      layers.forEach((layer) => {
        const speed = Number.parseFloat(layer.dataset.speed || "0.1");
        const direction = layer.dataset.direction === "up" ? -1 : 1;
        
        // Highly optimized styling layer logic bypassing layout rect recalculations
        layer.style.transform = `translate3d(0, ${scrollY * speed * direction}px, 0)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="parallax-container" aria-hidden="true">
      {/* BACKGROUND BUILDINGS PROFILE */}
      <div className="parallax-layer parallax-buildings" data-speed="0.06" data-direction="up">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="buildings-svg">
          <path
            d="M0,400 L0,250 L80,250 L80,180 L140,180 L140,280 L200,280 L200,150 L260,150 L260,220 L320,220 L320,120 L400,120 L400,260 L480,260 L480,100 L560,100 L560,240 L640,240 L640,160 L720,160 L720,280 L800,280 L800,140 L880,140 L880,200 L960,200 L960,260 L1040,260 L1040,110 L1120,110 L1120,240 L1200,240 L1200,400 Z"
            fill="#050709"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* MIDGROUND LIGHT SOURCE ANCHORS */}
      <div className="parallax-layer parallax-lamps" data-speed="0.12" data-direction="up">
        <div className="lamp-post lamp-1">
          <div className="lamp-glow" />
        </div>
        <div className="lamp-post lamp-2">
          <div className="lamp-glow" />
        </div>
        <div className="lamp-post lamp-3">
          <div className="lamp-glow" />
        </div>
      </div>

      {/* FOREGROUND VECTOR LAYER STREAKS */}
      <div className="parallax-layer parallax-rain-offset" data-speed="0.25" data-direction="down">
        <div className="rain-streaks" />
      </div>
    </div>
  );
}
