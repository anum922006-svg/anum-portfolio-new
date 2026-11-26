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

  return (
    <section
      id="elevate-solutions"
      className="showcase-section"
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="showcase-container">
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
            {stage === "idle" && "TAP VIDEO TO PLAY"}
            {stage === "playing" && "NOW PLAYING"}
            {stage === "ended" && "SEQUENCE COMPLETE"}
            {stage === "posts_view" && "CAMPAIGN POSTS"}
          </span>
        </div>

        <div className="showcase-stage">
          <video
            ref={videoRef}
            className={`showcase-video ${isPostsVisible ? "is-faded" : ""}`}
            src={ELEVATE_VIDEO_SRC}
            muted
            playsInline
            preload={isMobile ? "auto" : "auto"}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          />

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
                      onClick={() => setActivePostIndex(idx)}
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
                  onClick={() => setActivePostIndex(null)}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    type="button"
                    className="lightbox-close"
                    onClick={() => setActivePostIndex(null)}
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
        >
          <button
            type="button"
            className="showcase-posts-btn"
            onClick={handleOpenPosts}
          >
            <span>Click this icon to view the complete posts</span>
            <span className="showcase-icon-badge">
              <LayoutGrid size={16} strokeWidth={1.9} />
            </span>
          </button>

          <button
            type="button"
            className="showcase-replay-btn"
            onClick={handleReplay}
          >
            <RotateCcw size={13} />
            <span>REPLAY SEQUENCE</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .showcase-section {
          width: 100%;
          min-height: 100svh;
          padding: 48px 4vw;
          background: #0d1310;
          color: #e5ded5;
          border-top: 1px solid rgba(229, 222, 213, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          touch-action: manipulation;
        }

        .showcase-container {
          width: 100%;
          max-width: 1560px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .showcase-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .showcase-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 760px;
        }

        .showcase-index {
          font-size: 11px;
          letter-spacing: 0.22em;
          color: #9e8651;
          text-transform: uppercase;
        }

        .showcase-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 3vw, 40px);
          line-height: 1.12;
          font-weight: 400;
          color: #e5ded5;
        }

        .showcase-title em {
          color: #9e8651;
          font-style: italic;
        }

        .showcase-desc {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(229, 222, 213, 0.72);
        }

        .showcase-status {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9e8651;
          padding: 8px 14px;
          border: 1px solid rgba(158, 134, 81, 0.35);
          border-radius: 999px;
          white-space: nowrap;
        }

        .showcase-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 68svh;
          margin: 0 auto;
          background: #070b09;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(229, 222, 213, 0.12);
          cursor: pointer;
        }

        .showcase-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: opacity 0.35s ease;
        }

        .showcase-video.is-faded {
          opacity: 0.2;
        }

        .showcase-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 2px;
          flex-wrap: wrap;
        }

        .showcase-posts-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px 10px 18px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.18);
          background: rgba(229, 222, 213, 0.05);
          color: #e5ded5;
          font-size: 12px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-posts-btn:hover {
          border-color: #9e8651;
          background: rgba(158, 134, 81, 0.12);
        }

        .showcase-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #9e8651;
          color: #111815;
          flex-shrink: 0;
        }

        .showcase-replay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.16);
          background: transparent;
          color: #e5ded5;
          font-size: 11px;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .showcase-replay-btn:hover {
          border-color: #9e8651;
          color: #9e8651;
        }

        @media (max-width: 800px) {
          .showcase-section {
            min-height: auto;
            display: block;
            padding: 64px 16px;
          }

          .showcase-container {
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
            height: auto;
            max-height: none;
            aspect-ratio: 16 / 9;
            border-radius: 10px;
          }

          .showcase-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .showcase-posts-btn {
            width: 100%;
            justify-content: space-between;
            font-size: 12px;
            padding: 10px 12px 10px 16px;
          }

          .showcase-replay-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}