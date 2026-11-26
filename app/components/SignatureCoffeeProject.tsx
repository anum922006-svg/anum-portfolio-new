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

const VIDEO_SRC = "/projects/signature-coffee/Signature cofee video/Signature Coffee.mp4";

const COFFEE_POSTS: PostItem[] = [
  {
    id: "coffee-post-1",
    indexLabel: "POST 01",
    title: "Freshly Brewed & 20% Off Launch",
    caption: "Hero promotional post introducing Signature Coffee.",
    src: "/projects/signature-coffee/Signature coffee images/signature coffee pg 1.png",
  },
  {
    id: "coffee-post-2",
    indexLabel: "POST 02",
    title: "Menu Selections & Café Pricing",
    caption: "Full espresso classics, pour-overs, and bakery menu layout.",
    src: "/projects/signature-coffee/Signature coffee images/signature coffee pg 2.png",
  },
  {
    id: "coffee-post-3",
    indexLabel: "POST 03",
    title: "Specialty Brews & Single-Origin Beans",
    caption: "Pour-over showcase featuring Ethiopia Yirgacheffe & Guatemala Antigua.",
    src: "/projects/signature-coffee/Signature coffee images/signature coffee pg 3.png",
  },
];

export default function SignatureCoffeeProject() {
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
    setActivePostIndex((activePostIndex - 1 + COFFEE_POSTS.length) % COFFEE_POSTS.length);
  };

  const handleNextPost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex + 1) % COFFEE_POSTS.length);
  };

  const isPostsVisible = stage === "posts_view";

  return (
    <section
      id="signature-coffee"
      className="showcase-section"
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="showcase-container">
        <div className="showcase-header">
          <div className="showcase-meta">
            <span className="showcase-index">02 / SIGNATURE COFFEE</span>
            <h2 className="showcase-title">
              SIGNATURE <em>COFFEE</em>
            </h2>
            <p className="showcase-desc">
              Specialty café identity, menu system, and interactive campaign showcase.
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
            src={VIDEO_SRC}
            muted
            playsInline
            preload={isMobile ? "auto" : "auto"}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          />

          {videoError && !isPostsVisible && (
            <div className="video-missing-note">
              Video not found at <code>{VIDEO_SRC}</code>. Check{" "}
              <code>public/projects/signature-coffee/Signature cofee video/</code>.
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
                    <p className="posts-kicker">CAMPAIGN &amp; MENU CREATIVES</p>
                    <h3 className="posts-heading">
                      SIGNATURE <span>COFFEE</span> POSTS
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
                  {COFFEE_POSTS.map((post, idx) => (
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
                      src={COFFEE_POSTS[activePostIndex].src}
                      alt={COFFEE_POSTS[activePostIndex].title}
                      className="lightbox-img"
                    />
                    <div className="lightbox-caption">
                      <span>{COFFEE_POSTS[activePostIndex].indexLabel}</span>
                      <p>{COFFEE_POSTS[activePostIndex].title}</p>
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
          position: relative;
          width: 100%;
          height: 100svh;
          padding: 0;
          background: #070b09;
          color: #e5ded5;
          overflow: hidden;
          touch-action: manipulation;
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
          z-index: 4;
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
          max-width: 640px;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.75);
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
          font-size: clamp(24px, 2.8vw, 38px);
          line-height: 1.08;
          font-weight: 400;
          color: #e5ded5;
        }

        .showcase-title em {
          color: #9e8651;
          font-style: italic;
        }

        .showcase-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(229, 222, 213, 0.85);
        }

        .showcase-status {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #e5ded5;
          background: rgba(13, 19, 16, 0.72);
          backdrop-filter: blur(8px);
          padding: 8px 14px;
          border: 1px solid rgba(158, 134, 81, 0.45);
          border-radius: 999px;
          white-space: nowrap;
        }

        .showcase-stage {
          position: relative;
          width: 100%;
          height: 100%;
          background: #070b09;
          overflow: hidden;
          cursor: pointer;
        }

        .showcase-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: opacity 0.35s ease;
        }

        .showcase-video.is-faded {
          opacity: 0.2;
        }

        .showcase-footer {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 24px;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .showcase-posts-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 9px 13px 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.24);
          background: rgba(13, 19, 16, 0.78);
          backdrop-filter: blur(8px);
          color: #e5ded5;
          font-size: 12px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .showcase-posts-btn:hover {
          border-color: #9e8651;
          background: rgba(158, 134, 81, 0.22);
        }

        .showcase-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #9e8651;
          color: #111815;
          flex-shrink: 0;
        }

        .showcase-replay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.24);
          background: rgba(13, 19, 16, 0.78);
          backdrop-filter: blur(8px);
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
            text-shadow: none;
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
            color: #9e8651;
            border-color: rgba(158, 134, 81, 0.35);
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
          }

          .showcase-posts-btn {
            width: 100%;
            justify-content: space-between;
            font-size: 12px;
            padding: 10px 12px 10px 16px;
            background: rgba(229, 222, 213, 0.05);
            backdrop-filter: none;
            border-color: rgba(229, 222, 213, 0.18);
          }

          .showcase-replay-btn {
            width: 100%;
            justify-content: center;
            background: transparent;
            backdrop-filter: none;
            border-color: rgba(229, 222, 213, 0.16);
          }
        }
      `}</style>
    </section>
  );
}