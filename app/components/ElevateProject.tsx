"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, RotateCcw, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

type Stage = "idle" | "playing" | "description_hold" | "posts_view";

type VideoWithVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

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
  const videoRef = useRef<VideoWithVFC | null>(null);
  const frameHandleRef = useRef<number | null>(null);
  const useVfcRef = useRef(false);

  const [stage, setStage] = useState<Stage>("idle");
  const [videoError, setVideoError] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});

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

    video.addEventListener("error", handleError);

    if (video.readyState >= 2) {
      lockFirstFrame();
    } else {
      video.addEventListener("loadeddata", lockFirstFrame, { once: true });
    }

    return () => {
      video.removeEventListener("error", handleError);
      stopFrameMonitor();
    };
  }, []);

  const stopFrameMonitor = () => {
    const video = videoRef.current;
    if (frameHandleRef.current === null) return;

    if (useVfcRef.current && video?.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(frameHandleRef.current);
    } else {
      cancelAnimationFrame(frameHandleRef.current);
    }
    frameHandleRef.current = null;
  };

  const startFrameMonitor = () => {
    stopFrameMonitor();

    const checkFrame = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.currentTime >= DESCRIPTION_REVEAL_TIME || video.ended) {
        video.pause();
        setStage("description_hold");
        stopFrameMonitor();
        return;
      }

      if (video.requestVideoFrameCallback) {
        useVfcRef.current = true;
        frameHandleRef.current = video.requestVideoFrameCallback(checkFrame);
      } else {
        useVfcRef.current = false;
        frameHandleRef.current = requestAnimationFrame(checkFrame);
      }
    };

    const video = videoRef.current;
    if (video?.requestVideoFrameCallback) {
      useVfcRef.current = true;
      frameHandleRef.current = video.requestVideoFrameCallback(checkFrame);
    } else {
      useVfcRef.current = false;
      frameHandleRef.current = requestAnimationFrame(checkFrame);
    }
  };

  const handleStart = () => {
    if (stage !== "idle") return;
    const video = videoRef.current;
    if (!video) return;

    setStage("playing");
    video.muted = true;
    video.playbackRate = PLAYBACK_RATE;
    video
      .play()
      .then(() => startFrameMonitor())
      .catch(() => {});
  };

  const handleReplay = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    stopFrameMonitor();
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
        preload="auto"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
      />

      {videoError && stage !== "description_hold" && stage !== "posts_view" && (
        <div className="video-missing-note">
          Video not found at <code>{VIDEO_SRC}</code>. Check the filename inside{" "}
          <code>public/projects/elevate/ELEVATE VIDEO/</code>.
        </div>
      )}

      <AnimatePresence>
        {stage === "description_hold" && (
          <motion.div
            className="elevate-campaign-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="campaign-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="campaign-brand">
                <img
                  src="/projects/elevate/elevate_solutions_logo_extracted.png"
                  alt="Elevate Solutions Logo"
                  className="campaign-extracted-logo"
                  draggable={false}
                />
              </div>

              <h2 className="campaign-title">
                CORPORATE <span>BUSINESS</span>
              </h2>
              <p className="campaign-subtitle">SOCIAL MEDIA CAMPAIGN</p>
              <p className="campaign-body">
                A strategic social media campaign designed to strengthen brand
                presence, build trust, and communicate value.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "posts_view" && (
          <motion.div
            className="elevate-posts-overlay"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
            className="elevate-side-dock"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              duration: 0.65,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
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
          background: #0f1c17;
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
          transition: opacity 0.8s ease;
        }

        .elevate-experience .elevate-video.is-dimmed {
          z-index: 7;
          opacity: 0.22;
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
          background: rgba(15, 28, 23, 0.92);
          color: #e8e3d9;
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
            circle at 50% 35%,
            rgba(22, 41, 33, 0.55) 0%,
            rgba(15, 28, 23, 0.78) 58%,
            rgba(11, 21, 17, 0.88) 100%
          );
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
          color: #e8e3d9;
        }

        .elevate-experience .campaign-title span {
          color: #c9ad6a;
        }

        .elevate-experience .campaign-subtitle {
          margin: 18px 0 36px;
          font-size: clamp(13px, 1.4vw, 18px);
          letter-spacing: 0.34em;
          color: rgba(232, 227, 217, 0.88);
        }

        .elevate-experience .campaign-body {
          margin: 0 auto;
          max-width: 560px;
          font-size: clamp(15px, 1.35vw, 19px);
          line-height: 1.75;
          color: rgba(232, 227, 217, 0.78);
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
              rgba(16, 30, 24, 0.96) 55%,
              #0c1612 100%
            ),
            #0f1c17;
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
          color: #e8e3d9;
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
          border: 1px solid rgba(232, 227, 217, 0.28);
          background: rgba(15, 28, 23, 0.88);
          color: #e8e3d9;
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
          background: rgba(15, 28, 23, 0.9);
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .elevate-experience .post-card:hover {
          transform: translateY(-4px);
          border-color: #c9ad6a;
        }

        .elevate-experience .post-media {
          width: 100%;
          background: #0b1410;
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
          color: rgba(232, 227, 217, 0.72);
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
          color: #e8e3d9;
        }

        .elevate-experience .post-caption {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(232, 227, 217, 0.72);
        }

        .elevate-experience .post-lightbox {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(8, 15, 12, 0.92);
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
          color: #e8e3d9;
        }

        .elevate-experience .lightbox-close {
          position: fixed;
          top: 22px;
          right: 24px;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(232, 227, 217, 0.28);
          background: rgba(15, 28, 23, 0.88);
          color: #e8e3d9;
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
          border: 1px solid rgba(232, 227, 217, 0.28);
          background: rgba(15, 28, 23, 0.88);
          color: #e8e3d9;
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
            rgba(15, 28, 23, 0.42) 0%,
            rgba(15, 28, 23, 0) 22%,
            rgba(15, 28, 23, 0) 76%,
            rgba(15, 28, 23, 0.58) 100%
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
          color: rgba(232, 227, 217, 0.78);
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
          color: #e8e3d9;
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
          border: 1px solid rgba(232, 227, 217, 0.32);
          background: rgba(15, 28, 23, 0.82);
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #e8e3d9;
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
        }

        .elevate-experience .posts-link {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px 10px 18px;
          border-radius: 12px;
          border: 1px solid rgba(158, 134, 81, 0.55);
          background: rgba(15, 28, 23, 0.9);
          color: #e8e3d9;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .elevate-experience .posts-link:hover {
          transform: translateX(-4px);
          border-color: #e8e3d9;
        }

        .elevate-experience .posts-copy {
          max-width: 175px;
          font-size: 11px;
          line-height: 1.4;
          text-align: right;
          color: #e8e3d9;
        }

        .elevate-experience .posts-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: #9e8651;
          color: #0f1c17;
          flex-shrink: 0;
        }

        .elevate-experience .replay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 28, 23, 0.85);
          border: 1px solid rgba(232, 227, 217, 0.25);
          color: rgba(232, 227, 217, 0.82);
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
            height: 62svh;
            min-height: 420px;
          }
          .elevate-experience .elevate-video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #0f1c17;
          }
          .elevate-experience .elevate-side-dock {
            right: 20px;
            bottom: 20px;
          }
          .elevate-experience .elevate-prompt {
            bottom: 10vh;
          }
        }
      `}</style>
    </section>
  );
}