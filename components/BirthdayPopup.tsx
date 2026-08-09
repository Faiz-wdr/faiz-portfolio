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
    label: "PersonalOs Pro",
    title: "PersonalOS Pro License!",
    desc: "signup to PersonalOs(beta) app, you will get pro access very quickly.",
    ctaText: "Go to PersonalOS",
    ctaLink: "https://personalos.faizrahim.online"
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

  // Trigger our custom database tracking
  import("@/lib/analytics").then(({ trackEvent, trackWheelSpin, getSessionId }) => {
    if (eventName === "Wheel Opened") {
      trackEvent("Wheel Open");
    } else if (eventName === "Wheel Spun") {
      trackEvent("Wheel Spin");
    } else if (eventName === "Gift Won" && properties?.gift) {
      trackEvent("Gift Won");
      
      const giftLabel = properties.gift;
      let giftId = "Surprise";
      if (giftLabel === "Coffee Chat") giftId = "Coffee Chat";
      else if (giftLabel === "Personal Website") giftId = "Personal Website";
      else if (giftLabel === "PersonalOs Pro") giftId = "PersonalOs Pro";
      else if (giftLabel === "Resume Review") giftId = "Resume Review";
      else if (giftLabel === "Ui Audit" || giftLabel === "Ui UX Audit") giftId = "Ui Audit";

      trackWheelSpin({
        gift: giftLabel,
        giftId: giftId,
        claimed: false,
        status: "pending"
      });
    } else if (eventName === "Claim Button Clicked" && properties?.gift) {
      trackEvent("Claim Button Click");
      
      const giftLabel = properties.gift;
      let giftId = "Surprise";
      if (giftLabel === "Coffee Chat") giftId = "Coffee Chat";
      else if (giftLabel === "Personal Website") giftId = "Personal Website";
      else if (giftLabel === "PersonalOs Pro") giftId = "PersonalOs Pro";
      else if (giftLabel === "Resume Review") giftId = "Resume Review";
      else if (giftLabel === "Ui Audit" || giftLabel === "Ui UX Audit") giftId = "Ui Audit";

      const sessionId = getSessionId();
      fetch("/api/wheel-spins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, giftId })
      }).catch(err => console.error("Error updating claim:", err));
    }
  }).catch(err => console.error("Failed to load analytics module:", err));
};

export default function BirthdayPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Sector | null>(null);

  // Claim Form States
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimName, setClaimName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [websitePurpose, setWebsitePurpose] = useState("");
  const [websiteDesc, setWebsiteDesc] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleChooseSurpriseGift = (giftLabel: string) => {
    const selected = SECTORS.find(s => s.label === giftLabel);
    if (selected) {
      setWinningPrize(selected);
      logEvent("Gift Won", { gift: selected.label });
    }
  };

  const [forcePersonalOsProNext, setForcePersonalOsProNext] = useState(false);

  const handleChangeGiftClick = () => {
    setForcePersonalOsProNext(true);
    setWinningPrize(null);
    setShowResult(false);
    
    setClaimName("");
    setClaimEmail("");
    setWebsitePurpose("");
    setWebsiteDesc("");
    setResumeLink("");
    setProjectLink("");
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winningPrize) return;

    setSubmittingClaim(true);

    let notes = "";
    if (winningPrize.label === "Personal Website") {
      notes = `Purpose: ${websitePurpose}\nDescription:\n${websiteDesc}`;
    } else if (winningPrize.label === "Resume Review") {
      notes = `Resume Link: ${resumeLink}`;
    } else if (winningPrize.label === "Ui Audit") {
      notes = `Project Link: ${projectLink}`;
    }

    try {
      const { getSessionId } = await import("@/lib/analytics");
      const sessionId = getSessionId();

      const res = await fetch("/api/gift-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          giftId: winningPrize.label,
          gift: winningPrize.title,
          email: (winningPrize.label === "Personal Website" || winningPrize.label === "Ui Audit")
            ? claimEmail
            : "anonymous@personalos.com",
          name: (winningPrize.label === "Personal Website")
            ? claimName
            : "Anonymous",
          notes,
        }),
      });

      if (res.ok) {
        setClaimSubmitted(true);

        if (winningPrize.label === "Coffee Chat") {
          const waUrl = `https://wa.me/918086199683?text=${encodeURIComponent(
            `Hi Faiz, I won the 1-on-1 Coffee Chat reward! send me the location🥰).`
          )}`;
          window.open(waUrl, "_blank");
        } else if (winningPrize.label === "PersonalOs Pro") {
          window.open("https://personalos.faizrahim.online/", "_blank");
        }

        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to submit claim:", err);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get("test_birthday") === "true";
    const testGift = params.get("test_gift");

    // Show popup only between Aug 9 9:00 PM and Aug 10 11:59 PM (local time)
    const now = new Date();
    const year = now.getFullYear();
    const startDate = new Date(year, 7, 9, 21, 0, 0); // August is month 7 (0-indexed)
    const endDate = new Date(year, 7, 10, 23, 59, 59, 999);

    if (!forceShow && (now < startDate || now > endDate)) {
      return;
    }

    // Check if the user has already seen the popup in this session
    const hasSeen = sessionStorage.getItem("hasSeenBirthdayPopup");
    if (!hasSeen || forceShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        logEvent("Wheel Opened");

        if (testGift) {
          let mappedLabel = "";
          if (testGift === "PersonalOsPro") mappedLabel = "PersonalOs Pro";
          else if (testGift === "PersonalWebsite") mappedLabel = "Personal Website";
          else if (testGift === "ResumeReview") mappedLabel = "Resume Review";
          else if (testGift === "UiAudit") mappedLabel = "Ui Audit";
          else if (testGift === "CoffeeChat") mappedLabel = "Coffee Chat";
          else if (testGift === "Surprise") mappedLabel = "Surprise";

          if (mappedLabel) {
            const sector = SECTORS.find(s => s.label === mappedLabel);
            if (sector) {
              setWinningPrize(sector);
              setShowResult(true);
            }
          }
        }
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

    // Weighted random selection:
    // Index 0: Coffee Chat (4% chance - only before 3 PM)
    // Index 1: Personal Website (2% chance)
    // Index 2: PersonalOs Pro (80% or 84% chance depending on Coffee Chat availability)
    // Index 3: Resume Review (6% chance)
    // Index 4: Ui Audit (6% chance)
    // Index 5: Surprise (2% chance)
    const nowTime = new Date();
    const isBefore3PM = nowTime.getHours() < 15;
    const weights = [
      isBefore3PM ? 4 : 0,
      2,
      isBefore3PM ? 80 : 84,
      6,
      6,
      2
    ];
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomNum = Math.random() * totalWeight;

    let randomIndex = 0;
    if (forcePersonalOsProNext) {
      randomIndex = 2; // Index of PersonalOs Pro
      setForcePersonalOsProNext(false);
    } else {
      for (let i = 0; i < SECTORS.length; i++) {
        if (randomNum < weights[i]) {
          randomIndex = i;
          break;
        }
        randomNum -= weights[i];
      }
    }
    const prize = SECTORS[randomIndex];
    setWinningPrize(prize);

    // Calculate rotation:
    // Slices are 60 degrees each.
    // Index 0 is at 12 o'clock, index 1 is at 2 o'clock, etc.
    // Target rotation to put the index at the top pointer (-90 deg in relative circle coordinate):
    const sectorAngle = 60;
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
    // Sector 0 is centered at -90 degrees (12 o'clock), so it spans from -120 to -60 degrees.
    const theta1 = i * 60 - 120;
    const theta2 = i * 60 - 60;

    const rad1 = (theta1 * Math.PI) / 180;
    const rad2 = (theta2 * Math.PI) / 180;

    const x1 = cx + R * Math.cos(rad1);
    const y1 = cy + R * Math.sin(rad1);
    const x2 = cx + R * Math.cos(rad2);
    const y2 = cy + R * Math.sin(rad2);

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;

    // Text coordinates (at radius 60)
    const thetaMid = i * 60 - 90;
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
    if (label === "PersonalOs Pro") return ["PersonalOs", "Pro"];
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
          <div
            className={`birthday-popup-result ${showResult ? "is-visible" : ""}`}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "24px",
              boxSizing: "border-box",
              overflowY: "auto"
            }}
          >
            {claimSubmitted ? (
              <div className="birthday-success-msg">
                <span className="birthday-success-icon">✓</span>
                <h3 className="birthday-popup-result-title">Thank You!</h3>
                <p className="birthday-popup-result-desc">
                  Your claim has been submitted successfully.
                </p>
              </div>
            ) : winningPrize?.label === "Surprise" ? (
              <div style={{ width: "100%", textAlign: "center" }}>
                <h3 className="birthday-popup-result-title" style={{ fontSize: "20px" }}>Surprise Gift!</h3>
                <p className="birthday-popup-result-desc" style={{ fontSize: "13px", marginBottom: "16px" }}>
                  Choose any one of the gifts below:
                </p>
                <div className="birthday-surprise-list">
                  <button type="button" onClick={() => handleChooseSurpriseGift("PersonalOs Pro")} className="birthday-surprise-item">
                    PersonalOs Pro
                  </button>
                  <button type="button" onClick={() => handleChooseSurpriseGift("Personal Website")} className="birthday-surprise-item">
                    Personal Website
                  </button>
                  <button type="button" onClick={() => handleChooseSurpriseGift("Resume Review")} className="birthday-surprise-item">
                    Resume Review
                  </button>
                  <button type="button" onClick={() => handleChooseSurpriseGift("Ui Audit")} className="birthday-surprise-item">
                    Ui Audit
                  </button>
                  {/* Only before 3 PM */}
                  {(new Date().getHours() < 15) && (
                    <button type="button" onClick={() => handleChooseSurpriseGift("Coffee Chat")} className="birthday-surprise-item">
                      Coffee Chat
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} className="birthday-form">
                <h3 className="birthday-popup-result-title" style={{ fontSize: "18px", textAlign: "center", marginBottom: "4px" }}>
                  Congratulations!
                </h3>
                <p className="birthday-popup-result-desc" style={{ fontSize: "12px", textAlign: "center", marginBottom: "16px" }}>
                  You won: <strong style={{ color: "#9A7418" }}>{winningPrize?.title}</strong>
                </p>

                {winningPrize?.label === "Coffee Chat" && (
                  <p style={{ fontSize: "12px", color: "#414753", marginBottom: "8px", textAlign: "center", fontWeight: "600" }}>
                    Contact me I will send the location.
                  </p>
                )}

                {winningPrize?.label === "Personal Website" && (
                  <p style={{ fontSize: "11px", color: "#414753", marginBottom: "8px", textAlign: "center", lineHeight: "1.4" }}>
                    It is a single page website. You will get your website within 24 hrs.
                  </p>
                )}

                {winningPrize?.label === "Resume Review" && (
                  <p style={{ fontSize: "12px", color: "#414753", marginBottom: "8px", textAlign: "center", fontWeight: "600" }}>
                    Submit your resume link.
                  </p>
                )}

                {winningPrize?.label === "Ui Audit" && (
                  <p style={{ fontSize: "12px", color: "#414753", marginBottom: "8px", textAlign: "center", fontWeight: "600" }}>
                    Submit your project link for a UI/UX audit.
                  </p>
                )}

                {winningPrize?.label === "PersonalOs Pro" && (
                  <p style={{ fontSize: "12px", color: "#414753", marginBottom: "8px", textAlign: "center", lineHeight: "1.4", fontWeight: "600" }}>
                    You won PersonalOS App Pro access. Login to the app now, you will get Pro access shortly.
                  </p>
                )}

                {/* Change Gift Button at the top, just before form labels */}
                {(winningPrize?.label === "Personal Website" || winningPrize?.label === "Ui Audit") && (
                  <button
                    type="button"
                    onClick={handleChangeGiftClick}
                    className="birthday-popup-change-btn"
                    style={{ marginTop: "0px", marginBottom: "16px" }}
                  >
                    Change gift
                  </button>
                )}

                {winningPrize?.label === "Personal Website" && (
                  <div className="birthday-form-group">
                    <label className="birthday-form-label">Name</label>
                    <input
                      type="text"
                      required
                      value={claimName}
                      onChange={(e) => setClaimName(e.target.value)}
                      className="birthday-form-input"
                      placeholder="Your Name"
                    />
                  </div>
                )}

                {(winningPrize?.label === "Personal Website" || winningPrize?.label === "Ui Audit") && (
                  <div className="birthday-form-group">
                    <label className="birthday-form-label">Email</label>
                    <input
                      type="email"
                      required
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      className="birthday-form-input"
                      placeholder="name@example.com"
                    />
                  </div>
                )}

                {winningPrize?.label === "Personal Website" && (
                  <>
                    <div className="birthday-form-group">
                      <label className="birthday-form-label">Purpose of website</label>
                      <input
                        type="text"
                        required
                        value={websitePurpose}
                        onChange={(e) => setWebsitePurpose(e.target.value)}
                        className="birthday-form-input"
                        placeholder="e.g. Portfolio, Blog"
                      />
                    </div>

                    <div className="birthday-form-group">
                      <label className="birthday-form-label">Describe what you want</label>
                      <textarea
                        required
                        value={websiteDesc}
                        onChange={(e) => setWebsiteDesc(e.target.value)}
                        className="birthday-form-textarea"
                        placeholder="Describe sections, colors, content..."
                      />
                      <div className={`birthday-word-counter ${getWordCount(websiteDesc) >= 100 ? "valid" : "invalid"}`}>
                        {getWordCount(websiteDesc)} / 100 words min
                      </div>
                    </div>
                  </>
                )}

                {winningPrize?.label === "Resume Review" && (
                  <div className="birthday-form-group">
                    <label className="birthday-form-label">Resume Link</label>
                    <input
                      type="url"
                      required
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                      className="birthday-form-input"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                )}

                {winningPrize?.label === "Ui Audit" && (
                  <div className="birthday-form-group">
                    <label className="birthday-form-label">Link of project</label>
                    <input
                      type="url"
                      required
                      value={projectLink}
                      onChange={(e) => setProjectLink(e.target.value)}
                      className="birthday-form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submittingClaim ||
                    (winningPrize?.label === "Personal Website" && getWordCount(websiteDesc) < 100)
                  }
                  className="birthday-popup-btn"
                  style={{ marginTop: "12px" }}
                >
                  {submittingClaim
                    ? "Submitting..."
                    : winningPrize?.label === "Coffee Chat"
                    ? "Contact me"
                    : winningPrize?.label === "PersonalOs Pro"
                    ? "Go to PersonalOS"
                    : "Claim Gift"}
                </button>

                {/* Removed old change gift button from bottom */}
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
