import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const projectsDirectory = path.join(process.cwd(), "content/projects");
const storiesDirectory = path.join(process.cwd(), "content/stories");

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  description: string;
  year: string;
  status: string;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  publishedDate: string;
  demoLink?: string;
}

export interface StoryFrontmatter {
  title: string;
  slug: string;
  description: string;
  category: string;
  readingTime?: string;
  publishedDate: string;
  coverImage?: string;
  tags?: string[];
}

export interface Project extends ProjectFrontmatter {
  contentHtml: string;
}

export interface Story extends StoryFrontmatter {
  contentHtml: string;
  calculatedReadingTime: string;
}

// Utility to calculate reading time dynamically
export function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Utility to sort content by published date descending
export function sortContentByDate<T extends { publishedDate: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });
}

// Get all projects
export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }
  
  const filenames = fs.readdirSync(projectsDirectory);
  const projects = filenames
    .filter((fn) => fn.endsWith(".mdx") || fn.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(projectsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      
      const publishedDateStr = data.publishedDate instanceof Date 
        ? data.publishedDate.toISOString().split("T")[0]
        : String(data.publishedDate || "");

      const fileSlug = filename.replace(/\.mdx?$/, "");

      return {
        ...(data as ProjectFrontmatter),
        slug: fileSlug,
        publishedDate: publishedDateStr,
        contentHtml: marked.parse(content) as string,
      } as Project;
    });

  return sortContentByDate(projects);
}

// Get featured projects
export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured === true);
}

// Get all stories
export function getAllStories(): Story[] {
  if (!fs.existsSync(storiesDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(storiesDirectory);
  const stories = filenames
    .filter((fn) => fn.endsWith(".mdx") || fn.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(storiesDirectory, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      
      const calculatedTime = calculateReadingTime(content);
      
      const publishedDateStr = data.publishedDate instanceof Date 
        ? data.publishedDate.toISOString().split("T")[0]
        : String(data.publishedDate || "");

      const fileSlug = filename.replace(/\.mdx?$/, "");

      return {
        ...(data as StoryFrontmatter),
        slug: fileSlug,
        publishedDate: publishedDateStr,
        calculatedReadingTime: data.readingTime || calculatedTime,
        contentHtml: marked.parse(content) as string,
      } as Story;
    });

  return sortContentByDate(stories);
}

// Get story by slug
export function getStoryBySlug(slug: string): Story | null {
  try {
    const stories = getAllStories();
    const story = stories.find((s) => s.slug === slug);
    return story || null;
  } catch (error) {
    return null;
  }
}

// Get 3 related stories
export function getRelatedStories(currentSlug: string): Story[] {
  const allStories = getAllStories();
  const currentStory = allStories.find((s) => s.slug === currentSlug);
  
  if (!currentStory) {
    return allStories.filter((s) => s.slug !== currentSlug).slice(0, 3);
  }

  // Filter out the current story
  const otherStories = allStories.filter((s) => s.slug !== currentSlug);

  // Score stories based on shared category and tags
  const scoredStories = otherStories.map((story) => {
    let score = 0;
    
    // Category match
    if (story.category === currentStory.category) {
      score += 3;
    }
    
    // Tags matches
    if (story.tags && currentStory.tags) {
      const sharedTags = story.tags.filter((tag) => currentStory.tags!.includes(tag));
      score += sharedTags.length * 1;
    }
    
    return { story, score };
  });

  // Sort by score descending, then by date descending
  scoredStories.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.story.publishedDate).getTime() - new Date(a.story.publishedDate).getTime();
  });

  return scoredStories.map((item) => item.story).slice(0, 3);
}
