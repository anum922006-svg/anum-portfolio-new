 "use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ElevateProject from "./components/ElevateProject";
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   3D PARTICLE FIELD
   ========================================================= */

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 2600;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      array[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      array[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);

      array[i * 3 + 2] =
        radius * Math.cos(phi);
    }

    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;

    const baseY = time * 0.055;

    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetY =
      baseY + pointerX * 0.22;

    const targetX =
      Math.sin(time * 0.18) * 0.08 +
      pointerY * 0.16;

    pointsRef.current.rotation.y =
      THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        targetY,
        0.045
      );

    pointsRef.current.rotation.x =
      THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        targetX,
        0.045
      );

    const targetZ =
      pointerX * 0.035;

    pointsRef.current.rotation.z =
      THREE.MathUtils.lerp(
        pointsRef.current.rotation.z,
        targetZ,
        0.035
      );
  });

  return (
    <points
      ref={pointsRef}
      position={[1.2, 0.1, -1]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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

function FloatingGeometry() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetRotationY =
      time * 0.18 +
      pointerX * 0.18;

    const targetRotationX =
      Math.sin(time * 0.35) * 0.12 +
      pointerY * 0.12;

    group.current.rotation.y =
      THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotationY,
        0.035
      );

    group.current.rotation.x =
      THREE.MathUtils.lerp(
        group.current.rotation.x,
        targetRotationX,
        0.035
      );

    const targetY =
      Math.sin(time * 0.45) * 0.12 +
      pointerY * 0.08;

    group.current.position.y =
      THREE.MathUtils.lerp(
        group.current.position.y,
        targetY,
        0.04
      );

    const targetZ =
      -0.5 + pointerX * 0.08;

    group.current.position.z =
      THREE.MathUtils.lerp(
        group.current.position.z,
        targetZ,
        0.035
      );
  });

  return (
    <group
      ref={group}
      position={[2.1, 0, -0.5]}
    >
      <mesh>
        <icosahedronGeometry args={[1.25, 2]} />

        <meshBasicMaterial
          color="#D6B36A"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[1.25, 2]} />

        <meshBasicMaterial
          color="#E8E3D9"
          wireframe
          transparent
          opacity={0.13}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   CAMERA
   ========================================================= */

function CameraMotion() {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    const targetX =
      Math.sin(time * 0.15) * 0.15 +
      pointerX * 0.08;

    const targetY =
      Math.cos(time * 0.12) * 0.08 +
      pointerY * 0.05;

    camera.position.x =
      THREE.MathUtils.lerp(
        camera.position.x,
        targetX,
        0.025
      );

    camera.position.y =
      THREE.MathUtils.lerp(
        camera.position.y,
        targetY,
        0.025
      );

    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* =========================================================
   3D SCENE
   ========================================================= */

function Scene() {
  return (
    <>
      <CameraMotion />

      <ambientLight intensity={0.8} />

      <ParticleField />

      <FloatingGeometry />
    </>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {

      /* -----------------------------------------------------
         HERO TEXT
         ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         HERO CONTENT SCROLL
         ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         HERO 3D VISUAL
         ----------------------------------------------------- */

      gsap.to(".hero-visual", {
        scale: 1.45,
        rotateY: 18,
        yPercent: 18,
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

      /* -----------------------------------------------------
         ABOUT ME
         ----------------------------------------------------- */

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

            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* -----------------------------------------------------
         APPROACH
         ----------------------------------------------------- */

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

            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* -----------------------------------------------------
         VERTICAL FLOW
         ----------------------------------------------------- */

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

            toggleActions:
              "play none none reverse",
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

            toggleActions:
              "play none none reverse",
          },
        }
      );

      /* -----------------------------------------------------
         WHAT I BRING
         ----------------------------------------------------- */

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

            toggleActions:
              "play none none reverse",
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
    <main
      ref={pageRef}
      className="portfolio-page"
    >

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="hero-section">

        <div className="ambient ambient-one" />

        <div className="ambient ambient-two" />

        <div className="hero-visual">

          <Canvas
            camera={{
              position: [0, 0, 7],
              fov: 48,
            }}

            dpr={[1, 1.5]}

            gl={{
              antialias: true,
              powerPreference:
                "high-performance",
            }}
          >
            <Scene />
          </Canvas>

        </div>

        <nav className="top-nav">

          <div className="brand">
            ANUM FARID
          </div>

          <div className="nav-label">
            PORTFOLIO / 2026
          </div>

          <div className="nav-status">

            <span />

            DESIGN WITH PURPOSE

          </div>

        </nav>

        <div className="hero-content">

          <div className="hero-index hero-small">
            01 / INTRODUCTION
          </div>

          <h1>

            <span className="hero-word">
              VISUALS
            </span>

            <span className="hero-word gold-word">
              WITH
            </span>

            <span className="hero-word">
              PURPOSE.
            </span>

          </h1>

          <div className="hero-description hero-small">

            <p>
              I create purposeful visual experiences
              where strategy, design and storytelling
              work together to communicate clearly
              and leave a lasting impression.
            </p>

          </div>

          <div className="hero-bottom hero-small">

            <span>
              SCROLL TO EXPLORE
            </span>

            <div className="scroll-line">
              <span />
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          ABOUT ME
          ===================================================== */}

      <section className="about-section section-light">

        <div className="section-number about-reveal">
          02
        </div>

        <div className="section-grid">

          <div className="section-label about-reveal">
            ABOUT ME
          </div>

          <div className="about-copy">

            <h2 className="about-reveal">
              I’m Anum Farid.
              <br />
              <em>An Accounting & Finance</em>
              <br />
              student with a
              <br />
              designer’s perspective.
            </h2>

            <p className="about-reveal">
              I approach design as a problem-solving
              process — understanding the idea first,
              then shaping the visual language around
              it.
            </p>

            <p className="about-reveal">
              I create purposeful visual experiences
              where strategy, design and storytelling
              work together to communicate clearly
              and leave a lasting impression. From
              brand identities and editorial compositions
              to digital experiences, every visual
              decision has a reason, a hierarchy and
              a purpose.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          APPROACH
          ===================================================== */}

      <section className="approach-section section-dark">

        <div className="section-number">
          03
        </div>

        <div className="section-grid">

          <div className="section-label">
            APPROACH
          </div>

          <div className="approach-card">

            <div className="approach-top">

              <span>
                HOW I THINK
              </span>

            </div>

            <div className="approach-flow">

              <div className="flow-step">
                THINK
              </div>

              <div className="flow-arrow">
                ↓
              </div>

              <div className="flow-step">
                STRUCTURE
              </div>

              <div className="flow-arrow">
                ↓
              </div>

              <div className="flow-step">
                CREATE
              </div>

            </div>

            <div className="approach-text">

              <p>
                I begin with the purpose behind
                the project — its audience, message
                and desired response.
              </p>

              <p>
                From there, I build a visual system
                that balances clarity, personality
                and detail.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHAT I BRING
          ===================================================== */}

      <section className="bring-section section-light">

        <div className="section-number">
          04
        </div>

        <div className="section-grid">

          <div className="section-label">
            WHAT I BRING
          </div>

          <div className="bring-content">

            <p className="bring-intro">
              A combination of strategic thinking
              and visual execution.
            </p>

            <div className="bring-list">

              <div className="bring-item">

                <span>
                  01
                </span>

                <strong>
                  CLARITY
                </strong>

                <p>
                  Turning complex ideas into
                  clear visual communication.
                </p>

              </div>

              <div className="bring-item">

                <span>
                  02
                </span>

                <strong>
                  STRATEGY
                </strong>

                <p>
                  Designing with the objective
                  and audience in mind.
                </p>

              </div>

              <div className="bring-item">

                <span>
                  03
                </span>

                <strong>
                  VISUAL STORYTELLING
                </strong>

                <p>
                  Creating visuals that guide,
                  communicate and connect.
                </p>

              </div>

              <div className="bring-item">

                <span>
                  04
                </span>

                <strong>
                  DETAIL
                </strong>

                <p>
                  Refining typography, composition,
                  hierarchy and interaction.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SELECTED WORK TRANSITION
          ===================================================== */}

      <section className="work-transition">

        <div className="transition-number">
          05
        </div>

        <div className="transition-title">

          <span>
            SELECTED
          </span>

          <em>
            WORK.
          </em>

        </div>

        <div className="transition-line" />

        <p>
          A collection of visual identities,
          campaigns and digital experiences
          created with purpose.
        </p>

      </section>
            <ElevateProject />

      {/* =====================================================
          STYLES
          ===================================================== */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: auto;
          background: #111815;
        }

        body {
          margin: 0;
          background: #111815;
          color: #E8E3D9;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        ::selection {
          background: #9E8651;
          color: #111815;
        }

        .portfolio-page {
          width: 100%;
          overflow: hidden;
          background: #111815;
        }

        /* ================================================
           HERO
           ================================================ */

        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 760px;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 70% 48%,
              rgba(158,134,81,.16),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              #111815 0%,
              #1C2D27 52%,
              #101613 100%
            );

          perspective: 1400px;
        }

        .top-nav {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 20;

          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;

          align-items: center;

          padding: 28px 42px;

          border-bottom:
            1px solid
            rgba(232,227,217,.12);

          font-size: 10px;
          letter-spacing: .18em;
        }

        .brand {
          font-weight: 700;
        }

        .nav-label {
          text-align: center;
          opacity: .55;
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

          background: #9E8651;

          box-shadow:
            0 0 12px #9E8651;
        }

        .hero-visual {
          position: absolute;
          inset: 0;

          z-index: 1;

          transform-style: preserve-3d;

          will-change:
            transform,
            opacity;

          pointer-events: auto;
        }

        .hero-content {
          position: absolute;

          z-index: 10;

          left: 7vw;
          top: 50%;

          transform:
            translateY(-50%);

          width:
            min(760px, 78vw);

          transform-style:
            preserve-3d;

          will-change:
            transform,
            opacity;
        }

        .hero-index {
          margin-bottom: 28px;

          color: #9E8651;

          font-size: 10px;
          letter-spacing: .25em;
        }

        .hero-content h1 {
          margin: 0;

          display: flex;
          flex-direction: column;
          align-items: flex-start;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(70px, 9.2vw, 148px);

          line-height: .78;

          letter-spacing: -.065em;

          text-transform: uppercase;

          transform-style:
            preserve-3d;
        }

        .hero-word {
          display: block;

          transform-style:
            preserve-3d;

          will-change:
            transform,
            opacity,
            filter;
        }

        .gold-word {
          margin-left: 8vw;

          color: #9E8651;

          font-style: italic;
        }

        .hero-description {
          width: 350px;

          margin-top: 58px;
          margin-left: 7vw;
        }

        .hero-description p {
          margin: 0;

          color: #E8E3D9;

          opacity: .7;

          font-size: 13px;

          line-height: 1.8;
        }

        .hero-bottom {
          display: flex;

          align-items: center;

          gap: 18px;

          margin-top: 75px;
          margin-left: 7vw;

          font-size: 9px;

          letter-spacing: .22em;

          opacity: .6;
        }

        .scroll-line {
          width: 80px;
          height: 1px;

          background:
            rgba(232,227,217,.25);

          position: relative;

          overflow: hidden;
        }

        .scroll-line span {
          position: absolute;

          left: 0;
          top: 0;

          height: 100%;
          width: 35%;

          background: #9E8651;

          animation:
            scrollMove
            2s
            ease-in-out
            infinite;
        }

        @keyframes scrollMove {

          0% {
            transform:
              translateX(-100%);
          }

          50% {
            transform:
              translateX(250%);
          }

          100% {
            transform:
              translateX(250%);
          }

        }

        .ambient {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter:
            blur(100px);
        }

        .ambient-one {
          width: 500px;
          height: 500px;

          right: 2%;
          top: 20%;

          background:
            rgba(158,134,81,.08);
        }

        .ambient-two {
          width: 400px;
          height: 400px;

          left: -10%;
          bottom: -15%;

          background:
            rgba(232,227,217,.04);
        }

        /* ================================================
           SHARED SECTIONS
           ================================================ */

        .section-light {
          position: relative;

          min-height: 100vh;

          padding:
            150px
            8vw;

          background: #E8E3D9;

          color: #1C2D27;
        }

        .section-dark {
          position: relative;

          min-height: 100vh;

          padding:
            150px
            8vw;

          background: #1C2D27;

          color: #E8E3D9;
        }

        .section-number {
          position: absolute;

          top: 50px;
          right: 7vw;

          font-family:
            Georgia,
            serif;

          font-size: 12px;

          letter-spacing: .18em;

          opacity: .45;
        }

        .section-grid {
          display: grid;

          grid-template-columns:
            25% 75%;

          max-width: 1400px;

          margin: auto;
        }

        .section-label {
          padding-top: 10px;

          font-size: 10px;

          letter-spacing: .25em;

          opacity: .55;
        }

        /* ================================================
           ABOUT
           ================================================ */

        .about-copy {
          max-width: 900px;
        }

        .about-copy h2 {
          margin: 0;

          max-width: 900px;

          font-family:
            Georgia,
            serif;

          /* ONLY CHANGE: slightly reduced */

          font-size:
            clamp(
              46px,
              5.5vw,
              88px
            );

          line-height: .95;

          letter-spacing: -.05em;

          font-weight: 400;
        }

        .about-copy h2 em {
          color: #9E8651;

          font-style: italic;
        }

        .about-copy p {
          max-width: 580px;

          margin-top: 50px;

          font-size: 15px;

          line-height: 1.9;

          opacity: .72;
        }

        /* ================================================
           APPROACH
           ================================================ */

        .approach-card {
          padding: 60px;

          min-height: 570px;

          border:
            1px solid
            rgba(232,227,217,.15);

          background:
            linear-gradient(
              135deg,
              rgba(232,227,217,.05),
              rgba(158,134,81,.03)
            );

          transform-style:
            preserve-3d;
        }

        .approach-top {
          display: flex;

          justify-content:
            space-between;

          font-size: 9px;

          letter-spacing: .22em;

          opacity: .5;
        }

        /* ================================================
           VERTICAL THINK / STRUCTURE / CREATE
           ================================================ */

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

          transform-style:
            preserve-3d;
        }

        .flow-step {
          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              52px,
              6vw,
              92px
            );

          line-height: .95;

          letter-spacing: -.05em;

          font-weight: 400;

          text-align: center;

          transform-style:
            preserve-3d;

          will-change:
            transform,
            opacity;
        }

        .flow-step span {
          color: #9E8651;

          font-style: italic;
        }

        .flow-arrow {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 100%;
          height: 58px;

          color: #9E8651;

          font-family:
            Georgia,
            serif;

          font-size: 38px;

          line-height: 1;

          text-align: center;

          transform-style:
            preserve-3d;

          will-change:
            transform,
            opacity;
        }

        .approach-text {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;
        }

        .approach-text p {
          max-width: 350px;

          font-size: 14px;

          line-height: 1.9;

          opacity: .65;
        }

        /* ================================================
           WHAT I BRING
           ================================================ */

        .bring-content {
          max-width: 1000px;
        }

        .bring-intro {
          max-width: 600px;

          margin:
            0 0 80px;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              38px,
              4vw,
              64px
            );

          line-height: 1;

          letter-spacing: -.04em;
        }

        .bring-list {
          border-top:
            1px solid
            rgba(28,45,39,.2);
        }

        .bring-item {
          display: grid;

          grid-template-columns:
            70px 1fr 1fr;

          align-items: center;

          gap: 30px;

          padding: 30px 0;

          border-bottom:
            1px solid
            rgba(28,45,39,.2);

          will-change:
            transform,
            opacity;
        }

        .bring-item span {
          font-size: 10px;

          color: #9E8651;
        }

        .bring-item strong {
          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              24px,
              3vw,
              44px
            );

          font-weight: 400;
        }

        .bring-item p {
          max-width: 320px;

          margin: 0;

          font-size: 12px;

          line-height: 1.7;

          opacity: .6;
        }

        /* ================================================
           SELECTED WORK TRANSITION
           ================================================ */

        .work-transition {
          min-height: 90vh;

          display: flex;

          flex-direction: column;

          justify-content: center;

          padding:
            120px
            8vw;

          background:
            radial-gradient(
              circle at 70% 40%,
              rgba(158,134,81,.12),
              transparent 35%
            ),
            #111815;

          color: #E8E3D9;
        }

        .transition-number {
          color: #9E8651;

          font-size: 10px;

          letter-spacing: .2em;

          margin-bottom: 40px;
        }

        .transition-title {
          display: flex;

          flex-direction: column;

          font-family:
            Georgia,
            serif;

          font-size:
            clamp(
              80px,
              13vw,
              210px
            );

          line-height: .76;

          letter-spacing: -.07em;
        }

        .transition-title em {
          margin-left: 12vw;

          color: #9E8651;

          font-style: italic;
        }

        .transition-line {
          width: 100%;

          height: 1px;

          margin:
            70px
            0
            30px;

          background:
            rgba(232,227,217,.15);
        }

        .work-transition p {
          max-width: 420px;

          margin-left: auto;

          color: #E8E3D9;

          opacity: .55;

          font-size: 12px;

          line-height: 1.8;
        }

        /* ================================================
           RESPONSIVE
           ================================================ */

        @media (max-width: 800px) {

          .top-nav {
            grid-template-columns:
              1fr auto;

            padding: 22px;
          }

          .nav-label {
            display: none;
          }

          .hero-content {
            left: 22px;

            width:
              calc(100% - 44px);
          }

          .hero-content h1 {
            font-size:
              clamp(
                58px,
                17vw,
                110px
              );
          }

          .gold-word {
            margin-left: 8vw;
          }

          .hero-description {
            margin-left: 3vw;

            width:
              min(
                310px,
                75vw
              );
          }

          .hero-bottom {
            margin-left: 3vw;
          }

          .section-light,
          .section-dark {
            padding:
              120px
              22px;
          }

          .section-grid {
            grid-template-columns: 1fr;

            gap: 50px;
          }

          .section-label {
            padding: 0;
          }

          .about-copy h2 {
            /* ONLY CHANGE: slightly reduced mobile size */
            font-size: 48px;
          }

          .approach-card {
            padding: 30px;
          }

          .approach-flow {
            min-height: 330px;

            margin-top: 75px;

            margin-bottom: 60px;
          }

          .flow-step {
            font-size: 52px;
          }

          .flow-arrow {
            height: 50px;

            font-size: 32px;
          }

          .approach-text {
            grid-template-columns: 1fr;

            gap: 10px;
          }

          .bring-item {
            grid-template-columns:
              35px 1fr;

            gap: 15px;
          }

          .bring-item p {
            grid-column: 2;
          }

          .transition-title {
            font-size: 22vw;
          }

        }

      `}</style>

    </main>
  );
}