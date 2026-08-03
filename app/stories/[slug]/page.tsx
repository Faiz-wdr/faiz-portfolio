import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllStories, getStoryBySlug, getRelatedStories } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

import StoryActions from "@/components/StoryActions";
import StoryMetaCounts from "@/components/StoryMetaCounts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const stories = getAllStories();
  return stories.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const story = getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story Not Found",
    };
  }

  return {
    title: story.title,
    description: story.description,
    alternates: {
      canonical: `/stories/${story.slug}`,
    },
    openGraph: {
      title: `${story.title} | Faiz Rahim`,
      description: story.description,
      type: "article",
      url: `${SITE_URL}/stories/${story.slug}`,
      publishedTime: story.publishedDate,
      authors: ["Faiz Rahim"],
      tags: story.tags || [],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${story.title} | Faiz Rahim`,
      description: story.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const story = getStoryBySlug(slug);
  
  if (!story) {
    notFound();
  }

  const relatedStories = getRelatedStories(slug);

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": story.title,
        "item": `${SITE_URL}/stories/${story.slug}`
      }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": story.title,
    "description": story.description,
    "datePublished": story.publishedDate,
    "author": {
      "@type": "Person",
      "name": "Faiz Rahim"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Faiz Rahim",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/Icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/stories/${story.slug}`
    }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="story-detail-container">
        {/* Story Header */}
        <header className="story-detail-header fade-in-section">
          <div className="story-detail-meta">
            <span>{story.publishedDate}</span>
            <span className="dot" aria-hidden="true" />
            <span>{story.calculatedReadingTime}</span>
            <span className="dot" aria-hidden="true" />
            <span style={{ fontWeight: 600, color: "var(--heading-color)" }}>
              {story.category}
            </span>
            <span className="dot story-detail-meta-dot" aria-hidden="true" />
            <StoryMetaCounts slug={story.slug} className="story-detail-meta-counts" />
          </div>
          <h1 className="story-detail-title">{story.title}</h1>
        </header>

        {/* Story Body */}
        <article className="fade-in-section" aria-label="Story content">
          <div 
            className="story-body"
            dangerouslySetInnerHTML={{ __html: story.contentHtml }}
          />

          {/* Minimal Story Actions (Like & Share) */}
          <StoryActions slug={story.slug} title={story.title} />
        </article>

        {/* Continue Reading Section */}
        {relatedStories.length > 0 && (
          <section className="continue-reading fade-in-section" aria-label="Related Stories">
            <h3 className="continue-reading-title">Continue Reading</h3>
            <div className="blogs-grid">
              {relatedStories.map((relatedStory, idx) => (
                <Link 
                  key={idx} 
                  href={`/stories/${relatedStory.slug}`} 
                  className="blog-card"
                  aria-label={`Read related story: ${relatedStory.title} (${relatedStory.calculatedReadingTime})`}
                >
                  <div className="blog-date">
                    {relatedStory.publishedDate} • {relatedStory.calculatedReadingTime}
                  </div>
                  <div className="blog-title">{relatedStory.title}</div>
                  <div className="blog-excerpt">{relatedStory.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
