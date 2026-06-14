import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Streetlight
            </Link>
            <p className="footer-tagline">
              An urban noir universe exploring memory, loneliness, and the quiet violence of survival.
            </p>
          </div>

          <div className="footer-nav">
            <div className="footer-col">
              <h4>Fiction</h4>
              <ul>
                <li>
                  <Link href="/book" className="footer-link">
                    The Book
                  </Link>
                </li>
                <li>
                  <Link href="/read/chapter-one" className="footer-link">
                    Read Chapter One
                  </Link>
                </li>
                <li>
                  <Link href="/universe" className="footer-link">
                    Lore & Universe
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li>
                  <Link href="/beta" className="footer-link">
                    Beta Program
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="footer-link">
                    The Writer
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="footer-link">
                    Reader Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-credits">
          <p className="footer-copyright">
            &copy; {currentYear} Streetlight. All rights reserved.
          </p>
          <p className="footer-copyright footer-signature">
            Written by Trevor Kinyanjui
          </p>
        </div>
      </div>
    </footer>
  );
}
