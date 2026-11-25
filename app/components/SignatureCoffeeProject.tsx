"use client";

import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, RotateCcw, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

type Stage = "idle" | "playing" | "description_hold" | "posts_view";

type PostItem = {
  id: string;
  indexLabel: string;
  title: string;
  caption: string;
  src: string;
};

const DESCRIPTION_REVEAL_TIME = 13.5;
const VIDEO_SRC = "/projects/signature-coffee/Signature cofee video/Signature Coffee video.mp4";

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
    title: "Specialty Brews & Single-Origin Beans",
    caption: "Pour-over showcase featuring Ethiopia Yirgacheffe & Guatemala Antigua.",
    src: "/projects/signature-coffee/Signature coffee images/signature coffee pg 2.png",
  },
  {
    id: "coffee-post-3",
    indexLabel: "POST 03",
    title: "Menu Selections & Café Pricing",
    caption: "Full espresso classics, pour-overs, and bakery menu layout.",
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
      video.pause();
      video.currentTime = 0.05;
    };

    const handleError = () => setVideoError(true);

    const triggerDescriptionHold = () => {
      if (stageRef.current !== "playing") return;
      video.pause();
      setStage("description_hold");
    };

    const handleTimeUpdate = () => {
      if (stageRef.current !== "playing") return;
      const targetTime =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(DESCRIPTION_REVEAL_TIME, video.duration - 0.05)
          : DESCRIPTION_REVEAL_TIME;

      if (video.currentTime >= targetTime) {
        triggerDescriptionHold();
      }
    };

    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", triggerDescriptionHold);

    if (video.readyState >= 2) {
      lockFirstFrame();
    } else {
      video.addEventListener("loadeddata", lockFirstFrame, { once: true });
    }

    return () => {
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", triggerDescriptionHold);
    };
  }, []);

  const handleStart = () => {
    if (stage !== "idle") return;
    const video = videoRef.current;
    if (!video) return;

    setStage("playing");
    video.muted = true;
    video.play().catch(() => {});
  };

  const handleReplay = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    setVideoError(false);
    setActivePostIndex(null);
    video.pause();
    video.currentTime = 0.05;
    setStage("idle");
  };

  const handleOpenPosts = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStage("posts_view");
  };

  const handleBackToOverview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePostIndex(null);
    setStage("description_hold");
  };

  const handlePrevPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex - 1 + COFFEE_POSTS.length) % COFFEE_POSTS.length);
  };

  const handleNextPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex + 1) % COFFEE_POSTS.length);
  };

  const isDescriptionVisible = stage === "description_hold";
  const isPostsVisible = stage === "posts_view";

  return (
    <section
      id="signature-coffee"
      className="elevate-experience coffee-experience"
      onPointerDown={handleStart}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="elevate-media-frame">
        <video
          ref={videoRef}
          className={`elevate-video ${
            isDescriptionVisible ? "is-dimmed" : isPostsVisible ? "is-faded" : ""
          }`}
          src={VIDEO_SRC}
          muted
          playsInline
          preload={isMobile ? "metadata" : "auto"}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />
      </div>

      {videoError && !isDescriptionVisible && !isPostsVisible && (
        <div className="video-missing-note">
          Video not found at <code>{VIDEO_SRC}</code>. Check the file inside{" "}
          <code>public/projects/signature-coffee/Signature cofee video/</code>.
        </div>
      )}

      <div
        className={`elevate-campaign-screen ${isDescriptionVisible ? "is-visible" : ""}`}
        aria-hidden={!isDescriptionVisible}
      >
        <div className="campaign-center">
          <p className="prompt-kicker" style={{ marginBottom: "16px" }}>
            COFFEE SHOP • EST. 2023 • COFFEE &amp; GOOD VIBES
          </p>

          <h2 className="campaign-title">
            SIGNATURE <span>COFFEE</span>
          </h2>
          <p className="campaign-subtitle">INTERACTIVE CAFÉ &amp; MENU EXPERIENCE</p>
          <p className="campaign-body">
            Artisanal roasting, single-origin pour-overs, and warm hospitality
            brought together in a tactile digital showcase.
          </p>
        </div>
      </div>

      {isPostsVisible && (
        <div
          className="elevate-posts-overlay"
          onPointerDown={(e) => e.stopPropagation()}
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
                onClick={handleBackToOverview}
              >
                <ArrowLeft size={14} />
                <span>BACK TO OVERVIEW</span>
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
        className={`elevate-vignette ${
          isDescriptionVisible || isPostsVisible ? "is-hidden" : ""
        }`}
      />

      <div className="elevate-top-bar">
        <span className="elevate-num">02 / SIGNATURE COFFEE</span>
        <span className="elevate-status">
          {stage === "idle" && "AWAITING INTERACTION"}
          {stage === "playing" && "CAFÉ SHOWCASE"}
          {stage === "description_hold" && "CAMPAIGN OVERVIEW"}
          {stage === "posts_view" && "CAMPAIGN POSTS"}
        </span>
      </div>

      <div className={`elevate-prompt ${stage === "idle" ? "is-visible" : ""}`}>
        <p className="prompt-kicker">
          BRAND IDENTITY, MENU SYSTEM &amp; INTERACTIVE SHOWCASE
        </p>
        <h2 className="prompt-headline">
          SIGNATURE <em>COFFEE.</em>
        </h2>
        <div className="touch-pill">
          <span className="pulse-dot" />
          <span>TOUCH ANYWHERE TO BEGIN THE EXPERIENCE</span>
        </div>
      </div>

      <div
        className={`elevate-side-dock ${isDescriptionVisible ? "is-visible" : ""}`}
        onPointerDown={(e) => e.stopPropagation()}
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
    </section>
  );
}