"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, RotateCcw, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

type Stage = "idle" | "playing" | "description_hold" | "posts_view";

type PostItem = {
  id: string;
  indexLabel: string;
  title: string;
  caption: string;
  src: string;
};

const DESCRIPTION_REVEAL_TIME = 13.7;
const PLAYBACK_RATE = 1.0;
const VIDEO_SRC = "/projects/elevate/ELEVATE%20VIDEO/Untitled%20design.mp4";
const GENTLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ELEVATE_POSTS: PostItem[] = [
  {
    id: "post-1",
    indexLabel: "POST 01",
    title: "Corporate Identity & Architectural Vision",
    caption: "Campaign creative #1 from the Elevate Solutions series.",
    src: "/projects/elevate/ELEVATE%20PICTURES/elevate%20pg%201.png",
  },
  {
    id: "post-2",
    indexLabel: "POST 02",
    title: "Brand Trust & Strategic Presence",
    caption: "Campaign creative #2 from the Elevate Solutions series.",
    src: "/projects/elevate/ELEVATE%20PICTURES/elevate%20pg%202.png",
  },
];

export default function ElevateProject() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<Stage>("idle");

  const [stage, setStage] = useState<Stage>("idle");
  const [videoError, setVideoError] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});

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

    const handleError = () => {
      setVideoError(true);
    };

    const handleTimeUpdate = () => {
      if (stageRef.current !== "playing") return;
      if (video.currentTime >= DESCRIPTION_REVEAL_TIME || video.ended) {
        video.pause();
        setStage("description_hold");
      }
    };

    const handleEnded = () => {
      if (stageRef.current === "playing") {
        setStage("description_hold");
      }
    };

    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 2) {
      lockFirstFrame();
    } else {
      video.addEventListener("loadeddata", lockFirstFrame, { once: true });
    }

    return () => {
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleStart = () => {
    if (stage !== "idle") return;
    const video = videoRef.current;
    if (!video) return;

    setStage("playing");
    video.muted = true;
    video.playbackRate = PLAYBACK_RATE;
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
    setActivePostIndex((activePostIndex - 1 + ELEVATE_POSTS.length) % ELEVATE_POSTS.length);
  };

  const handleNextPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePostIndex === null) return;
    setActivePostIndex((activePostIndex + 1) % ELEVATE_POSTS.length);
  };

  return (
    <section
      id="elevate-solutions"
      className="elevate-experience"
      onPointerDown={handleStart}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        className={`elevate-video ${
          stage === "description_hold"
            ? "is-dimmed"
            : stage === "posts_view"
            ? "is-faded"
            : ""
        }`}
        src={VIDEO_SRC}
        muted
        playsInline
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
      />

      {videoError && stage !== "description_hold" && stage !== "posts_view" && (
        <div className="video-missing-note">
          Video not found at <code>{VIDEO_SRC}</code>. Check the filename inside{" "}
          <code>public/projects/elevate/ELEVATE VIDEO/</code>.
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === "description_hold" && (
          <motion.div
            key="elevate-description-hold"
            className="elevate-campaign-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: GENTLE_EASE }}
          >
            <div className="campaign-center">
              <motion.div
                className="campaign-brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 1.05, delay: 0.18, ease: GENTLE_EASE }}
              >
                <img
                  src="/projects/elevate/elevate_solutions_logo_extracted.png"
                  alt="Elevate Solutions Logo"
                  className="campaign-extracted-logo"
                  draggable={false}
                />
              </motion.div>

              <motion.h2
                className="campaign-title"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 1.1, delay: 0.3, ease: GENTLE_EASE }}
              >
                CORPORATE <span>BUSINESS</span>
              </motion.h2>

              <motion.p
                className="campaign-subtitle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 1.05, delay: 0.42, ease: GENTLE_EASE }}
              >
                SOCIAL MEDIA CAMPAIGN
              </motion.p>

              <motion.p
                className="campaign-body"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 1.1, delay: 0.54, ease: GENTLE_EASE }}
              >
                A strategic social media campaign designed to strengthen brand
                presence, build trust, and communicate value.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "posts_view" && (
          <motion.div
            key="elevate-posts-overlay"
            className="elevate-posts-overlay"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.55, ease: GENTLE_EASE }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="posts-inner">
              <div className="posts-header-row">
                <div>
                  <p className="posts-kicker">CAMPAIGN CREATIVES</p>
                  <h2 className="posts-heading">
                    CORPORATE <span>BUSINESS</span> POSTS
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
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`elevate-vignette ${
          stage === "description_hold" || stage === "posts_view" ? "is-hidden" : ""
        }`}
      />

      <div className="elevate-top-bar">
        <span className="elevate-num">01 / ELEVATE SOLUTIONS</span>
        <span className="elevate-status">
          {stage === "idle" && "AWAITING INTERACTION"}
          {stage === "playing" && "ARCHITECTURAL SHOWCASE"}
          {stage === "description_hold" && "CAMPAIGN OVERVIEW"}
          {stage === "posts_view" && "CAMPAIGN POSTS"}
        </span>
      </div>

      <AnimatePresence>
        {stage === "idle" && (
          <motion.div
            key="prompt-idle"
            className="elevate-prompt"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: GENTLE_EASE }}
          >
            <p className="prompt-kicker">
              3D ARCHITECTURAL VISUALIZATION &amp; BRAND CAMPAIGN
            </p>
            <h2 className="prompt-headline">
              ELEVATE <em>SOLUTIONS.</em>
            </h2>
            <div className="touch-pill">
              <span className="pulse-dot" />
              <span>TOUCH ANYWHERE TO BEGIN THE EXPERIENCE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "description_hold" && (
          <motion.div
            key="elevate-side-dock"
            className="elevate-side-dock"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{
              duration: 1.05,
              delay: 0.62,
              ease: GENTLE_EASE,
            }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .elevate-experience {
          color-scheme: light;
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 100svh;
          overflow: hidden;
          background: #111815;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        }

        .elevate-experience .elevate-video {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          pointer-events: none;
          opacity: 1;
          will-change: opacity;
          transition: opacity 1.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .elevate-experience .elevate-video.is-dimmed {
          z-index: 4;
          opacity: 0.38;
        }

        .elevate-experience .elevate-video.is-faded {
          opacity: 0;
        }

        .elevate-experience .video-missing-note {
          position: relative;
          z-index: 15;
          max-width: 560px;
          margin: 0 24px;
          padding: 16px 20px;
          border-radius: 10px;
          border: 1px solid rgba(201, 173, 106, 0.45);
          background: rgba(17, 24, 21, 0.92);
          color: #e5ded5;
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }

        .elevate-experience .elevate-campaign-screen {
          position: absolute;
          inset: 0;
          z-index: 8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 7vw;
          background: radial-gradient(
            circle at 50% 42%,
            rgba(20, 34, 28, 0.46) 0%,
            rgba(17, 24, 21, 0.64) 56%,
            rgba(13, 19, 16, 0.78) 100%
          );
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          will-change: opacity;
          -webkit-font-smoothing: antialiased;
        }

        .elevate-experience .campaign-center {
          position: relative;
          z-index: 2;
          max-width: 820px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-shadow: 0 2px 18px rgba(10, 15, 13, 0.72);
        }

        .elevate-experience .campaign-brand,
        .elevate-experience .campaign-title,
        .elevate-experience .campaign-subtitle,
        .elevate-experience .campaign-body {
          will-change: transform, opacity;
        }

        .elevate-experience .campaign-brand {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .elevate-experience .campaign-extracted-logo {
          width: clamp(145px, 16vw, 215px);
          height: auto;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }

        .elevate-experience .campaign-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 5.4vw, 76px);
          font-weight: 400;
          letter-spacing: 0.04em;
          line-height: 1.04;
          color: #e5ded5;
        }

        .elevate-experience .campaign-title span {
          color: #c9ad6a;
        }

        .elevate-experience .campaign-subtitle {
          margin: 18px 0 36px;
          font-size: clamp(13px, 1.4vw, 18px);
          letter-spacing: 0.34em;
          color: rgba(229, 222, 213, 0.94);
        }

        .elevate-experience .campaign-body {
          margin: 0 auto;
          max-width: 560px;
          font-size: clamp(15px, 1.35vw, 19px);
          line-height: 1.75;
          color: rgba(229, 222, 213, 0.88);
        }

        .elevate-experience .elevate-posts-overlay {
          position: absolute;
          inset: 0;
          z-index: 18;
          overflow-y: auto;
          padding: 74px 5vw 48px;
          background: radial-gradient(
              circle at 50% 15%,
              rgba(36, 62, 51, 0.55) 0%,
              rgba(17, 24, 21, 0.96) 55%,
              #0e1411 100%
            ),
            #111815;
          will-change: transform, opacity;
          cursor: default;
        }

        .elevate-experience .posts-inner {
          max-width: 980px;
          margin: 0 auto;
        }

        .elevate-experience .posts-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .elevate-experience .posts-kicker {
          margin: 0 0 8px;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #c9ad6a;
        }

        .elevate-experience .posts-heading {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 3.8vw, 48px);
          font-weight: 400;
          color: #e5ded5;
        }

        .elevate-experience .posts-heading span {
          color: #c9ad6a;
        }

        .elevate-experience .posts-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.28);
          background: rgba(17, 24, 21, 0.88);
          color: #e5ded5;
          font-size: 10px;
          letter-spacing: 0.18em;
          cursor: pointer;
        }

        .elevate-experience .posts-back-btn:hover {
          border-color: #c9ad6a;
          color: #c9ad6a;
        }

        .elevate-experience .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          align-items: start;
        }

        .elevate-experience .post-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(158, 134, 81, 0.35);
          background: rgba(17, 24, 21, 0.9);
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .elevate-experience .post-card:hover {
          transform: translateY(-4px);
          border-color: #c9ad6a;
        }

        .elevate-experience .post-media {
          width: 100%;
          background: #0e1411;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .elevate-experience .post-img {
          width: 100%;
          height: auto;
          display: block;
        }

        .elevate-experience .post-fallback {
          padding: 18px;
          font-size: 12px;
          color: rgba(229, 222, 213, 0.72);
          text-align: center;
        }

        .elevate-experience .post-meta {
          padding: 16px 18px 20px;
        }

        .elevate-experience .post-num {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #c9ad6a;
          margin-bottom: 5px;
        }

        .elevate-experience .post-title {
          margin: 0 0 5px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-weight: 400;
          color: #e5ded5;
        }

        .elevate-experience .post-caption {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(229, 222, 213, 0.72);
        }

        .elevate-experience .post-lightbox {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(10, 15, 13, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .elevate-experience .lightbox-content {
          max-width: min(88vw, 720px);
          max-height: 86vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .elevate-experience .lightbox-img {
          max-width: 100%;
          max-height: 74vh;
          object-fit: contain;
          border-radius: 10px;
        }

        .elevate-experience .lightbox-caption {
          text-align: center;
        }

        .elevate-experience .lightbox-caption span {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #c9ad6a;
        }

        .elevate-experience .lightbox-caption p {
          margin: 4px 0 0;
          font-size: 14px;
          color: #e5ded5;
        }

        .elevate-experience .lightbox-close {
          position: fixed;
          top: 22px;
          right: 24px;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.28);
          background: rgba(17, 24, 21, 0.88);
          color: #e5ded5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .elevate-experience .lightbox-nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(229, 222, 213, 0.28);
          background: rgba(17, 24, 21, 0.88);
          color: #e5ded5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .elevate-experience .lightbox-nav.prev {
          left: 20px;
        }

        .elevate-experience .lightbox-nav.next {
          right: 20px;
        }

        .elevate-experience .elevate-vignette {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(17, 24, 21, 0.42) 0%,
            rgba(17, 24, 21, 0) 22%,
            rgba(17, 24, 21, 0) 76%,
            rgba(17, 24, 21, 0.58) 100%
          );
          transition: opacity 0.6s ease;
        }

        .elevate-experience .elevate-vignette.is-hidden {
          opacity: 0;
        }

        .elevate-experience .elevate-top-bar {
          position: absolute;
          top: 28px;
          left: 5vw;
          right: 5vw;
          z-index: 22;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          letter-spacing: 0.24em;
          pointer-events: none;
        }

        .elevate-experience .elevate-num {
          color: #9e8651;
          font-weight: 700;
        }

        .elevate-experience .elevate-status {
          color: rgba(229, 222, 213, 0.78);
        }

        .elevate-experience .elevate-prompt {
          position: absolute;
          left: 5vw;
          bottom: 9vh;
          z-index: 12;
          max-width: 620px;
          pointer-events: none;
        }

        .elevate-experience .prompt-kicker {
          margin: 0 0 10px;
          font-size: 10px;
          letter-spacing: 0.26em;
          color: #9e8651;
        }

        .elevate-experience .prompt-headline {
          margin: 0 0 22px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 5.5vw, 82px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          font-weight: 400;
          color: #e5ded5;
        }

        .elevate-experience .prompt-headline em {
          color: #9e8651;
          font-style: italic;
        }

        .elevate-experience .touch-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border: 1px solid rgba(229, 222, 213, 0.32);
          background: rgba(17, 24, 21, 0.82);
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #e5ded5;
        }

        .elevate-experience .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9e8651;
          box-shadow: 0 0 10px #9e8651;
          animation: elevatePulseGlow 1.8s ease-in-out infinite;
        }

        .elevate-experience .elevate-side-dock {
          position: absolute;
          right: 4vw;
          bottom: 6vh;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          will-change: transform, opacity;
        }

        .elevate-experience .posts-link {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px 10px 18px;
          border-radius: 12px;
          border: 1px solid rgba(158, 134, 81, 0.55);
          background: rgba(17, 24, 21, 0.9);
          color: #e5ded5;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .elevate-experience .posts-link:hover {
          transform: translateX(-4px);
          border-color: #e5ded5;
        }

        .elevate-experience .posts-copy {
          max-width: 175px;
          font-size: 11px;
          line-height: 1.4;
          text-align: right;
          color: #e5ded5;
        }

        .elevate-experience .posts-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: #9e8651;
          color: #111815;
          flex-shrink: 0;
        }

        .elevate-experience .replay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(17, 24, 21, 0.85);
          border: 1px solid rgba(229, 222, 213, 0.25);
          color: rgba(229, 222, 213, 0.82);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 9px;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .elevate-experience .replay-btn:hover {
          border-color: #9e8651;
          color: #9e8651;
        }

        @keyframes elevatePulseGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.55;
          }
        }

        @media (max-width: 800px) {
          .elevate-experience {
            width: 100%;
            height: 100svh;
            min-height: 640px;
            background: #111815;
          }
          .elevate-experience .elevate-video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center center;
            background: #111815;
          }
          .elevate-experience .elevate-side-dock {
            right: 20px;
            bottom: 24px;
          }
          .elevate-experience .elevate-prompt {
            bottom: 8vh;
          }
        }
      `}</style>
    </section>
  );
}