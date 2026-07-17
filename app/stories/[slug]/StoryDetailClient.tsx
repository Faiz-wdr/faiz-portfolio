"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Story } from "@/lib/content";

function LogoShuffle() {
  const target = "faizrahim";
  const [displayText, setDisplayText] = useState(target.split(""));
  const isShuffling = useRef(false);

  const startShuffle = () => {
    if (isShuffling.current) return;
    isShuffling.current = true;

    const chars = "abcdefghijklmnopqrstuvwxyz";
    const targetArray = target.split("");
    
    const letters = targetArray.map((char, index) => ({
      targetChar: char,
      currentCycle: 0,
      maxCycles: 6 + Math.floor(Math.random() * 5) + index * 2,
    }));

    const interval = setInterval(() => {
      let completed = true;
      const updated = letters.map((item) => {
        if (item.currentCycle < item.maxCycles) {
          item.currentCycle++;
          completed = false;
          return chars[Math.floor(Math.random() * chars.length)];
        }
        return item.targetChar;
      });

      setDisplayText(updated);

      if (completed) {
        clearInterval(interval);
        isShuffling.current = false;
      }
    }, 35);
  };

  return (
    <div 
      className="logo"
      onMouseEnter={startShuffle}
      style={{ display: "inline-flex", cursor: "pointer", userSelect: "none" }}
    >
      {displayText.map((char, i) => (
        <span key={i} style={{ display: "inline-block" }}>
          {char}
        </span>
      ))}
    </div>
  );
}

interface StoryDetailClientProps {
  story: Story;
  relatedStories: Story[];
}

export default function StoryDetailClient({ story, relatedStories }: StoryDetailClientProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const fadeElems = document.querySelectorAll(".fade-in-section");
    fadeElems.forEach((elem) => observer.observe(elem));

    return () => {
      fadeElems.forEach((elem) => observer.unobserve(elem));
    };
  }, [story.slug]);

  return (
    <div className="container" ref={scrollRef}>
      {/* Navigation Header */}
      <header className="header fade-in-section">
        <nav className="nav">
          <Link href="/" style={{ textDecoration: "none" }}>
            <LogoShuffle />
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/projects" className={`nav-link ${pathname === "/projects" ? "active" : ""}`}>
                Projects
              </Link>
            </li>
            <li>
              <Link href="/stories" className={`nav-link ${pathname.startsWith("/stories") ? "active" : ""}`}>
                Stories
              </Link>
            </li>
            <li>
              <Link href="/contact" className={`nav-link ${pathname === "/contact" ? "active" : ""}`}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="story-detail-container">
        {/* Story Header */}
        <header className="story-detail-header fade-in-section">
          <div className="story-detail-meta">
            <span>{story.publishedDate}</span>
            <span className="dot" />
            <span>{story.calculatedReadingTime}</span>
            <span className="dot" />
            <span style={{ fontWeight: 600, color: "var(--heading-color)" }}>
              {story.category}
            </span>
          </div>
          <h1 className="story-detail-title">{story.title}</h1>
        </header>

        {/* Story Body */}
        <section className="fade-in-section">
          <div 
            className="story-body"
            dangerouslySetInnerHTML={{ __html: story.contentHtml }}
          />
        </section>

        {/* Continue Reading Section */}
        {relatedStories.length > 0 && (
          <section className="continue-reading fade-in-section">
            <h3 className="continue-reading-title">Continue Reading</h3>
            <div className="blogs-grid">
              {relatedStories.map((relatedStory, idx) => (
                <Link key={idx} href={`/stories/${relatedStory.slug}`} className="blog-card">
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
      <hr className="divider fade-in-section" style={{ marginTop: "120px" }} />
      <footer className="footer fade-in-section">
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
    </div>
  );
}
