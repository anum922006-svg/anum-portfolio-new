"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, ArrowUpRight } from "lucide-react";
import ElevateProject from "./components/ElevateProject";
import SignatureCoffeeProject from "./components/SignatureCoffeeProject";
import BrewCoProject from "./components/BrewCoProject";
import LumineStudioProject from "./components/LumineStudioProject";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   3D PARTICLE FIELD
   ========================================================= */

function ParticleField({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 2600;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = radius * Math.cos(phi);
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const baseY = time * 0.055;
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetY = baseY + pointerX * 0.22;
    const targetX = Math.sin(time * 0.18) * 0.08 + pointerY * 0.16;

    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      targetY,
      0.045
    );
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      targetX,
      0.045
    );

    const targetZ = pointerX * 0.035;
    pointsRef.current.rotation.z = THREE.MathUtils.lerp(
      pointsRef.current.rotation.z,
      targetZ,
      0.035
    );
  });

  return (
    <points
      ref={pointsRef}
      position={isMobile ? [0.1, -1.8, -1.2] : [1.2, 0.1, -1]}
      scale={isMobile ? 0.65 : 1}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>

      <pointsMaterial
        color="#D6B36A"
        size={0.026}
        transparent
        opacity={0.78}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* =========================================================
   3D FLOATING GEOMETRY
   ========================================================= */

function FloatingGeometry({ isMobile }: { isMobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const baseYPos = isMobile ? -2.35 : 0;
  const baseXPos = isMobile ? 0.15 : 2.1;

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetRotationY = time * 0.18 + pointerX * 0.18;
    const targetRotationX = Math.sin(time * 0.35) * 0.12 + pointerY * 0.12;

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotationY,
      0.035
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetRotationX,
      0.035
    );

    const targetY = baseYPos + Math.sin(time * 0.45) * 0.1 + pointerY * 0.06;
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetY,
      0.04
    );

    const targetZ = -0.5 + pointerX * 0.08;
    group.current.position.z = THREE.MathUtils.lerp(
      group.current.position.z,
      targetZ,
      0.035
    );
  });

  return (
    <group
      ref={group}
      position={[baseXPos, baseYPos, -0.5]}
      scale={isMobile ? 0.62 : 1}
    >
      <mesh>
        <icosahedronGeometry args={[1.25, 2]} />

        <meshBasicMaterial
          color="#D6B36A"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[1.25, 2]} />

        <meshBasicMaterial
          color="#E5DED5"
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   CAMERA
   ========================================================= */

function CameraMotion({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetX = Math.sin(time * 0.15) * 0.15 + pointerX * 0.08;
    const targetY = Math.cos(time * 0.12) * 0.08 + pointerY * 0.05;
    const targetZ = isMobile ? 8.2 : 7;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.025);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.025);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* =========================================================
   3D SCENE
   ========================================================= */

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <CameraMotion isMobile={isMobile} />

      <ambientLight intensity={0.8} />

      <ParticleField isMobile={isMobile} />

      <FloatingGeometry isMobile={isMobile} />
    </>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 800);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-word",
        {
          opacity: 0,
          y: 120,
          rotateX: 55,
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.5,
          stagger: 0.12,
          ease: "power4.out",
        }
      );

      gsap.fromTo(
        ".hero-small",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.7,
          stagger: 0.15,
          ease: "power3.out",
        }
      );

      gsap.to(".hero-content", {
        yPercent: -32,
        scale: 0.86,
        opacity: 0.25,
        ease: "none",

        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.12,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(".hero-visual", {
        scale: 1.35,
        rotateY: 18,
        yPercent: 14,
        opacity: 1,
        ease: "none",

        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.08,
          invalidateOnRefresh: true,
        },
      });

      gsap.fromTo(
        ".about-reveal",
        {
          opacity: 0,
          y: 100,
          rotateX: 20,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.12,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".approach-card",
        {
          opacity: 0,
          y: 120,
          rotateY: -18,
        },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1.3,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".approach-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".flow-step",
        {
          opacity: 0,
          y: 50,
          rotateX: 20,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".approach-card",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".flow-arrow",
        {
          opacity: 0,
          scale: 0.6,
          y: -10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.18,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: ".approach-card",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".bring-item",
        {
          opacity: 0,
          x: -80,
          rotateX: 20,
        },
        {
          opacity: 1,
          x: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".bring-section",
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".closing-reveal",
        {
          opacity: 0,
          y: 44,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".closing-section",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main ref={pageRef} className="portfolio-page">
      <section className="hero-section">
        <div className="ambient ambient-one" />

        <div className="ambient ambient-two" />

        <div className="hero-visual">
          <Canvas
            camera={{
              position: [0, 0, isMobile ? 8.2 : 7],
              fov: 48,
            }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
            }}
          >
            <Scene isMobile={isMobile} />
          </Canvas>
        </div>

        <nav className="top-nav">
          <div className="brand">ANUM FARID</div>

          <div className="nav-label">PORTFOLIO / 2026</div>

          <div className="nav-status">
            <span />
            DESIGN WITH PURPOSE
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-index hero-small">01 / INTRODUCTION</div>

          <h1>
            <span className="hero-word">VISUALS</span>

            <span className="hero-word gold-word">WITH</span>

            <span className="hero-word">PURPOSE.</span>
          </h1>

          <div className="hero-description hero-small">
            <p>
              I create purposeful visual experiences where strategy, design and
              storytelling work together to communicate clearly and leave a
              lasting impression.
            </p>
          </div>

          <div className="hero-contacts hero-small" aria-label="Contact links">
            <span className="hero-contact-prompt">Let&apos;s work — Contact me</span>

            <div className="hero-contact-actions">
              <a
                href="mailto:anum922006@gmail.com"
                className="hero-contact-link"
                aria-label="Email Anum Farid"
              >
                <span className="hero-contact-badge">
                  <Mail size={15} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span>anum922006@gmail.com</span>
              </a>

              <a
                href="https://www.linkedin.com/in/anumfaridcreative/"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-contact-link"
                aria-label="Anum Farid on LinkedIn"
              >
                <span className="hero-contact-badge">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 17.34V10.67H6.12V17.34H8.34ZM7.23 9.76C7.98 9.76 8.45 9.26 8.45 8.64C8.44 8 7.98 7.52 7.25 7.52C6.51 7.52 6.03 8 6.03 8.64C6.03 9.26 6.5 9.76 7.21 9.76H7.23ZM18 17.34V13.59C18 11.58 16.93 10.64 15.5 10.64C14.35 10.64 13.84 11.27 13.55 11.72V10.67H11.33C11.36 11.27 11.33 17.34 11.33 17.34H13.55V13.62C13.55 13.42 13.57 13.22 13.62 13.08C13.77 12.71 14.11 12.33 14.68 12.33C15.42 12.33 15.78 12.89 15.78 13.71V17.34H18Z" />
                  </svg>
                </span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="hero-bottom hero-small">
            <span>SCROLL TO EXPLORE</span>

            <div className="scroll-line">
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-light">
        <div className="section-number about-reveal">02</div>

        <div className="section-grid">
          <div className="section-label about-reveal">ABOUT ME</div>

          <div className="about-copy">
            <h2 className="about-reveal">
              I’m Anum Farid.
              <br />
              <em>An Accounting &amp; Finance</em>
              <br />
              student with a
              <br />
              designer’s perspective.
            </h2>

            <p className="about-reveal">
              I approach design as a problem-solving process — understanding the
              idea first, then shaping the visual language around it.
            </p>

            <p className="about-reveal about-create">
              <span className="create-lead">What I create:</span> I create visual
              content and digital experiences that help businesses present their
              products, communicate their ideas and connect with their
              audiences. My work explores{" "}
              <em className="create-emphasis">social media campaigns</em>,{" "}
              <em className="create-emphasis">3D product visuals</em>,{" "}
              <em className="create-emphasis">promotional videos</em> and{" "}
              <em className="create-emphasis">interactive digital presentations</em>{" "}
              — bringing ideas to life through thoughtful design and visual
              storytelling.
            </p>
          </div>
        </div>
      </section>

      <section className="approach-section section-dark">
        <div className="section-number">03</div>

        <div className="section-grid">
          <div className="section-label">APPROACH</div>

          <div className="approach-card">
            <div className="approach-top">
              <span>HOW I THINK</span>
            </div>

            <div className="approach-flow">
              <div className="flow-step">THINK</div>

              <div className="flow-arrow">↓</div>

              <div className="flow-step">STRUCTURE</div>

              <div className="flow-arrow">↓</div>

              <div className="flow-step">CREATE</div>
            </div>

            <div className="approach-text">
              <p>
                I begin with the purpose behind the project — its audience,
                message and desired response.
              </p>

              <p>
                From there, I build a visual system that balances clarity,
                personality and detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bring-section section-light">
        <div className="section-number">04</div>

        <div className="section-grid">
          <div className="section-label">WHAT I BRING</div>

          <div className="bring-content">
            <p className="bring-intro">
              A combination of strategic thinking and visual execution.
            </p>

            <div className="bring-list">
              <div className="bring-item">
                <span>01</span>

                <strong>CLARITY</strong>

                <p>Turning complex ideas into clear visual communication.</p>
              </div>

              <div className="bring-item">
                <span>02</span>

                <strong>STRATEGY</strong>

                <p>Designing with the objective and audience in mind.</p>
              </div>

              <div className="bring-item">
                <span>03</span>

                <strong>VISUAL STORYTELLING</strong>

                <p>Creating visuals that guide, communicate and connect.</p>
              </div>

              <div className="bring-item">
                <span>04</span>

                <strong>DETAIL</strong>

                <p>Refining typography, composition, hierarchy and interaction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="work-transition">
        <div className="transition-number">05</div>

        <div className="transition-title">
          <span>SELECTED</span>

          <em>WORK.</em>
        </div>

        <div className="transition-line" />

        <p>
          A collection of visual identities, campaigns and digital experiences
          created with purpose.
        </p>
      </section>

      <ElevateProject />

      <SignatureCoffeeProject />

      <BrewCoProject />

      <LumineStudioProject />

      <footer className="closing-section" id="contact">
        <div className="closing-inner">
          <div className="closing-top closing-reveal">
            <span className="closing-kicker">06 / CLOSING NOTE</span>
            <span className="closing-availability">
              <span className="closing-dot" />
              CRAFTED WITH PURPOSE
            </span>
          </div>

          <h2 className="closing-title closing-reveal">
            <span>THANK YOU FOR</span>
            <em>BEING HERE.</em>
          </h2>

          <div className="closing-divider closing-reveal" />

          <div className="closing-grid">
            <div className="closing-story closing-reveal">
              <p className="closing-lead">
                Thank you for taking the time to explore my work.
              </p>

              <p>
                I&apos;m at the beginning of my creative journey, constantly
                learning, experimenting and discovering new ways to bring ideas
                to life. I may still be growing my experience, but I bring
                curiosity, dedication and a genuine willingness to understand
                every project I take on.
              </p>

              <p>
                I believe good work begins with the right mindset, thoughtful
                ideas and the effort to turn them into something meaningful.
              </p>

              <p>
                If you have a project in mind, an idea you&apos;d like to
                explore, or simply feel that we could create something
                worthwhile together, I&apos;d love to hear from you.
              </p>
            </div>

            <div className="closing-cta-card closing-reveal">
              <h3 className="closing-cta-heading">
                Let&apos;s make something <em>meaningful.</em>
              </h3>

              <p className="closing-cta-sub">
                I&apos;d be happy to hear about your next idea.
              </p>

              <span className="closing-touch-label">GET IN TOUCH</span>

              <div className="closing-actions">
                <a
                  href="mailto:anum922006@gmail.com"
                  className="closing-action-btn primary"
                  aria-label="Email Anum Farid"
                >
                  <span className="closing-action-icon">
                    <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span className="closing-action-text">
                    <strong>Email</strong>
                    <small>anum922006@gmail.com</small>
                  </span>
                  <ArrowUpRight size={15} strokeWidth={1.9} className="closing-arrow" />
                </a>

                <a
                  href="https://www.linkedin.com/in/anumfaridcreative/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="closing-action-btn"
                  aria-label="Connect with Anum Farid on LinkedIn"
                >
                  <span className="closing-action-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 17.34V10.67H6.12V17.34H8.34ZM7.23 9.76C7.98 9.76 8.45 9.26 8.45 8.64C8.44 8 7.98 7.52 7.25 7.52C6.51 7.52 6.03 8 6.03 8.64C6.03 9.26 6.5 9.76 7.21 9.76H7.23ZM18 17.34V13.59C18 11.58 16.93 10.64 15.5 10.64C14.35 10.64 13.84 11.27 13.55 11.72V10.67H11.33C11.36 11.27 11.33 17.34 11.33 17.34H13.55V13.62C13.55 13.42 13.57 13.22 13.62 13.08C13.77 12.71 14.11 12.33 14.68 12.33C15.42 12.33 15.78 12.89 15.78 13.71V17.34H18Z" />
                    </svg>
                  </span>
                  <span className="closing-action-text">
                    <strong>LinkedIn</strong>
                    <small>/in/anumfaridcreative</small>
                  </span>
                  <ArrowUpRight size={15} strokeWidth={1.9} className="closing-arrow" />
                </a>
              </div>

              <div className="closing-signature">
                <span>— Anum Farid</span>
                <small>PORTFOLIO / 2026</small>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html {
          color-scheme: light;
          forced-color-adjust: none;
          scroll-behavior: auto;
          background: #111815;
        }

        body {
          color-scheme: light;
          forced-color-adjust: none;
          margin: 0;
          background: #111815;
          color: #e5ded5;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-text-size-adjust: 100%;
        }

        ::selection {
          background: #9e8651;
          color: #111815;
        }

        .portfolio-page {
          color-scheme: light;
          width: 100%;
          overflow-x: clip;
          background: #111815;
        }

        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 760px;
          overflow: hidden;
          background: radial-gradient(
              circle at 70% 48%,
              rgba(158, 134, 81, 0.16),
              transparent 32%
            ),
            linear-gradient(145deg, #111815 0%, #1c2d27 52%, #101613 100%);
          perspective: 1400px;
        }

        .top-nav {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          padding: 28px 42px;
          border-bottom: 1px solid rgba(229, 222, 213, 0.12);
          font-size: 10px;
          letter-spacing: 0.18em;
          color: #e5ded5;
        }

        .brand {
          font-weight: 700;
        }

        .nav-label {
          text-align: center;
          opacity: 0.55;
        }

        .nav-status {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        .nav-status span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9e8651;
          box-shadow: 0 0 12px #9e8651;
        }

        .hero-visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          pointer-events: auto;
        }

        .hero-content {
          position: absolute;
          z-index: 10;
          left: 7vw;
          top: 50%;
          transform: translateY(-50%);
          width: min(760px, 78vw);
          transform-style: preserve-3d;
          will-change: transform, opacity;
          color: #e5ded5;
        }

        .hero-index {
          margin-bottom: 28px;
          color: #9e8651;
          font-size: 10px;
          letter-spacing: 0.25em;
        }

        .hero-content h1 {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(64px, 8.6vw, 136px);
          line-height: 0.88;
          letter-spacing: -0.02em;
          word-spacing: 0.08em;
          text-transform: uppercase;
          transform-style: preserve-3d;
          color: #e5ded5;
        }

        .hero-word {
          display: block;
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
        }

        .gold-word {
          margin-left: 8vw;
          color: #9e8651;
          font-style: italic;
        }

        .hero-description {
          width: 350px;
          margin-top: 58px;
          margin-left: 7vw;
        }

        .hero-description p {
          margin: 0;
          color: #e5ded5;
          opacity: 0.72;
          font-size: 13px;
          line-height: 1.8;
        }

        .hero-contacts {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          margin-top: 26px;
          margin-left: 7vw;
        }

        .hero-contact-prompt {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #e3c278;
          font-weight: 700;
        }

        .hero-contact-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .hero-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px 7px 7px;
          border-radius: 999px;
          border: 1px solid rgba(227, 194, 120, 0.55);
          background: rgba(227, 194, 120, 0.14);
          color: #f7f1e6;
          text-decoration: none;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.05em;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .hero-contact-link:hover,
        .hero-contact-link:focus-visible {
          transform: translateY(-1px);
          border-color: rgba(227, 194, 120, 0.9);
          background: rgba(227, 194, 120, 0.24);
        }

        .hero-contact-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #d6b36a;
          color: #111815;
          flex-shrink: 0;
        }

        .hero-bottom {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 44px;
          margin-left: 7vw;
          font-size: 9px;
          letter-spacing: 0.22em;
          opacity: 0.65;
          color: #e5ded5;
        }

        .scroll-line {
          width: 80px;
          height: 1px;
          background: rgba(229, 222, 213, 0.25);
          position: relative;
          overflow: hidden;
        }

        .scroll-line span {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 35%;
          background: #9e8651;
          animation: scrollMove 2s ease-in-out infinite;
        }

        @keyframes scrollMove {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(250%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        .ambient {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
        }

        .ambient-one {
          width: 500px;
          height: 500px;
          right: 2%;
          top: 20%;
          background: rgba(158, 134, 81, 0.08);
        }

        .ambient-two {
          width: 400px;
          height: 400px;
          left: -10%;
          bottom: -15%;
          background: rgba(229, 222, 213, 0.04);
        }

        .section-light {
          color-scheme: light;
          position: relative;
          min-height: 100vh;
          padding: 150px 8vw;
          background-color: #e5ded5 !important;
          color: #1c2d27 !important;
        }

        .section-dark {
          color-scheme: light;
          position: relative;
          min-height: 100vh;
          padding: 150px 8vw;
          background-color: #1c2d27 !important;
          color: #e5ded5 !important;
        }

        .section-number {
          position: absolute;
          top: 50px;
          right: 7vw;
          font-family: Georgia, serif;
          font-size: 12px;
          letter-spacing: 0.18em;
          opacity: 0.5;
        }

        .section-grid {
          display: grid;
          grid-template-columns: 25% 75%;
          max-width: 1400px;
          margin: auto;
        }

        .section-label {
          padding-top: 10px;
          font-size: 10px;
          letter-spacing: 0.25em;
          opacity: 0.6;
        }

        .about-copy {
          max-width: 900px;
        }

        .about-copy h2 {
          margin: 0;
          max-width: 900px;
          font-family: Georgia, serif;
          font-size: clamp(44px, 5.2vw, 82px);
          line-height: 1.04;
          letter-spacing: -0.02em;
          word-spacing: 0.05em;
          font-weight: 400;
          color: #1c2d27;
        }

        .about-copy h2 em {
          color: #9e8651;
          font-style: italic;
        }

        .about-copy p {
          max-width: 580px;
          margin-top: 50px;
          font-size: 15px;
          line-height: 1.9;
          opacity: 0.78;
          color: #1c2d27;
        }

        .about-copy p.about-create {
          max-width: 620px;
          margin-top: 32px;
          padding-left: 18px;
          border-left: 2px solid rgba(158, 134, 81, 0.55);
          opacity: 0.94;
          color: #1c2d27;
        }

        .about-create .create-lead {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-style: italic;
          color: #876c36;
          margin-right: 4px;
        }

        .about-create .create-emphasis {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          color: #16251f;
          border-bottom: 1px solid rgba(158, 134, 81, 0.45);
          padding-bottom: 1px;
        }

        .approach-card {
          padding: 60px;
          min-height: 570px;
          border: 1px solid rgba(229, 222, 213, 0.15);
          background: linear-gradient(
            135deg,
            rgba(229, 222, 213, 0.05),
            rgba(158, 134, 81, 0.03)
          );
          transform-style: preserve-3d;
        }

        .approach-top {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          letter-spacing: 0.22em;
          opacity: 0.55;
        }

        .approach-flow {
          width: 100%;
          min-height: 360px;
          margin-top: 90px;
          margin-bottom: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform-style: preserve-3d;
        }

        .flow-step {
          font-family: Georgia, serif;
          font-size: clamp(48px, 5.6vw, 86px);
          line-height: 1.04;
          letter-spacing: -0.02em;
          font-weight: 400;
          text-align: center;
          transform-style: preserve-3d;
          will-change: transform, opacity;
        }

        .flow-step span {
          color: #9e8651;
          font-style: italic;
        }

        .flow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 58px;
          color: #9e8651;
          font-family: Georgia, serif;
          font-size: 38px;
          line-height: 1;
          text-align: center;
          transform-style: preserve-3d;
          will-change: transform, opacity;
        }

        .approach-text {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
        }

        .approach-text p {
          max-width: 350px;
          font-size: 14px;
          line-height: 1.9;
          opacity: 0.72;
        }

        .bring-content {
          max-width: 1000px;
        }

        .bring-intro {
          max-width: 600px;
          margin: 0 0 80px;
          font-family: Georgia, serif;
          font-size: clamp(36px, 3.8vw, 60px);
          line-height: 1.08;
          letter-spacing: -0.015em;
          word-spacing: 0.04em;
          color: #1c2d27;
        }

        .bring-list {
          border-top: 1px solid rgba(28, 45, 39, 0.2);
        }

        .bring-item {
          display: grid;
          grid-template-columns: 70px 1fr 1fr;
          align-items: center;
          gap: 30px;
          padding: 30px 0;
          border-bottom: 1px solid rgba(28, 45, 39, 0.2);
          will-change: transform, opacity;
        }

        .bring-item span {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: #9e8651;
        }

        .bring-item strong {
          font-family: Georgia, serif;
          font-size: clamp(24px, 3vw, 44px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: #1c2d27;
        }

        .bring-item p {
          max-width: 320px;
          margin: 0;
          font-size: 12px;
          line-height: 1.7;
          opacity: 0.72;
          color: #1c2d27;
        }

        .work-transition {
          color-scheme: light;
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 8vw;
          background: radial-gradient(
              circle at 70% 40%,
              rgba(158, 134, 81, 0.12),
              transparent 35%
            ),
            #111815;
          color: #e5ded5;
        }

        .transition-number {
          color: #9e8651;
          font-size: 10px;
          letter-spacing: 0.2em;
          margin-bottom: 40px;
        }

        .transition-title {
          display: flex;
          flex-direction: column;
          font-family: Georgia, serif;
          font-size: clamp(72px, 11.5vw, 190px);
          line-height: 0.86;
          letter-spacing: -0.025em;
        }

        .transition-title em {
          margin-left: 12vw;
          color: #9e8651;
          font-style: italic;
        }

        .transition-line {
          width: 100%;
          height: 1px;
          margin: 70px 0 30px;
          background: rgba(229, 222, 213, 0.15);
        }

        .work-transition p {
          max-width: 420px;
          margin-left: auto;
          color: #e5ded5;
          opacity: 0.68;
          font-size: 12px;
          line-height: 1.8;
        }

        /* =========================================================
           CLOSING / THANK YOU & CONTACT SECTION (06)
           ========================================================= */

        .closing-section {
          position: relative;
          min-height: 100svh;
          padding: 130px 8vw 96px;
          background: radial-gradient(
              circle at 78% 28%,
              rgba(158, 134, 81, 0.16),
              transparent 42%
            ),
            radial-gradient(
              circle at 18% 82%,
              rgba(28, 45, 39, 0.65),
              transparent 52%
            ),
            linear-gradient(155deg, #111815 0%, #1a2a24 54%, #0f1512 100%);
          border-top: 1px solid rgba(229, 222, 213, 0.12);
          color: #e5ded5;
          display: flex;
          align-items: center;
        }

        .closing-inner {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
        }

        .closing-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 34px;
        }

        .closing-kicker {
          font-size: 10px;
          letter-spacing: 0.24em;
          color: #9e8651;
          text-transform: uppercase;
        }

        .closing-availability {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(229, 222, 213, 0.8);
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(214, 179, 106, 0.26);
          background: rgba(214, 179, 106, 0.07);
        }

        .closing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d6b36a;
          box-shadow: 0 0 10px #d6b36a;
        }

        .closing-title {
          margin: 0;
          display: flex;
          flex-direction: column;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(50px, 7.6vw, 124px);
          line-height: 0.9;
          letter-spacing: -0.025em;
          font-weight: 400;
          color: #e5ded5;
          text-transform: uppercase;
        }

        .closing-title em {
          margin-left: 7vw;
          color: #b79c63;
          font-style: italic;
        }

        .closing-divider {
          width: 100%;
          height: 1px;
          margin: 56px 0 48px;
          background: linear-gradient(
            90deg,
            rgba(214, 179, 106, 0.45),
            rgba(229, 222, 213, 0.14) 55%,
            transparent
          );
        }

        .closing-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr;
          gap: 64px;
          align-items: start;
        }

        .closing-story {
          max-width: 580px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .closing-story p {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.85;
          color: rgba(229, 222, 213, 0.78);
        }

        .closing-story p.closing-lead {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(20px, 2vw, 25px);
          line-height: 1.4;
          color: #f3ede4;
        }

        .closing-cta-card {
          padding: 38px 36px;
          border-radius: 18px;
          border: 1px solid rgba(214, 179, 106, 0.3);
          background: linear-gradient(
            145deg,
            rgba(229, 222, 213, 0.055),
            rgba(214, 179, 106, 0.06)
          );
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .closing-cta-heading {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 2.8vw, 38px);
          line-height: 1.12;
          font-weight: 400;
          color: #f5efe6;
        }

        .closing-cta-heading em {
          color: #d6b36a;
          font-style: italic;
        }

        .closing-cta-sub {
          margin: 0 0 6px;
          font-size: 14px;
          line-height: 1.65;
          color: rgba(229, 222, 213, 0.78);
        }

        .closing-touch-label {
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #d6b36a;
          font-weight: 700;
          margin-top: 4px;
        }

        .closing-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .closing-action-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(229, 222, 213, 0.2);
          background: rgba(17, 24, 21, 0.65);
          color: #f5efe6;
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .closing-action-btn.primary {
          border-color: rgba(214, 179, 106, 0.48);
          background: rgba(214, 179, 106, 0.12);
        }

        .closing-action-btn:hover,
        .closing-action-btn:focus-visible {
          transform: translateY(-2px);
          border-color: rgba(214, 179, 106, 0.85);
          background: rgba(214, 179, 106, 0.2);
        }

        .closing-action-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #d6b36a;
          color: #111815;
          flex-shrink: 0;
        }

        .closing-action-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .closing-action-text strong {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #f7f1e6;
        }

        .closing-action-text small {
          font-size: 11.5px;
          color: rgba(229, 222, 213, 0.72);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .closing-arrow {
          color: #d6b36a;
          flex-shrink: 0;
        }

        .closing-signature {
          margin-top: 14px;
          padding-top: 18px;
          border-top: 1px solid rgba(229, 222, 213, 0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .closing-signature span {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-size: 17px;
          color: #e5ded5;
        }

        .closing-signature small {
          font-size: 9.5px;
          letter-spacing: 0.2em;
          color: rgba(229, 222, 213, 0.5);
        }

        @media (max-width: 800px) {
          .hero-section {
            min-height: 100svh;
            height: auto;
          }

          .top-nav {
            grid-template-columns: 1fr auto;
            padding: 22px;
          }

          .nav-label {
            display: none;
          }

          .hero-content {
            left: 22px;
            top: 44%;
            width: calc(100% - 44px);
          }

          .hero-content h1 {
            font-size: clamp(48px, 13vw, 82px);
            line-height: 0.92;
            letter-spacing: -0.015em;
          }

          .gold-word {
            margin-left: 6vw;
          }

          .hero-description {
            margin-top: 24px;
            margin-left: 0;
            width: min(320px, 85vw);
          }

          .hero-contacts {
            margin-top: 18px;
            margin-left: 0;
            gap: 8px;
          }

          .hero-bottom {
            margin-top: 24px;
            margin-left: 0;
          }

          .section-light,
          .section-dark {
            min-height: auto;
            padding: 90px 22px;
          }

          .section-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .section-label {
            padding: 0;
          }

          .about-copy h2 {
            font-size: 40px;
            line-height: 1.06;
            letter-spacing: -0.015em;
          }

          .about-copy p {
            margin-top: 28px;
          }

          .about-copy p.about-create {
            margin-top: 22px;
            padding-left: 14px;
          }

          .approach-card {
            padding: 28px 22px;
            min-height: auto;
          }

          .approach-flow {
            min-height: 280px;
            margin-top: 50px;
            margin-bottom: 45px;
          }

          .flow-step {
            font-size: 46px;
          }

          .flow-arrow {
            height: 46px;
            font-size: 30px;
          }

          .approach-text {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .bring-intro {
            margin-bottom: 44px;
            font-size: 32px;
          }

          .bring-item {
            grid-template-columns: 35px 1fr;
            gap: 12px 15px;
            padding: 22px 0;
          }

          .bring-item p {
            grid-column: 2;
          }

          .work-transition {
            min-height: auto;
            padding: 90px 22px;
          }

          .transition-title {
            font-size: clamp(54px, 16vw, 88px);
            line-height: 0.92;
          }

          .transition-line {
            margin: 40px 0 24px;
          }

          .closing-section {
            min-height: auto;
            padding: 88px 22px 72px;
          }

          .closing-title {
            font-size: clamp(42px, 12vw, 68px);
            line-height: 0.94;
          }

          .closing-title em {
            margin-left: 4vw;
          }

          .closing-divider {
            margin: 36px 0 32px;
          }

          .closing-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .closing-cta-card {
            padding: 26px 22px;
          }
        }
      `}</style>
    </main>
  );
}