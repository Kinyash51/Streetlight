"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import AuthNav from "@/components/AuthNav";
import { SearchTrigger, type SearchChapter } from "@/components/Search";
import { getSearchChapters } from "@/lib/book-chapters";

const searchChapters: SearchChapter[] = getSearchChapters();

type NavIcon =
  | "home"
  | "book"
  | "world"
  | "community"
  | "more"
  | "about"
  | "beta";

const primaryLinks = [
  { href: "/", label: "Home", icon: "home" as NavIcon },
  { href: "/book", label: "Read", icon: "book" as NavIcon },
  { href: "/universe", label: "World", icon: "world" as NavIcon },
  { href: "/community", label: "Community", icon: "community" as NavIcon },
];

function NavGlyph({ icon }: { icon: NavIcon }) {
  const paths: Record<NavIcon, ReactNode> = {
    home: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22Z" />
        <path d="M4 5.5V22" />
      </>
    ),
    world: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    community: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    beta: (
      <>
        <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.75 3h10.5A2 2 0 0 0 19 18l-5-9V3" />
        <path d="M8 15h8" />
      </>
    ),
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[icon]}
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/book") {
    return pathname === "/book" || pathname.startsWith("/read");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isReaderPage = pathname.startsWith("/read/");
  const navHidden = isReaderPage && hidden;
  const navScrolled = isReaderPage && scrolled;

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    document.body.classList.add("nav-sheet-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("nav-sheet-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!isReaderPage) {
      return;
    }

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 80);

      if (moreOpen || currentScrollY < 120) {
        setHidden(false);
      } else {
        setHidden(currentScrollY > lastScrollY);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isReaderPage, moreOpen]);

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <nav
        className={`sl-nav ${isReaderPage ? "reader-nav" : ""} ${
          navHidden ? "nav-hidden" : ""
        } ${navScrolled ? "nav-scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="Streetlight home">
            <span className="logo-mark" aria-hidden="true">
              <span />
            </span>
            <span className="logo-copy">
              <strong>Streetlight</strong>
              <small>Stories beneath the rain</small>
            </span>
          </Link>

          <div className="nav-links" aria-label="Primary destinations">
            {primaryLinks.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  href={item.href}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  key={item.href}
                >
                  <NavGlyph icon={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-utilities">
            <SearchTrigger chapters={searchChapters} />
            <AuthNav />
            <Link href="/read/chapter-one" className="nav-cta">
              <NavGlyph icon="book" />
              <span>Start reading</span>
            </Link>
          </div>
        </div>
      </nav>

      <nav className="mobile-dock" aria-label="Mobile navigation">
        {primaryLinks.slice(0, 3).map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
              key={item.href}
            >
              <NavGlyph icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={moreOpen ? "active" : ""}
          aria-expanded={moreOpen}
          aria-controls="mobile-more-sheet"
          onClick={() => setMoreOpen((current) => !current)}
        >
          <NavGlyph icon="more" />
          <span>More</span>
        </button>
      </nav>

      {moreOpen ? (
        <div
          className="mobile-sheet-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMoreOpen(false);
            }
          }}
        >
          <section
            className="mobile-nav-sheet"
            id="mobile-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More Streetlight destinations"
          >
            <div className="mobile-sheet-handle" aria-hidden="true" />
            <header>
              <div>
                <p className="section-tag">Navigate</p>
                <h2>Where do you want to go?</h2>
              </div>
              <button
                type="button"
                className="mobile-sheet-close"
                onClick={closeMore}
                aria-label="Close navigation"
              >
                Close
              </button>
            </header>

            <div className="mobile-sheet-grid">
              <Link href="/community" onClick={closeMore}>
                <NavGlyph icon="community" />
                <span>
                  <strong>Community</strong>
                  <small>Membership and reader updates</small>
                </span>
              </Link>
              <Link href="/beta" onClick={closeMore}>
                <NavGlyph icon="beta" />
                <span>
                  <strong>Beta program</strong>
                  <small>Apply and track your status</small>
                </span>
              </Link>
              <Link href="/about" onClick={closeMore}>
                <NavGlyph icon="about" />
                <span>
                  <strong>About Trevor</strong>
                  <small>The writer behind Streetlight</small>
                </span>
              </Link>
              <Link href="/search" onClick={closeMore}>
                <SearchGlyph />
                <span>
                  <strong>Full search</strong>
                  <small>Find passages and recurring images</small>
                </span>
              </Link>
            </div>

            <AuthNav variant="mobile" onNavigate={closeMore} />
          </section>
        </div>
      ) : null}
    </>
  );
}

function SearchGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
