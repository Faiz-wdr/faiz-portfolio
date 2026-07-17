import type { Metadata } from "next";
import Link from "next/link";
import { getAllStories } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Stories",
  description: "Design stories, product thinking and lessons from building real products by Faiz Rahim.",
  alternates: {
    canonical: "/stories",
  },
};

export default function Stories() {
  const stories = getAllStories();

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
        "name": "Stories",
        "item": `${SITE_URL}/stories`
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
        {/* Page Hero */}
        <section className="stories-hero fade-in-section">
          <div className="stories-label">Stories</div>
          <h1 className="stories-title">
            Design stories, product thinking and lessons from building real products.
          </h1>
          <p className="stories-desc">
            A collection of case studies, product decisions, engineering experiences and ideas gathered while designing and building software.
          </p>
        </section>

        {/* Stories List */}
        <section className="stories-page-list fade-in-section" aria-label="Stories Journal Feed">
          {stories.map((story, idx) => (
            <Link
              key={idx}
              href={`/stories/${story.slug}`}
              className="story-row"
              aria-label={`Read story: ${story.title}. Published: ${story.publishedDate}. Category: ${story.category}`}
            >
              <div className="story-row-meta">
                <div>{story.publishedDate}</div>
                <div style={{ opacity: 0.6 }}>{story.calculatedReadingTime}</div>
              </div>
              <div className="story-row-details">
                <span className="story-row-category">{story.category}</span>
                <h2 className="story-row-title">{story.title}</h2>
                <p className="story-row-excerpt">{story.description}</p>
              </div>
              <div className="story-row-arrow" aria-hidden="true">→</div>
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
