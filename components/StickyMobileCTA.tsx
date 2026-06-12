"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.75);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="sticky-mobile-cta" role="complementary" aria-label="Quick actions">
      <Link href="/read/chapter-one" className="btn-primary">
        Read Free
      </Link>
      <Link href="/book" className="btn-ghost">
        Explore Book
      </Link>
    </div>
  );
}
