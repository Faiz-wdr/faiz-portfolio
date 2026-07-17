import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="container">
      {/* 404 Page Metadata Overlay */}
      <title>Page Not Found | Faiz Rahim</title>
      <meta name="description" content="The page you're looking for doesn't exist or may have been moved." />

      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main style={{ padding: "120px 24px", textAlign: "center" }}>
        <section className="fade-in-section">
          <div className="contact-label" style={{ marginBottom: "24px" }}>404</div>
          <h1 className="contact-title" style={{ fontSize: "36px", marginBottom: "16px" }}>
            Page Not Found
          </h1>
          <p className="contact-desc" style={{ maxWidth: "480px", margin: "0 auto 32px auto" }}>
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Link href="/" className="footer-link" style={{ textDecoration: "underline", fontSize: "15px" }}>
            Return to Homepage
          </Link>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
