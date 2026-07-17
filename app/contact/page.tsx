import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Faiz Rahim, a Product Designer and Frontend Developer.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Contact() {
  // Structured Data JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Contact",
        "item": `${SITE_URL}/contact`
      }
    ]
  };

  return (
    <div className="container">
      {/* Dynamic Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Contact Section */}
        <section className="contact-section fade-in-section" aria-label="Contact Information">
          <div className="contact-label">Contact</div>
          <h1 className="contact-title">Let's build something meaningful together.</h1>
          <p className="contact-desc">
            Whether you have an idea, a product to improve, or just want to connect, I'd be happy to hear from you.
          </p>
          <div className="contact-list">
            <div className="contact-row">
              <span className="contact-row-label">Email</span>
              <a href="mailto:kappil.faiz@gmail.com" className="contact-row-value">
                kappil.faiz@gmail.com
              </a>
            </div>
            <div className="contact-row">
              <span className="contact-row-label">Mobile</span>
              <a href="tel:+918086199683" className="contact-row-value">
                +91 8086199683
              </a>
            </div>
            <div className="contact-row">
              <span className="contact-row-label">LinkedIn</span>
              <a
                href="https://linkedin.com/in/mohammedfaizk"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-value"
                aria-label="LinkedIn (opens in a new tab)"
              >
                linkedin.com/in/mohammedfaizk
              </a>
            </div>
            <div className="contact-row">
              <span className="contact-row-label">GitHub</span>
              <a
                href="https://github.com/Faiz-wdr"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-value"
                aria-label="GitHub (opens in a new tab)"
              >
                github.com/Faiz-wdr
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
