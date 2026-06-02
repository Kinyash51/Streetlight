import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Streetlight</h3>
          <p>
            Urban noir fiction by Trevor Kinyanjui. Stories of survival,
            loneliness, and secrets beneath neon light.
          </p>
          <div className="footer-social-proof">
            <span>The Drowned Streetlamp</span>
            <span>Chapter One live</span>
            <span>Chapter Two in progress</span>
          </div>
        </div>

        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/book">The Book</Link>
          <Link href="/universe">Universe</Link>
          <Link href="/community">Community</Link>
          <Link href="/about">About</Link>
          <Link href="/search">Search</Link>
        </div>

        <div className="footer-bottom">
          <small>© 2026 Streetlight. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
