"use client";

import { useEffect, useState, useRef } from "react";
import { track } from "@vercel/analytics";

interface Sector {
  label: string;
  title: string;
  desc: string;
  ctaText: string;
  ctaLink: string;
}

const SECTORS: Sector[] = [
  {
    label: "Coffee Chat",
    title: "1-on-1 Coffee Chat!",
    desc: "Let's connect! You've won a 30-minute virtual coffee chat. We can talk design, engineering, or anything in between.",
    ctaText: "Schedule Call",
    ctaLink: "mailto:kappil.faiz@gmail.com?subject=Claiming Coffee Chat Reward"
  },
  {
    label: "Personal Website",
    title: "Custom Personal Website!",
    desc: "Incredible! You've won a custom personal website designed and built from scratch to showcase your work.",
    ctaText: "Claim My Website",
    ctaLink: "mailto:kappil.faiz@gmail.com?subject=Claiming Custom Personal Website Reward"
  },
  {
    label: "Resume Review",
    title: "Detailed Resume Review!",
    desc: "Awesome! You've won a comprehensive review of your resume with actionable design and content feedback to land more interviews.",
    ctaText: "Submit Resume",
    ctaLink: "mailto:kappil.faiz@gmail.com?subject=Claiming Resume Review"
  },
  {
    label: "Ui Audit",
    title: "UI/UX Product Audit!",
    desc: "Outstanding! You've won a thorough UI/UX audit for your app or website. Get design enhancements to level up your user experience.",
    ctaText: "Submit Website Link",
    ctaLink: "mailto:kappil.faiz@gmail.com?subject=Claiming UI/UX Audit"
  },
  {
    label: "Surprise",
    title: "A Surprise Gift!",
    desc: "Ooh, a mystery! You've unlocked a surprise reward. Let's get in touch to reveal what special gift is waiting for you.",
    ctaText: "Reveal My Surprise",
    ctaLink: "mailto:kappil.faiz@gmail.com?subject=Revealing Surprise Gift"
  }
];

const logEvent = (eventName: string, properties?: Record<string, any>) => {
  console.log(`[Analytics Event] ${eventName}`, properties || "");
  try {
    track(eventName, properties);
  } catch (e) {
    // Vercel Analytics might fail in dev environments, ignore silently
  }
};

export default function BirthdayPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Sector | null>(null);

  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Check if the user has already seen the popup in this session
    const hasSeen = sessionStorage.getItem("hasSeenBirthdayPopup");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        logEvent("Wheel Opened");
      }, 1000); // Show popup after 1 second
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenBirthdayPopup", "true");
  };

  const handleSpin = () => {
    if (isSpinning || showResult) return;

    setIsSpinning(true);
    logEvent("Wheel Spun");

    // Choose a random index (0 to 4)
    const randomIndex = Math.floor(Math.random() * SECTORS.length);
    const prize = SECTORS[randomIndex];
    setWinningPrize(prize);

    // Calculate rotation:
    // Slices are 72 degrees each.
    // Index 0 is at 12 o'clock, index 1 is at 2 o'clock, etc.
    // Target rotation to put the index at the top pointer (-90 deg in relative circle coordinate):
    const sectorAngle = 72;
    const targetSectorAngle = (360 - randomIndex * sectorAngle) % 360;

    // Add random offset inside sector (-18 to +18 degrees) to keep it realistic and away from borders
    const offset = Math.random() * 36 - 18;

    const spins = 6; // Number of full spins
    const currentRotationMod = rotation % 360;
    let diff = targetSectorAngle - currentRotationMod;

    if (diff <= 0) {
      diff += 360;
    }

    const newRotation = rotation + (spins * 360) + diff + offset;
    setRotation(newRotation);

    // Duration of transition is 4.2 seconds
    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      logEvent("Gift Won", { gift: prize.label });
    }, 4200);
  };

  if (!isOpen) return null;

  // Compute SVG Sector paths
  const R = 90;
  const cx = 100;
  const cy = 100;
  const sectorPaths = SECTORS.map((sector, i) => {
    // Math angles:
    // Sector 0 spans 72 degrees, centered at -90 degrees (12 o'clock), i.e. from -126 to -54 degrees.
    const theta1 = i * 72 - 126;
    const theta2 = i * 72 - 54;

    const rad1 = (theta1 * Math.PI) / 180;
    const rad2 = (theta2 * Math.PI) / 180;

    const x1 = cx + R * Math.cos(rad1);
    const y1 = cy + R * Math.sin(rad1);
    const x2 = cx + R * Math.cos(rad2);
    const y2 = cy + R * Math.sin(rad2);

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;

    // Text coordinates (at radius 60)
    const thetaMid = i * 72 - 90;
    const radMid = (thetaMid * Math.PI) / 180;
    const tx = cx + 60 * Math.cos(radMid);
    const ty = cy + 60 * Math.sin(radMid);

    // Rotation for the text so it faces tangential to the circle
    const textRotation = thetaMid + 90;

    return {
      pathData,
      color: i % 2 === 0 ? "#9A7418" : "#FDC743",
      textColor: i % 2 === 0 ? "#ffffff" : "#1c1b1b",
      label: sector.label,
      tx,
      ty,
      textRotation
    };
  });

  // Generate 12 decorative dots around the border
  const borderDots = Array.from({ length: 12 }).map((_, j) => {
    const angle = j * 30;
    const rad = (angle * Math.PI) / 180;
    const dotX = cx + 86 * Math.cos(rad);
    const dotY = cy + 86 * Math.sin(rad);
    return { dotX, dotY };
  });

  // Helper to split text labels into two lines for readability inside the sector slices
  const getLabelLines = (label: string) => {
    if (label === "Coffee Chat") return ["Coffee", "Chat"];
    if (label === "Personal Website") return ["Personal", "Website"];
    if (label === "Resume Review") return ["Resume", "Review"];
    if (label === "Ui Audit") return ["UI UX", "Audit"];
    return [label];
  };

  return (
    <div className={`birthday-popup-overlay ${isOpen ? "is-open" : ""}`} onClick={handleClose}>
      <div className="birthday-popup-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="birthday-popup-close-btn"
          onClick={handleClose}
          aria-label="Close Pop-up"
        >
          ✕
        </button>

        {/* Card Header (Avatar + Dark Curved Block) */}
        <div className="birthday-popup-avatar-container">
          <img
            src="/assets/birthday-avatar.png"
            alt="Faiz Avatar"
            className="birthday-popup-avatar"
          />
        </div>

        {/* Card Body */}
        <div className="birthday-popup-body" style={{ position: "relative" }}>

          {/* Title */}
          <h2 className="birthday-popup-title">
            It is My<br />Birthday Today
          </h2>

          {/* Subtitle */}
          <p className="birthday-popup-subtitle">
            I'd Love To Give You A <span className="highlight">Little Gift</span>
          </p>

          {/* Interactive SVG Spin Wheel */}
          <div className="birthday-popup-wheel-container">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ overflow: "visible" }}
            >
              {/* Spinning Group */}
              <g
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "100px 100px",
                  transition: isSpinning ? "transform 4.2s cubic-bezier(0.1, 0.8, 0.1, 1)" : "transform 0.5s ease-out"
                }}
              >
                {/* Sectors */}
                {sectorPaths.map((p, idx) => {
                  const lines = getLabelLines(p.label);
                  return (
                    <g key={idx}>
                      <path d={p.pathData} fill={p.color} stroke="#ffffff" strokeWidth="0.5" />
                      <text
                        x={p.tx}
                        y={p.ty}
                        textAnchor="middle"
                        fill={p.textColor}
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="var(--font-manrope), sans-serif"
                        transform={`rotate(${p.textRotation}, ${p.tx}, ${p.ty})`}
                      >
                        {lines.map((line, lineIdx) => {
                          let dy = "3px"; // default for 1 line
                          if (lines.length === 2) {
                            dy = lineIdx === 0 ? "-3px" : "9px";
                          }
                          return (
                            <tspan key={lineIdx} x={p.tx} dy={dy} textAnchor="middle">
                              {line}
                            </tspan>
                          );
                        })}
                      </text>
                    </g>
                  );
                })}

                {/* Outer Rim Circle */}
                <circle cx={cx} cy={cy} r="90" fill="none" stroke="#9A7418" strokeWidth="4" />

                {/* Decorative border dots */}
                {borderDots.map((d, idx) => (
                  <circle key={idx} cx={d.dotX} cy={d.dotY} r="2.5" fill="#ffffff" />
                ))}
              </g>

              {/* Center Trigger Button (SPIN) - Stationary */}
              <g onClick={handleSpin} style={{ cursor: "pointer" }}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="26"
                  fill="#ffffff"
                  stroke="#9A7418"
                  strokeWidth="3.5"
                  style={{
                    filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.15))"
                  }}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#9A7418"
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="var(--font-manrope), sans-serif"
                  letterSpacing="0.05em"
                >
                  SPIN
                </text>
              </g>

              {/* Top Selector Arrow Pointer (Stationary) */}
              <g>
                <polygon
                  points="100,18 92,3 108,3"
                  fill="rgba(0,0,0,0.15)"
                  transform="translate(0, 1.5)"
                />
                <polygon
                  points="100,17 93,2 107,2"
                  fill="#ba1a1a"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            </svg>
          </div>

          {/* Button CTA */}
          <button
            className="birthday-popup-btn"
            onClick={handleSpin}
            disabled={isSpinning || showResult}
          >
            {isSpinning ? "Spinning..." : "Spin and Claim Your Gift"}
          </button>

          {/* Result Banner Overlay */}
          <div className={`birthday-popup-result ${showResult ? "is-visible" : ""}`}>
            <h3 className="birthday-popup-result-title">Congratulations!</h3>
            <p className="birthday-popup-result-desc" style={{ marginBottom: "12px" }}>
              You spun the wheel and won:
            </p>
            <div 
              className="birthday-popup-result-prize" 
              style={{ 
                fontSize: "20px", 
                fontWeight: "800", 
                color: "#9A7418", 
                lineHeight: "1.3",
                marginBottom: "12px",
                fontFamily: "var(--font-playfair), Georgia, serif"
              }}
            >
              {winningPrize?.title}
            </div>
            <p className="birthday-popup-result-desc" style={{ fontSize: "13.5px", marginBottom: "24px", lineHeight: "1.4" }}>
              {winningPrize?.desc}
            </p>
            <a 
              href={winningPrize?.ctaLink}
              className="birthday-popup-btn"
              style={{ display: "block", textDecoration: "none", textAlign: "center" }}
              onClick={() => {
                logEvent("Claim Button Clicked", { gift: winningPrize?.label });
                handleClose();
              }}
            >
              {winningPrize?.ctaText}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
