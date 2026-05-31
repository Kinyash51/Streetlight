"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sl-nav">
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
          </div>

          <Link href="https://buy.stripe.com/test_eVqfZj4Vg7Ro3294p77kc00" className="nav-cta">
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
        <Link href="/checkout" className="mobile-buy" onClick={() => setOpen(false)}>
          Buy the Book
        </Link>
      </div>
    </>
  );
}