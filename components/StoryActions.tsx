'use client';

import { useState, useEffect } from 'react';

interface StoryActionsProps {
  slug: string;
  title?: string;
  className?: string;
}

// Simple hash function for deterministic initial numbers per story slug
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate deterministic random initial likes strictly between 40 and 90
export function getInitialLikes(slug: string): number {
  const hash = hashString(slug + "-likes-v1");
  return 40 + (hash % 51); // Returns integer between 40 and 90
}

// Generate deterministic random initial shares between 12 and 35
export function getInitialShares(slug: string): number {
  const hash = hashString(slug + "-shares-v1");
  return 12 + (hash % 24); // Returns integer between 12 and 35
}

export default function StoryActions({ slug, title, className = "" }: StoryActionsProps) {
  const [likesCount, setLikesCount] = useState<number>(() => getInitialLikes(slug));
  const [sharesCount, setSharesCount] = useState<number>(() => getInitialShares(slug));
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Load user's saved like & share states from localStorage after mounting
  useEffect(() => {
    const baseLikes = getInitialLikes(slug);
    const baseShares = getInitialShares(slug);

    const likedKey = `faiz_story_liked_${slug}`;
    const sharesKey = `faiz_story_share_bonus_${slug}`;

    const savedLiked = localStorage.getItem(likedKey) === 'true';
    const savedSharesBonus = parseInt(localStorage.getItem(sharesKey) || '0', 10);

    setIsLiked(savedLiked);
    setLikesCount(baseLikes + (savedLiked ? 1 : 0));
    setSharesCount(baseShares + (isNaN(savedSharesBonus) ? 0 : savedSharesBonus));
  }, [slug]);

  const handleLike = () => {
    const baseLikes = getInitialLikes(slug);
    const likedKey = `faiz_story_liked_${slug}`;

    if (isLiked) {
      setIsLiked(false);
      setLikesCount(baseLikes);
      localStorage.removeItem(likedKey);
    } else {
      setIsLiked(true);
      setLikesCount(baseLikes + 1);
      localStorage.setItem(likedKey, 'true');
    }
  };

  const handleShare = async () => {
    const baseShares = getInitialShares(slug);
    const sharesKey = `faiz_story_share_bonus_${slug}`;
    const currentBonus = parseInt(localStorage.getItem(sharesKey) || '0', 10);
    const newBonus = (isNaN(currentBonus) ? 0 : currentBonus) + 1;

    localStorage.setItem(sharesKey, newBonus.toString());
    setSharesCount(baseShares + newBonus);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Story by Faiz Rahim',
          url: shareUrl,
        });
        setShareFeedback('Shared');
      } catch (err) {
        // Fallback to clipboard if share was dismissed/cancelled
        if ((err as Error)?.name !== 'AbortError') {
          await copyLink(shareUrl);
        }
      }
    } else {
      await copyLink(shareUrl);
    }

    setTimeout(() => {
      setShareFeedback(null);
    }, 2500);
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback('Copied link');
    } catch {
      setShareFeedback('Link copied');
    }
  };

  return (
    <div className={`story-actions-wrapper ${className}`}>
      <div className="story-actions" role="group" aria-label="Story interaction options">
        <button
          onClick={handleLike}
          className={`story-action-btn ${isLiked ? 'is-liked' : ''}`}
          type="button"
          aria-label={isLiked ? "Unlike story" : "Like story"}
        >
          <span className="action-label">{isLiked ? 'Liked' : 'Like'}</span>
          <span className="action-count">{likesCount}</span>
        </button>

        <span className="story-actions-divider" aria-hidden="true">•</span>

        <button
          onClick={handleShare}
          className="story-action-btn"
          type="button"
          aria-label="Share story"
        >
          <span className="action-label">{shareFeedback || 'Share'}</span>
          <span className="action-count">{sharesCount}</span>
        </button>
      </div>
    </div>
  );
}
