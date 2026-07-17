import { MetadataRoute } from "next";
import { getAllStories } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories();

  const staticPaths = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/stories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  const storyPaths = stories.map((story) => {
    // Safely parse date or fallback to today
    let lastModified = new Date();
    if (story.publishedDate) {
      const parsedDate = new Date(story.publishedDate);
      if (!isNaN(parsedDate.getTime())) {
        lastModified = parsedDate;
      }
    }

    return {
      url: `${SITE_URL}/stories/${story.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticPaths, ...storyPaths];
}
