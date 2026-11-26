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
  const showControls = stage === "ended" || stage === "playing";

  return (
    <section
      id="signature-coffee"
      className="elevate-experience coffee-experience"
      onClick={handleStageTap}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="elevate-media-frame coffee-media-frame">
        <video
          ref={videoRef}
          className={`elevate-video coffee-video ${isPostsVisible ? "is-faded" : ""}`}
          src={VIDEO_SRC}
          muted
          playsInline
          preload={isMobile ? "auto" : "auto"}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />
      </div>

      {videoError && !isPostsVisible && (
        <div className="video-missing-note">
          Video not found at <code>{VIDEO_SRC}</code>. Check the file inside{" "}
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
                <h2 className="posts-heading">
                  SIGNATURE <span>COFFEE</span> POSTS
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

      <div
        className={`elevate-vignette ${isPostsVisible ? "is-hidden" : ""}`}
      />

      <div className="elevate-top-bar">
        <span className="elevate-num">02 / SIGNATURE COFFEE</span>
        <span className="elevate-status">
          {stage === "idle" && "TAP TO PLAY"}
          {stage === "playing" && "CAFÉ SHOWCASE"}
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
        .coffee-experience {
          position: relative;
          width: 100%;
          min-height: 100svh;
          background: #0d1310;
          cursor: pointer;
          touch-action: manipulation;
          overflow: hidden;
        }

        .coffee-media-frame {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d1310;
          padding: 24px;
        }

        .coffee-video {
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
          .coffee-experience {
            min-height: auto;
          }

          .coffee-media-frame {
            min-height: auto;
            padding: 68px 14px 36px;
          }

          .coffee-video {
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