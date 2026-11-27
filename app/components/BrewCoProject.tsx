"use client";

import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, RotateCcw, ArrowLeft, X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

type Stage = "idle" | "playing" | "ended" | "posts_view";

type PostItem = {
  id: string;
  indexLabel: string;
  title: string;
  caption: string;
  src: string;
};

const BREW_VIDEO_SRC = "/projects/brew-co/Brew and co video/BREW AND CO.mp4";

const BREW_POSTS: PostItem[] = [
  {
    id: "brew-post-1",
    indexLabel: "POST 01",
    title: "Your Coffee Break Just Got Better",
    caption: "Hero launch post introducing Brew & Co. Coffee House.",
    src: "/projects/brew-co/Brew and co pics/brew & co pg 1.png",
  },
  {
    id: "brew-post-2",
    indexLabel: "POST 02",
    title: "Today's Pick — Butter Croissant",
    caption: "Artisanal bakery spotlight baked fresh daily.",
    src: "/projects/brew-co/Brew and co pics/brew & co pg 2.png",
  },
  {
    id: "brew-post-3",
    indexLabel: "POST 03",
    title: "Loved by Our Customers",
    caption: "Client testimonial card highlighting café atmosphere and craft.",
    src: "/projects/brew-co/Brew and co pics/brew & co pg 3.png",
  },
  {
    id: "brew-post-4",
    indexLabel: "POST 04",
    title: "Weekend Special Offer — 20% Off",
    caption: "Promotional beverage campaign for Saturday & Sunday.",
    src: "/projects/brew-co/Brew and co pics/brew & co pg 4.png",
  },
  {
    id: "brew-post-5",
    indexLabel: "POST 05",
    title: "Come Say Hi! — Café Location & Hours",
    caption: "Storefront invitation with hours, location, and contact details.",
    src: "/projects/brew-co/Brew and co pics/brew & co pg 5.png",
  },
];

export default function BrewCoProject() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<Stage>("idle");

  const [stage, setStage] = useState<Stage>("idle");
  const [videoError, setVideoError] = useState(false);
  const [videoRatio, setVideoRatio] = useState<number>(16 / 9);
  const [shouldPreload, setShouldPreload] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Lazy-activate full video buffering only when section nears viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldPreload(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoRatio(video.videoWidth / video.videoHeight);
      }
    };

    const lockFirstFrame = () => {
      setVideoError(false);
      handleMetadata();
      try {
        video.pause();
        video.currentTime = 0.02;
      } catch {
        // Ignore seek error before metadata loads
      }
    };

    const handleError = () => setVideoError(true);

    const handleEnded = () => {
      if (stageRef.current === "posts_view") return;
      video.pause();
      setStage("ended");
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) {
      handleMetadata();
    }
    if (video.readyState >= 2) {
      lockFirstFrame();
    } else {
      video.addEventListener("loadeddata", lockFirstFrame, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadeddata", lockFirstFrame);
    };
  }, []);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (stageRef.current === "playing" || stageRef.current === "posts_view") return;

    setStage("playing");
    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setStage("idle");
      });
    }
  };

  const handleStageTap = () => {
    if (stageRef.current === "idle" || stageRef.current === "ended") {
      startPlayback();
    }
  };

  const handleReplay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    setVideoError(false);
    setActivePostIndex(null);
    video.pause();
    try {
      video.currentTime = 0.02;
    } catch {
      // Ignore seek error
    }
    setStage("idle");
  };

  const handleOpenPosts = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
    setStage("posts_view");
  };

  const handleBackToScene = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActivePostIndex(null);
    const video = videoRef.current;
    if (video && video.ended) {
      setStage("ended");
    } else {
      setStage("idle");
    }
  };

  const handlePrevPost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex - 1 + BREW_POSTS.length) % BREW_POSTS.length);
  };

  const handleNextPost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex + 1) % BREW_POSTS.length);
  };

  const isPostsVisible = stage === "posts_view";
  const showStartInfo = stage === "idle";
  const showReplay = stage === "ended";

  const frameDynamicStyle = {
    "--video-ratio": `${videoRatio}`,
  } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="brew-co"
      className="showcase-section"
      style={frameDynamicStyle}
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="showcase-container">
        {showStartInfo && (
          <div className="showcase-header">
            <div className="showcase-meta">
              <span className="showcase-index">03 / BREW &amp; CO.</span>
              <h2 className="showcase-title">
                BREW &amp; <em>CO.</em>
              </h2>
              <p className="showcase-desc">
                Welcoming artisanal coffee house identity, daily bakery highlights, and seasonal social campaign.
              </p>
            </div>
            <span className="showcase-status">TOUCH SCREEN TO PLAY</span>
          </div>
        )}

        <div className="showcase-stage">
          <video
            ref={videoRef}
            className={`showcase-video ${isPostsVisible ? "is-faded" : ""}`}
            muted
            playsInline
            preload={shouldPreload ? "auto" : "metadata"}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          >
            <source src={BREW_VIDEO_SRC} type="video/mp4" />
          </video>

          {videoError && !isPostsVisible && (
            <div className="video-missing-note">
              Video not found at <code>{BREW_VIDEO_SRC}</code>. Check{" "}
              <code>public/projects/brew-co/Brew and co video/</code>.
            </div>
          )}
        </div>

        <div
          className="showcase-footer"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="showcase-posts-btn"
            onClick={handleOpenPosts}
          >
            <span className="showcase-icon-badge">
              <LayoutGrid size={15} strokeWidth={1.9} />
            </span>
            <span className="showcase-posts-label">EXPLORE THE CAMPAIGN POSTS</span>
            <ArrowUpRight size={14} strokeWidth={1.9} className="showcase-posts-arrow" />
          </button>

          {showReplay && (
            <div className="showcase-ended-group">
              <span className="showcase-ended-note">Sequence complete</span>
              <button
                type="button"
                className="showcase-replay-btn"
                onClick={handleReplay}
              >
                <RotateCcw size={13} strokeWidth={1.8} />
                <span>REPLAY SEQUENCE</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isPostsVisible && (
        <div
          className="posts-modal-backdrop"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="posts-sheet">
            <div className="posts-sheet-top">
              <div className="posts-sheet-titles">
                <span className="posts-sheet-kicker">03 / BREW &amp; CO. ARCHIVE</span>
                <h3 className="posts-sheet-heading">
                  CAMPAIGN &amp; CAFÉ <em>POSTS</em>
                </h3>
              </div>
              <button
                type="button"
                className="posts-sheet-back"
                onClick={handleBackToScene}
              >
                <ArrowLeft size={14} />
                <span>BACK TO VIDEO</span>
              </button>
            </div>

            <div className="posts-cards-list">
              {BREW_POSTS.map((post, idx) => (
                <article
                  key={post.id}
                  className="editorial-post-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePostIndex(idx);
                  }}
                >
                  <div className="editorial-post-frame">
                    {missingImages[post.id] ? (
                      <div className="post-fallback">
                        Image not found at <code>{post.src}</code>
                      </div>
                    ) : (
                      <img
                        src={post.src}
                        alt={post.title}
                        className="editorial-post-img"
                        onError={() =>
                          setMissingImages((prev) => ({ ...prev, [post.id]: true }))
                        }
                      />
                    )}
                  </div>
                  <div className="editorial-post-body">
                    <div className="editorial-post-top">
                      <span className="editorial-post-num">{post.indexLabel}</span>
                      <span className="editorial-post-hint">TAP TO EXPAND</span>
                    </div>
                    <h4 className="editorial-post-title">{post.title}</h4>
                    <p className="editorial-post-caption">{post.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {activePostIndex !== null && (
            <div
              className="post-lightbox"
              onClick={(e) => {
                e.stopPropagation();
                setActivePostIndex(null);
              }}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="lightbox-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePostIndex(null);
                }}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                className="lightbox-nav prev"
                onClick={handlePrevPost}
                aria-label="Previous post"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                className="lightbox-content"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={BREW_POSTS[activePostIndex].src}
                  alt={BREW_POSTS[activePostIndex].title}
                  className="lightbox-img"
                />
                <div className="lightbox-caption">
                  <span>{BREW_POSTS[activePostIndex].indexLabel}</span>
                  <p>{BREW_POSTS[activePostIndex].title}</p>
                </div>
              </div>

              <button
                type="button"
                className="lightbox-nav next"
                onClick={handleNextPost}
                aria-label="Next post"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .showcase-section {
          position: relative;
          width: 100%;
          min-height: 100svh;
          padding: 48px 4vw;
          background: radial-gradient(
              circle at 76% 28%,
              rgba(198, 134, 82, 0.16),
              transparent 44%
            ),
            linear-gradient(155deg, #1b130e 0%, #271b14 54%, #150f0b 100%);
          color: #f7efe7;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          touch-action: manipulation;
        }

        .showcase-container {
          position: relative;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .showcase-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .showcase-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
          max-width: 680px;
        }

        .showcase-index {
          font-size: 11px;
          letter-spacing: 0.22em;
          color: #d79f6d;
          text-transform: uppercase;
        }

        .showcase-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 3vw, 40px);
          line-height: 1.08;
          font-weight: 400;
          color: #f7efe7;
        }

        .showcase-title em {
          color: #e8be96;
          font-style: italic;
        }

        .showcase-desc {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(247, 239, 231, 0.82);
        }

        .showcase-status {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f1e3d6;
          background: rgba(215, 159, 109, 0.08);
          padding: 8px 14px;
          border: 1px solid rgba(215, 159, 109, 0.24);
          border-radius: 999px;
          white-space: nowrap;
        }

        .showcase-stage {
          position: relative;
          width: 100%;
          max-width: min(100%, calc(74svh * var(--video-ratio, 1.7778)));
          aspect-ratio: var(--video-ratio, 16 / 9);
          margin: 0 auto;
          background: #100b08;
          border-radius: 14px;
          border: 1px solid rgba(215, 159, 109, 0.22);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          cursor: pointer;
          z-index: 1;
        }

        .showcase-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          object-position: center;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: opacity 0.35s ease;
        }

        .showcase-video.is-faded {
          opacity: 0.2;
        }

        .video-missing-note {
          position: absolute;
          inset: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 16px;
          background: rgba(16, 11, 8, 0.9);
          color: #f7efe7;
          font-size: 13px;
          border-radius: 10px;
        }

        .showcase-footer {
          position: relative;
          z-index: 30;
          width: 100%;
          max-width: min(100%, calc(74svh * var(--video-ratio, 1.7778)));
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .showcase-posts-btn {
          position: relative;
          z-index: 31;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          padding: 7px 16px 7px 8px;
          border-radius: 999px;
          border: 1px solid rgba(215, 159, 109, 0.48);
          background: rgba(215, 159, 109, 0.14);
          color: #f8f1ea;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          cursor: pointer;
          touch-action: manipulation;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-posts-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(215, 159, 109, 0.85);
          background: rgba(215, 159, 109, 0.22);
        }

        .showcase-posts-btn:active {
          transform: scale(0.98);
        }

        .showcase-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #d79f6d;
          color: #1b130e;
          flex-shrink: 0;
        }

        .showcase-posts-label {
          line-height: 1.2;
        }

        .showcase-posts-arrow {
          color: #d79f6d;
          flex-shrink: 0;
        }

        .showcase-ended-group {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .showcase-ended-note {
          font-size: 12px;
          color: rgba(247, 239, 231, 0.8);
        }

        .showcase-replay-btn {
          position: relative;
          z-index: 31;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 999px;
          border: 1px solid rgba(215, 159, 109, 0.28);
          background: transparent;
          color: #f7efe7;
          font-size: 11px;
          letter-spacing: 0.14em;
          cursor: pointer;
          touch-action: manipulation;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-replay-btn:hover {
          border-color: rgba(215, 159, 109, 0.55);
          background: rgba(215, 159, 109, 0.1);
        }

        .posts-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          overflow-y: auto;
          background: rgba(16, 11, 8, 0.96);
          padding: 28px 20px 56px;
        }

        .posts-sheet {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .posts-sheet-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(247, 239, 231, 0.12);
          flex-wrap: wrap;
        }

        .posts-sheet-titles {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .posts-sheet-kicker {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #d79f6d;
          text-transform: uppercase;
        }

        .posts-sheet-heading {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 400;
          color: #f7efe7;
        }

        .posts-sheet-heading em {
          color: #e8be96;
          font-style: italic;
        }

        .posts-sheet-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 999px;
          border: 1px solid rgba(247, 239, 231, 0.22);
          background: rgba(247, 239, 231, 0.06);
          color: #f7efe7;
          font-size: 11px;
          letter-spacing: 0.14em;
          cursor: pointer;
        }

        .posts-cards-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .editorial-post-card {
          background: #211711;
          border: 1px solid rgba(247, 239, 231, 0.12);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .editorial-post-card:hover {
          transform: translateY(-2px);
          border-color: rgba(215, 159, 109, 0.42);
        }

        .editorial-post-frame {
          background: #130d09;
          padding: 12px;
          border-bottom: 1px solid rgba(247, 239, 231, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .editorial-post-img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 10px;
        }

        .post-fallback {
          padding: 24px;
          font-size: 12px;
          color: rgba(247, 239, 231, 0.7);
          text-align: center;
        }

        .editorial-post-body {
          padding: 16px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .editorial-post-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .editorial-post-num {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #d79f6d;
        }

        .editorial-post-hint {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(247, 239, 231, 0.56);
        }

        .editorial-post-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-weight: 400;
          line-height: 1.3;
          color: #f7efe7;
        }

        .editorial-post-caption {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(247, 239, 231, 0.76);
        }

        .post-lightbox {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(11, 7, 5, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .lightbox-close {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 105;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(247, 239, 231, 0.25);
          background: rgba(33, 23, 17, 0.85);
          color: #f7efe7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .lightbox-nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 105;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(247, 239, 231, 0.25);
          background: rgba(33, 23, 17, 0.85);
          color: #f7efe7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .lightbox-nav.prev {
          left: 18px;
        }

        .lightbox-nav.next {
          right: 18px;
        }

        .lightbox-content {
          max-width: min(860px, 88vw);
          max-height: 86svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: calc(86svh - 54px);
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
        }

        .lightbox-caption {
          text-align: center;
        }

        .lightbox-caption span {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #d79f6d;
        }

        .lightbox-caption p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #f7efe7;
        }

        @media (max-width: 800px) {
          .showcase-section {
            min-height: auto;
            display: block;
            padding: 64px 16px;
            border-top: 1px solid rgba(215, 159, 109, 0.14);
            overflow: visible;
          }

          .showcase-container {
            max-width: 100%;
            gap: 16px;
          }

          .showcase-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .showcase-title {
            font-size: 28px;
            line-height: 1.05;
          }

          .showcase-desc {
            font-size: 13px;
          }

          .showcase-stage {
            max-width: 100%;
            width: 100%;
            height: auto;
            aspect-ratio: var(--video-ratio, 16 / 9);
            border-radius: 10px;
          }

          .showcase-footer {
            max-width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .showcase-posts-btn {
            width: 100%;
            justify-content: space-between;
            padding: 8px 14px 8px 8px;
          }

          .showcase-ended-group {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .showcase-replay-btn {
            width: 100%;
            justify-content: center;
          }

          .posts-modal-backdrop {
            padding: 20px 14px 48px;
          }

          .posts-cards-list {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}