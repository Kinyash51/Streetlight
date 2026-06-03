"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";

type BookCover3DProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export default function BookCover3D({
  src,
  alt,
  width = 380,
  height = 570,
}: BookCover3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glowX: 50,
    glowY: 50,
  });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setTransform({
      rotateY: (x - 0.5) * 30,
      rotateX: (y - 0.5) * -30,
      glowX: x * 100,
      glowY: y * 100,
    });
  }

  function handleMouseLeave() {
    setTransform({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  }

  return (
    <div
      ref={containerRef}
      className="book-cover-3d-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="book-cover-3d"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
      >
        <div
          className="book-cover-glow"
          style={{
            background: `radial-gradient(circle at ${transform.glowX}% ${transform.glowY}%, rgba(245, 158, 11, 0.3) 0%, transparent 60%)`,
          }}
        />
        <div className="book-cover-image-wrapper">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="book-cover-image"
            priority
          />
          <div
            className="book-cover-shine"
            style={{
              background: `linear-gradient(${135 + transform.rotateY}deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
