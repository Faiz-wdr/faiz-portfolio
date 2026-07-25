'use client';

import { useState, useEffect } from 'react';
import { getInitialLikes, getInitialShares } from './StoryActions';

interface StoryMetaCountsProps {
  slug: string;
  className?: string;
}

export default function StoryMetaCounts({ slug, className = "" }: StoryMetaCountsProps) {
  const [likes, setLikes] = useState<number>(() => getInitialLikes(slug));
  const [shares, setShares] = useState<number>(() => getInitialShares(slug));

  useEffect(() => {
    const baseLikes = getInitialLikes(slug);
    const baseShares = getInitialShares(slug);

    const likedKey = `faiz_story_liked_${slug}`;
    const sharesKey = `faiz_story_share_bonus_${slug}`;

    const savedLiked = localStorage.getItem(likedKey) === 'true';
    const savedSharesBonus = parseInt(localStorage.getItem(sharesKey) || '0', 10);

    setLikes(baseLikes + (savedLiked ? 1 : 0));
    setShares(baseShares + (isNaN(savedSharesBonus) ? 0 : savedSharesBonus));
  }, [slug]);

  return (
    <span className={`story-meta-counts ${className}`}>
      <span>{likes} Likes</span>
      <span className="dot" aria-hidden="true" />
      <span>{shares} Shares</span>
    </span>
  );
}
