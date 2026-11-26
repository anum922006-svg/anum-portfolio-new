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
  const showControls = stage === "ended" || stage === "playing";

  return (
    <section
      id="elevate-solutions"
      className="elevate-experience elevate-framed-experience"
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="elevate-media-frame elevate-framed-media">
        <video
          ref={videoRef}
          className={`elevate-video elevate-framed-video ${isPostsVisible ? "is-faded" : ""}`}
          src={ELEVATE_VIDEO_SRC}
          muted
          playsInline
          preload={isMobile ? "auto" : "auto"}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />
      </div>

      {videoError && !isPostsVisible && (
        <div className="video-missing-note">
          Video not found at <code>{ELEVATE_VIDEO_SRC}</code>. Check the file inside{" "}
          <code>public/projects/elevate/ELEVATE VIDEO/</code>[cite: 9].
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
                <h2 className="posts-heading">
                  ELEVATE <span>SOLUTIONS</span> POSTS
                </h2>
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
                    <h3 className="post-title">{post.title}</h3>
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

      <div
        className={`elevate-vignette ${isPostsVisible ? "is-hidden" : ""}`}
      />

      <div className="elevate-top-bar">
        <span className="elevate-num">01 / ELEVATE SOLUTIONS</span>
        <span className="elevate-status">
          {stage === "idle" && "TAP TO PLAY"}
          {stage === "playing" && "IDENTITY SHOWCASE"}
          {stage === "ended" && "SHOWCASE COMPLETE"}
          {stage === "posts_view" && "CAMPAIGN POSTS"}
        </span>
      </div>

      <div
        className={`elevate-side-dock ${showControls && !isPostsVisible ? "is-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="posts-link"
          onClick={handleOpenPosts}
          aria-label="Click this icon to view the complete posts"
        >
          <span className="posts-copy">
            Click this icon to view the complete posts
          </span>
          <span className="posts-icon">
            <LayoutGrid size={18} strokeWidth={1.9} />
          </span>
        </button>

        <button
          type="button"
          className="replay-btn"
          onClick={handleReplay}
        >
          <RotateCcw size={12} />
          <span>REPLAY SEQUENCE</span>
        </button>
      </div>

      <style jsx>{`
        .elevate-framed-experience {
          position: relative;
          width: 100%;
          min-height: 100svh;
          background: #0d1310;
          cursor: pointer;
          touch-action: manipulation;
          overflow: hidden;
        }

        .elevate-framed-media {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d1310;
          padding: 24px;
        }

        .elevate-framed-video {
          width: 100%;
          max-width: 1280px;
          max-height: 88svh;
          aspect-ratio: 16 / 9;
          object-fit: contain;
          border-radius: 12px;
          image-rendering: auto;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition: opacity 0.45s ease, filter 0.45s ease;
        }

        @media (max-width: 800px) {
          .elevate-framed-experience {
            min-height: auto;
          }

          .elevate-framed-media {
            min-height: auto;
            padding: 68px 14px 36px;
          }

          .elevate-framed-video {
            width: 100%;
            max-width: 100%;
            height: auto;
            max-height: 68svh;
            aspect-ratio: 16 / 9;
            object-fit: contain;
            border-radius: 10px;
          }
        }
      `}</style>
    </section>
  );
}