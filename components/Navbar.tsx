"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isReaderPage = pathname.startsWith("/read/");
  const navHidden = isReaderPage && hidden;
  const navScrolled = isReaderPage && scrolled;

  useEffect(() => {
    if (!isReaderPage) {
      return;
    }

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 80);

      if (open || currentScrollY < 120) {
        setHidden(false);
      } else {
        setHidden(currentScrollY > lastScrollY);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isReaderPage, open]);

  return (
    <>
      <nav
        className={`sl-nav ${isReaderPage ? "reader-nav" : ""} ${
          navHidden ? "nav-hidden" : ""
        } ${navScrolled ? "nav-scrolled" : ""}`}
      >
        <div className="nav-inner">
          <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
            <span className="logo-lamp">💡</span>
            <span className="logo-text">Streetlight</span>
          </Link>

          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/book" className="nav-link">The Book</Link>
            <Link href="/universe" className="nav-link">Universe</Link>
            <Link href="/community" className="nav-link">Community</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/search" className="nav-link">Search</Link>
          </div>

          <Link href="/checkout" className="nav-cta">
            Buy the Book
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/book" onClick={() => setOpen(false)}>The Book</Link>
        <Link href="/universe" onClick={() => setOpen(false)}>Universe</Link>
        <Link href="/community" onClick={() => setOpen(false)}>Community</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        <Link href="/search" onClick={() => setOpen(false)}>Search</Link>
        <Link href="/checkout" className="mobile-buy" onClick={() => setOpen(false)}>
          Buy the Book
        </Link>
      </div>
    </>
  );
}
