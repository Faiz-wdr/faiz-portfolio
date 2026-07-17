import type { Metadata } from "next";
import { getAllProjects } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work from product design and development by Faiz Rahim.",
  alternates: {
    canonical: "/projects",
  },
};

export default function Projects() {
  const projects = getAllProjects();

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
        "name": "Projects",
        "item": `${SITE_URL}/projects`
      }
    ]
  };

  const creativeWorksJsonLd = {
    "@context": "https://schema.org",
    "@graph": projects.map((project) => ({
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description,
      "datePublished": project.publishedDate,
      "creator": {
        "@type": "Person",
        "name": "Faiz Rahim"
      },
      "url": project.demoLink || `https://github.com/Faiz-wdr/${project.slug}`
    }))
  };

  return (
    <div className="container">
      {/* Dynamic Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorksJsonLd) }}
      />

      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Page Hero */}
        <section className="projects-hero fade-in-section">
          <div className="projects-label">Projects</div>
          <h1 className="projects-title">
            Selected work from product design and development.
          </h1>
          <p className="projects-desc">
            A collection of products I've designed and built, from internal tools to SaaS platforms, focused on solving real problems with simple experiences.
          </p>
        </section>

        {/* Projects List */}
        <section className="projects-page-list fade-in-section" aria-label="Projects List">
          {projects.map((project, idx) => (
            <a
              key={idx}
              href={project.demoLink || `https://github.com/Faiz-wdr/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="projects-page-row"
              aria-label={`Project: ${project.title}. Year: ${project.year}. Status: ${project.status}. Description: ${project.description}`}
            >
              <div className="projects-page-row-year">{project.year}</div>
              <div className="projects-page-row-details">
                <div className="projects-page-row-name">{project.title}</div>
                <div className="projects-page-row-desc">{project.description}</div>
              </div>
              <div className={`projects-page-row-status status-${project.status.toLowerCase()}`}>
                {project.status}
              </div>
              <div className="projects-page-row-tags">
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="projects-page-row-arrow" aria-hidden="true">→</div>
            </a>
          ))}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
