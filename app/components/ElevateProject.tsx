"use client";

import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, RotateCcw, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

type Stage = "idle" | "playing" | "ended" | "posts_view";

type PostItem = {
  id: string;
  indexLabel: string;
  title: string;
  caption: string;
  src: string;
};

const ELEVATE_VIDEO_SRC = "/projects/elevate/ELEVATE VIDEO/Untitled design.mp4";

const ELEVATE_POSTS: PostItem[] = [
  {
    id: "elevate-post-1",
    indexLabel: "POST 01",
    title: "Elevate Solutions Brand & Campaign Showcase",
    caption: "Strategic corporate identity and visual storytelling creative.",
    src: "/projects/elevate/ELEVATE PICTURES/elevate pg 1.png",
  },
  {
    id: "elevate-post-2",
    indexLabel: "POST 02",
    title: "Elevate Solutions Editorial & Digital System",
    caption: "Structured visual system designed for clarity and impact.",
    src: "/projects/elevate/ELEVATE PICTURES/elevate pg 2.png",
  },
];

export default function ElevateProject() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<Stage>("idle");

  const [stage, setStage] = useState<Stage>("idle");
  const [videoError, setVideoError] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth <= 800);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const lockFirstFrame = () => {
      setVideoError(false);
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

    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 2) {
      lockFirstFrame();
    } else {
      video.addEventListener("loadeddata", lockFirstFrame, { once: true });
    }

    return () => {
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
    setActivePostIndex((activePostIndex - 1 + ELEVATE_POSTS.length) % ELEVATE_POSTS.length);
  };

  const handleNextPost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex + 1) % ELEVATE_POSTS.length);
  };

  const isPostsVisible = stage === "posts_view";
  const showStartInfo = stage === "idle" || isPostsVisible;

  return (
    <section
      id="elevate-solutions"
      className="showcase-section elevate-theme"
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="showcase-container">
        {showStartInfo && (
          <div className="showcase-header">
            <div className="showcase-meta">
              <span className="showcase-index">01 / ELEVATE SOLUTIONS</span>
              <h2 className="showcase-title">
                ELEVATE <em>SOLUTIONS</em>
              </h2>
              <p className="showcase-desc">
                Architectural identity, 3D visual storytelling, and structured brand presentation.
              </p>
            </div>
            <span className="showcase-status">
              {stage === "idle" && "TOUCH SCREEN TO PLAY"}
              {stage === "posts_view" && "CAMPAIGN POSTS"}
            </span>
          </div>
        )}

        <div className="showcase-stage">
          <video
            ref={videoRef}
            className={`showcase-video ${isPostsVisible ? "is-faded" : ""}`}
            muted
            playsInline
            preload={isMobile ? "auto" : "auto"}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          >
            <source src={ELEVATE_VIDEO_SRC} type="video/mp4" />
          </video>

          {videoError && !isPostsVisible && (
            <div className="video-missing-note">
              Video not found at <code>{ELEVATE_VIDEO_SRC}</code>. Check{" "}
              <code>public/projects/elevate/ELEVATE VIDEO/</code>.
            </div>
          )}

          {isPostsVisible && (
            <div
              className="elevate-posts-overlay"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="posts-inner">
                <div className="posts-header-row">
                  <div>
                    <p className="posts-kicker">CAMPAIGN &amp; IDENTITY CREATIVES</p>
                    <h3 className="posts-heading">
                      ELEVATE <span>SOLUTIONS</span> POSTS
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="posts-back-btn"
                    onClick={handleBackToScene}
                  >
                    <ArrowLeft size={14} />
                    <span>BACK TO SHOWCASE</span>
                  </button>
                </div>

                <div className="posts-grid">
                  {ELEVATE_POSTS.map((post, idx) => (
                    <article
                      key={post.id}
                      className="post-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePostIndex(idx);
                      }}
                    >
                      <div className="post-media">
                        {missingImages[post.id] ? (
                          <div className="post-fallback">
                            Image not found at <code>{post.src}</code>
                          </div>
                        ) : (
                          <img
                            src={post.src}
                            alt={post.title}
                            className="post-img"
                            onError={() =>
                              setMissingImages((prev) => ({ ...prev, [post.id]: true }))
                            }
                          />
                        )}
                      </div>
                      <div className="post-meta">
                        <span className="post-num">{post.indexLabel}</span>
                        <h4 className="post-title">{post.title}</h4>
                        <p className="post-caption">{post.caption}</p>
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
                      src={ELEVATE_POSTS[activePostIndex].src}
                      alt={ELEVATE_POSTS[activePostIndex].title}
                      className="lightbox-img"
                    />
                    <div className="lightbox-caption">
                      <span>{ELEVATE_POSTS[activePostIndex].indexLabel}</span>
                      <p>{ELEVATE_POSTS[activePostIndex].title}</p>
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
        </div>

        <div
          className="showcase-footer"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="showcase-posts-btn"
            onClick={handleOpenPosts}
          >
            <span>Click this icon to view the complete posts</span>
            <span className="showcase-icon-badge">
              <LayoutGrid size={16} strokeWidth={2.2} />
            </span>
          </button>

          <button
            type="button"
            className="showcase-replay-btn"
            onClick={handleReplay}
          >
            <RotateCcw size={14} strokeWidth={2.2} />
            <span>REPLAY SEQUENCE</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .showcase-section {
          position: relative;
          width: 100%;
          height: 100svh;
          padding: 0;
          background: #070b09;
          color: #e5ded5;
          overflow: hidden;
          touch-action: manipulation;
        }

        .elevate-theme {
          --accent: #d4af37;
          --accent-soft: rgba(212, 175, 55, 0.22);
          --accent-border: rgba(212, 175, 55, 0.55);
          --badge-ink: #0c100e;
        }

        .showcase-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .showcase-header {
          position: absolute;
          top: 24px;
          left: 28px;
          right: 28px;
          z-index: 12;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          pointer-events: none;
        }

        .showcase-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 660px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(7, 11, 9, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(229, 222, 213, 0.12);
        }

        .showcase-index {
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--accent);
          text-transform: uppercase;
          font-weight: 600;
        }

        .showcase-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 2.8vw, 38px);
          line-height: 1.08;
          font-weight: 400;
          color: #f3eee7;
        }

        .showcase-title em {
          color: var(--accent);
          font-style: italic;
        }

        .showcase-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(243, 238, 231, 0.88);
        }

        .showcase-status {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(7, 11, 9, 0.78);
          backdrop-filter: blur(8px);
          padding: 9px 15px;
          border: 1px solid var(--accent-border);
          border-radius: 999px;
          white-space: nowrap;
          font-weight: 600;
        }

        .showcase-stage {
          position: relative;
          width: 100%;
          height: 100%;
          background: #070b09;
          overflow: hidden;
          cursor: pointer;
          z-index: 1;
        }

        .showcase-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          filter: contrast(1.05) saturate(1.06);
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: opacity 0.35s ease;
        }

        .showcase-video.is-faded {
          opacity: 0.18;
        }

        .showcase-footer {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 24px;
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          pointer-events: none;
        }

        .showcase-posts-btn {
          pointer-events: auto;
          position: relative;
          z-index: 16;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 9px 13px 9px 16px;
          border-radius: 999px;
          border: 1px solid var(--accent-border);
          background: rgba(10, 15, 12, 0.86);
          backdrop-filter: blur(8px);
          color: #f3eee7;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          touch-action: manipulation;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-posts-btn:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .showcase-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--badge-ink);
          flex-shrink: 0;
        }

        .showcase-replay-btn {
          pointer-events: auto;
          position: relative;
          z-index: 16;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid var(--accent-border);
          background: rgba(10, 15, 12, 0.86);
          backdrop-filter: blur(8px);
          color: var(--accent);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          cursor: pointer;
          touch-action: manipulation;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-replay-btn:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        @media (max-width: 800px) {
          .showcase-section {
            height: auto;
            min-height: auto;
            display: block;
            padding: 64px 16px;
            background: #0d1310;
            border-top: 1px solid rgba(229, 222, 213, 0.08);
            overflow: visible;
          }

          .showcase-container {
            height: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .showcase-header {
            position: static;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            pointer-events: auto;
          }

          .showcase-meta {
            padding: 0;
            background: transparent;
            backdrop-filter: none;
            border: none;
          }

          .showcase-title {
            font-size: 28px;
            line-height: 1.05;
          }

          .showcase-desc {
            font-size: 13px;
            color: rgba(229, 222, 213, 0.72);
          }

          .showcase-status {
            background: transparent;
            backdrop-filter: none;
            color: var(--accent);
            border-color: rgba(212, 175, 55, 0.35);
            padding: 8px 12px;
          }

          .showcase-stage {
            height: auto;
            aspect-ratio: 16 / 9;
            border-radius: 10px;
            border: 1px solid rgba(229, 222, 213, 0.12);
          }

          .showcase-video {
            object-fit: contain;
          }

          .showcase-footer {
            position: static;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding-top: 2px;
            pointer-events: auto;
          }

          .showcase-posts-btn {
            width: 100%;
            justify-content: space-between;
            font-size: 12px;
            padding: 10px 12px 10px 16px;
            background: rgba(229, 222, 213, 0.06);
            backdrop-filter: none;
            border-color: var(--accent-border);
          }

          .showcase-replay-btn {
            width: 100%;
            justify-content: center;
            background: transparent;
            backdrop-filter: none;
            border-color: rgba(229, 222, 213, 0.22);
            color: #e5ded5;
          }
        }
      `}</style>
    </section>
  );
}