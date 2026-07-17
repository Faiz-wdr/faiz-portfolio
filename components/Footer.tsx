import Link from "next/link";

export default function Footer() {
  return (
    <>
      <hr className="divider fade-in-section" />
      <footer className="footer fade-in-section" aria-label="Footer Navigation">
        <div className="footer-left">
          © 2026 Faiz Rahim
        </div>
        <ul className="footer-right">
          <li>
            <Link href="/projects" className="footer-link">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/stories" className="footer-link">
              Stories
            </Link>
          </li>
          <li>
            <a
              href="https://linkedin.com/in/mohammedfaizk"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="LinkedIn (opens in a new tab)"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Faiz-wdr"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="GitHub (opens in a new tab)"
            >
              GitHub
            </a>
          </li>
          <li>
            <a href="mailto:kappil.faiz@gmail.com" className="footer-link">
              Email
            </a>
          </li>
        </ul>
      </footer>
    </>
  );
}
