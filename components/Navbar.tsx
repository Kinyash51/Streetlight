"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNav from "./AuthNav";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let timeoutId: number | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    const throttledScroll = () => {
      if (timeoutId === null) {
        timeoutId = window.requestAnimationFrame(() => {
          handleScroll();
          timeoutId = null;
        });
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) window.cancelAnimationFrame(timeoutId);
    };
  }, []);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));

  return (
    <div
      className={`sl-nav-container ${hidden ? "nav-hidden" : ""} ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <nav className="sl-nav" aria-label="Primary navigation">
        <Link href="/" className="nav-logo">
          <div className="logo-mark" aria-hidden="true" />
          <div className="logo-copy">
            <strong>Streetlight</strong>
            <small>Fiction platform</small>
          </div>
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Story
          </Link>
          <Link
            href="/book"
            className={`nav-link ${isActive("/book") ? "active" : ""}`}
          >
            Archive
          </Link>
          <Link
            href="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            About
          </Link>
        </div>

        <div className="nav-utilities">
          <Link href="/read" className="nav-cta">
            Read Now
          </Link>
          <AuthNav variant="desktop" />
        </div>
      </nav>
    </div>
  );
}
