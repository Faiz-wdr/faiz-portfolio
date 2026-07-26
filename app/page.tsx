import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProjects, getAllStories } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const projects = getFeaturedProjects();
  const allStories = getAllStories();
  // Limit to latest 3 stories for the homepage feed
  const stories = allStories.slice(0, 3);

  // Structured Data (JSON-LD) for Person and WebSite
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Faiz Rahim",
    "jobTitle": "Product Designer & Frontend Developer",
    "url": SITE_URL,
    "email": "kappil.faiz@gmail.com",
    "image": `${SITE_URL}/Icon.png`,
    "description": "Portfolio of Faiz Rahim, a Product Designer and Frontend Developer creating thoughtful digital products and user experiences.",
    "sameAs": [
      "https://github.com/Faiz-wdr",
      "https://www.linkedin.com/in/mohammedfaizk/"
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Faiz Rahim Portfolio",
    "url": SITE_URL,
    "author": {
      "@type": "Person",
      "name": "Faiz Rahim"
    }
  };

  return (
    <div className="container">
      {/* Dynamic Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Dynamic Client Navigation Header */}
      <Header />

      {/* Hero Section */}
      <main>
        <section className="hero fade-in-section">
          <h1 className="hero-title">
            Designing and Building<br />products that make work easier.
          </h1>
          <p className="hero-desc">
            I design and develop digital products that solve real problems through simple,
            intuitive experiences. I enjoy turning ideas into products that are useful,
            reliable and easy to use.
          </p>
          <p className="hero-desc">
            Always exploring new ideas and{" "}
            <Link href="/contact" className="highlight">
              open to collaborating
            </Link>{" "}
            on meaningful products.
          </p>
        </section>

        {/* Recent Projects Section */}
        <hr className="divider fade-in-section" />
        <section id="projects" className="section fade-in-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link href="/projects" className="view-all-link">View all</Link>
          </div>
          <div className="projects-list">
            {projects.map((project, idx) => (
              <a
                key={idx}
                href={project.demoLink || `https://github.com/Faiz-wdr/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-row"
                aria-label={`Project ${project.title}: ${project.description} (opens in a new tab)`}
              >
                <div className="project-year">{project.year}</div>
                <div className="project-details">
                  <div className="project-name">{project.title}</div>
                  <div className="project-desc">{project.description}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Latest Stories Section */}
        <hr className="divider fade-in-section" />
        <section id="stories" className="section fade-in-section">
          <div className="section-header">
            <h2 className="section-title">Latest Stories</h2>
            <Link href="/stories" className="view-all-link">View all</Link>
          </div>
          <div className="blogs-grid">
            {stories.map((story, idx) => (
              <Link 
                key={idx} 
                href={`/stories/${story.slug}`} 
                className="blog-card"
                aria-label={`Read story: ${story.title} (${story.calculatedReadingTime})`}
              >
                <div className="blog-date">{story.publishedDate} • {story.calculatedReadingTime}</div>
                <div className="blog-title">{story.title}</div>
                <div className="blog-excerpt">{story.description}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Static Server-Rendered Footer */}
      <Footer />
    </div>
  );
}
