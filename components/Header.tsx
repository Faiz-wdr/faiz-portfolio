"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header fade-in-section">
      <nav className="nav" aria-label="Main Navigation">
        <Link href="/" style={{ textDecoration: "none" }} aria-label="Faiz Rahim Home Page">
          <LogoShuffle />
        </Link>
        <ul className="nav-links">
          <li>
            <Link 
              href="/projects" 
              className={`nav-link ${pathname === "/projects" ? "active" : ""}`}
              aria-current={pathname === "/projects" ? "page" : undefined}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link 
              href="/stories" 
              className={`nav-link ${pathname.startsWith("/stories") ? "active" : ""}`}
              aria-current={pathname.startsWith("/stories") ? "page" : undefined}
            >
              Stories
            </Link>
          </li>
          <li>
            <Link 
              href="/contact" 
              className={`nav-link ${pathname === "/contact" ? "active" : ""}`}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
