"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";

export default function InteractiveBook() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);

  function handleMouseMove(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const rect = e.currentTarget.getBoundingClientRect();

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div
      className="book-3d-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="book-3d"
        style={{
          rotateX,
          rotateY,
        }}
      >
        <Image
          src="/images/book-cover.jpg"
          alt="The Drowned Streetlamp"
          width={380}
          height={570}
          className="book-cover-image"
        />
      </motion.div>
    </div>
  );
}