"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "./components/RevealOnScroll";
import SplitText from "./components/SplitText";
import ScrambleText from "./components/ScrambleText";
import MagneticLink from "./components/MagneticLink";
import CustomCursor from "./components/CustomCursor";
import GrainOverlay from "./components/GrainOverlay";
import MarqueeStrip from "./components/MarqueeStrip";
import SectionHeading from "./components/SectionHeading";
import FlowDiagram from "./components/FlowDiagram";
import DesignGallery from "./components/DesignGallery";
import BookCard from "./components/BookCard";
import MusicCard from "./components/MusicCard";

const CraftRedbull = dynamic(
  () => import("./components/CraftRedbull"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

const JourneyComputer = dynamic(
  () => import("./components/JourneyComputer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

const PabulumHelmet = dynamic(
  () => import("./components/PabulumHelmet"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

const OperaDaVinci = dynamic(
  () => import("./components/OperaDaVinci"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

const NexusDog = dynamic(
  () => import("./components/NexusDog"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[340px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

const DostoevskyBust = dynamic(
  () => import("./components/DostoevskyBust"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-neutral-50/30 animate-pulse rounded-lg" />
    ),
  }
);

/* ── 02-rBOR Architecture Diagram Data ── */
const rborNodes = [
  { id: "entry",      label: "Feature Entry",    sublabel: "index.tsx",       x: 280, y: 12,  width: 160, height: 44 },
  { id: "components", label: "UI Components",    sublabel: "pure / leaf",     x: 80,  y: 82,  width: 160, height: 44 },
  { id: "view",       label: "Feature View",     sublabel: "container",       x: 380, y: 82,  width: 160, height: 44 },
  { id: "controller", label: "Controller Hook",  sublabel: "orchestrate",     x: 270, y: 168, width: 180, height: 44 },
  { id: "data",       label: "Data Hooks",       sublabel: "rq / redux",      x: 280, y: 258, width: 160, height: 44 },
  { id: "domain",     label: "Domain Logic",     sublabel: "react-free",      x: 280, y: 328, width: 160, height: 44 },
  { id: "service",    label: "Service Factory",  sublabel: "axios instance",  x: 270, y: 408, width: 180, height: 44 },
];

const rborEdges = [
  { from: "entry", to: "view" },
  { from: "entry", to: "components" },
  { from: "view", to: "controller" },
  { from: "controller", to: "data" },
  { from: "data", to: "domain" },
  { from: "domain", to: "service" },
];

const rborLayers = [
  { label: "Presentation", y: 140 },
  { label: "Orchestration", y: 230 },
  { label: "Data", y: 380 },
  { label: "Infra", y: 460 },
];

/* ── 1-byte P2P Architecture Diagram Data ── */
/* Layout: Peer A (left) ←→ Signal Server (center-top) ←→ Peer B (right)
   Protocol stack centered between peers — shows true P2P topology */
const oneByteNodes = [
  { id: "peerA",    label: "Peer A",         sublabel: "sender",       x: 30,  y: 28,  width: 140, height: 55, icon: "client" as const },
  { id: "signal",   label: "Signal Server",  sublabel: "nestjs + ws",  x: 265, y: 22,  width: 190, height: 50, icon: "server" as const },
  { id: "peerB",    label: "Peer B",         sublabel: "receiver",     x: 550, y: 28,  width: 140, height: 55, icon: "client" as const },
  { id: "exchange", label: "SDP / ICE",      sublabel: "negotiation",  x: 270, y: 190, width: 180, height: 44 },
  { id: "channel",  label: "DataChannel",    sublabel: "webrtc p2p",   x: 245, y: 280, width: 230, height: 44 },
  { id: "transfer", label: "File Transfer",  sublabel: "chunked",      x: 270, y: 370, width: 180, height: 44 },
];

const oneByteEdges = [
  /* Signaling: both peers connect to server via WS (horizontal) */
  { from: "peerA",    to: "signal",   label: "ws",          fromAnchor: "right" as const, toAnchor: "left"  as const },
  { from: "signal",   to: "peerB",    label: "ws",          fromAnchor: "right" as const, toAnchor: "left"  as const },
  /* Direct P2P: both peers participate in negotiation */
  { from: "peerA",    to: "exchange",                       fromAnchor: "bottom" as const, toAnchor: "left"  as const },
  { from: "peerB",    to: "exchange",                       fromAnchor: "bottom" as const, toAnchor: "right" as const },
  /* Protocol stack — flows between peers */
  { from: "exchange", to: "channel",  label: "direct link" },
  { from: "channel",  to: "transfer", label: "chunks" },
];

const oneByteLayers = [
  { label: "Signaling",  y: 100 },
  { label: "Negotiation", y: 172 },
  { label: "Transport",  y: 260 },
];

/* ── Mo Money Architecture Diagram Data ── */
const moMoneyNodes = [
  { id: "login",     label: "Login Page",     sublabel: "html / js",    x: 120, y: 15,  width: 150, height: 44, icon: "client" as const },
  { id: "dashboard", label: "Dashboard",      sublabel: "html / js",    x: 450, y: 15,  width: 150, height: 44, icon: "client" as const },
  { id: "router",    label: "Express API",    sublabel: "routes + jwt", x: 260, y: 112, width: 200, height: 50, icon: "server" as const },
  { id: "auth",      label: "Auth",           sublabel: "jwt guard",    x: 60,  y: 215, width: 140, height: 44 },
  { id: "user",      label: "User",           sublabel: "crud",         x: 290, y: 215, width: 140, height: 44 },
  { id: "movements", label: "Movements",      sublabel: "transfers",    x: 520, y: 215, width: 140, height: 44 },
  { id: "mongo",     label: "MongoDB Atlas",  sublabel: "cloud db",     x: 265, y: 330, width: 190, height: 50, icon: "database" as const },
];

const moMoneyEdges = [
  { from: "login",     to: "router", label: "post" },
  { from: "dashboard", to: "router", label: "get" },
  { from: "router",    to: "auth",       curveOffset: -15 },
  { from: "router",    to: "user" },
  { from: "router",    to: "movements",  curveOffset: 15 },
  { from: "auth",      to: "mongo",      curveOffset: -25 },
  { from: "user",      to: "mongo" },
  { from: "movements", to: "mongo",      curveOffset: 25 },
];

const moMoneyLayers = [
  { label: "Frontend",    y: 85 },
  { label: "API Layer",   y: 190 },
  { label: "Persistence", y: 310 },
];

const StatueViewer = dynamic(() => import("./components/StatueViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-50/30 animate-pulse rounded-lg" />
  ),
});

const useStatueHover = () => {
  const [hovered, setHovered] = useState(false);
  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);
  return { hovered, onEnter, onLeave };
};

/* ─── Divider ──────────────────────────────────────────────────── */
function Divider() {
  return <div className="section-divider mx-8 md:mx-16 lg:mx-24" />;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const statueHover = useStatueHover();
  const dostoevskyHover = useStatueHover();

  const navItems = [
    { label: "Opera", href: "#opera", hint: "Works" },
    { label: "Iter", href: "#iter", hint: "Journey" },
    { label: "Artificium", href: "#artificium", hint: "Craft" },
    { label: "Afflatus", href: "#afflatus", hint: "Inspiration" },
    { label: "Nexus", href: "#nexus", hint: "Connect" },
  ];

  /* ── Active section tracking ── */
  const [activeSection, setActiveSection] = useState<string>("");
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ── Show navbar after scrolling past hero, hide at closing section ── */
  useEffect(() => {
    const handleScroll = () => {
      const closingEl = document.getElementById("closing");
      const pastHero = window.scrollY > window.innerHeight * 0.6;
      const atClosing = closingEl
        ? closingEl.getBoundingClientRect().top < window.innerHeight * 0.5
        : false;
      setNavVisible(pastHero && !atClosing);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      <CustomCursor />
      <GrainOverlay />

      {/* ── BOTTOM GLASS NAV ── */}
      <AnimatePresence>
        {navVisible && (
          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="bottom-nav"
          >
            <motion.div
              className="bottom-nav__inner"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
              }}
            >
              {navItems.map((item) => {
                const id = item.href.replace("#", "");
                const isActive = activeSection === id;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    data-cursor-hover
                    className={`bottom-nav__link${
                      isActive ? " bottom-nav__link--active" : ""
                    }`}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -2 }}
                  >
                    <span className="bottom-nav__hint">{item.hint}</span>
                    {item.label}
                    {isActive && (
                      <motion.span
                        className="bottom-nav__indicator"
                        layoutId="nav-indicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Left vertical side line + label */}
      <motion.div
        className="side-rule"
        initial={{ opacity: 0 }}
        animate={{ opacity: navVisible ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <span className="side-rule__text">Portfolio</span>
        <span className="side-rule__line" />
        <span className="side-rule__text">MMXXVI</span>
      </motion.div>

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 mix-blend-difference">
        <span className="text-xs font-mono tracking-[0.4em] uppercase text-white">
          V.N.
        </span>
        <span className="text-xs font-mono tracking-[0.3em] uppercase text-white/50">
          MMXXVI
        </span>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
         I. PRINCIPIUM — The Beginning (Hero / Intro)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col justify-end pb-16 px-8 md:px-16 lg:px-24">
        {/* 3D statue — centered-right, hover reveals archaic resume dialog */}
        <div className="absolute inset-0 flex items-end justify-center md:justify-end pointer-events-none">
          <div className="w-[80vw] h-[85vh] md:w-[55vw] md:h-[95vh] md:-translate-x-[3vw]">
            <StatueViewer hovered={statueHover.hovered} />
          </div>
        </div>

        {/* Invisible right-half hover zone — covers entire right 50% of hero */}
        <div
          className="absolute top-0 right-0 bottom-0 hidden md:block"
          style={{ width: '50%', zIndex: 16 }}
          onMouseEnter={statueHover.onEnter}
          onMouseLeave={statueHover.onLeave}
        />

        {/* Hero text */}
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[0.55rem] tracking-[0.4em] uppercase text-neutral-400 mb-5">
              I like to make stuff :)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900 font-[family-name:var(--font-jetbrains)]">
              <ScrambleText
                defaultText="02-davinci-01"
                revealText="Vedant Nagwanshi"
                charSpeed={25}
              />
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[0.6rem] font-mono leading-relaxed text-neutral-400 mt-8 max-w-sm">
              &ldquo;One must imagine Sisyphus happy as he taps on the keyboard.&rdquo;
            </p>
          </motion.div>


        </div>

        {/* Mobile fallback — CRT terminal below hero text */}
        <div className="md:hidden mt-6 relative z-10">
          <RevealOnScroll delay={0.8}>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-[var(--accent)] transition-colors duration-300"
            >
              <span className="w-6 h-px bg-neutral-300" />
              resume.exe → download
            </a>
          </RevealOnScroll>
        </div>

        {/* Scroll indicator */}
        <RevealOnScroll
          delay={1.0}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[0.55rem] tracking-[0.4em] uppercase text-neutral-300">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-neutral-300 to-transparent" />
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Marquee ── */}
      <MarqueeStrip
        words={[
          "Next.js",
          "React",
          "Three.js",
          "TypeScript",
          "WebGL",
          "Node.js",
          "Creative Dev",
          "UI/UX",
        ]}
        className="py-6 border-y border-neutral-100"
      />

      {/* ═══════════════════════════════════════════════════════════════
         II. OPERA — Works (Projects)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="opera"
        className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24"
      >
        {/* 3D Da Vinci bust — positioned right, mirroring Journey/Craft sections */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[45%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '2rem' }}>
          <div className="w-[60%] h-[65%] max-h-[460px]">
            <OperaDaVinci />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 mb-32">
            <div className="md:col-span-4">
              <RevealOnScroll>
                <SectionHeading
                  latin="Opera"
                  english="Works"
                  index="II"
                />
              </RevealOnScroll>
            </div>
          </div>

          {/* Project cards */}
          <div className="space-y-24 md:space-y-32">
            {/* Project 1 — 1-byte */}
            <RevealOnScroll>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 relative overflow-hidden bg-white aspect-[16/10] flex items-center justify-center border border-neutral-100 hover:border-neutral-300 transition-colors duration-500 p-4 md:p-6">
                  <FlowDiagram
                    nodes={oneByteNodes}
                    edges={oneByteEdges}
                    layers={oneByteLayers}
                    width={720}
                    height={420}
                    showGrid
                  />

                  {/* Corner brackets — blueprint framing */}
                  <div className="absolute top-3 left-3 w-3.5 h-3.5 border-l border-t border-neutral-300/50" />
                  <div className="absolute top-3 right-3 w-3.5 h-3.5 border-r border-t border-neutral-300/50" />
                  <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-l border-b border-neutral-300/50" />
                  <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-r border-b border-neutral-300/50" />

                  <div className="absolute top-3.5 right-5 font-mono text-[0.45rem] tracking-[0.3em] uppercase text-neutral-300">
                    P2P Architecture
                  </div>

                  <div className="absolute bottom-4 left-5 font-mono text-[0.55rem] tracking-[0.25em] uppercase text-neutral-300">
                    01
                  </div>
                </div>
                <div className="md:col-span-4 md:col-start-9 space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:tracking-normal transition-all duration-500 font-[family-name:var(--font-space)]">
                    1-byte
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                    Browser-based peer-to-peer file sharing. WebRTC DataChannels
                    for direct transfer, NestJS for signaling — no file data
                    ever touches the server.
                  </p>
                  <span className="inline-block font-mono text-[0.6rem] tracking-[0.3em] uppercase text-neutral-300 pt-2">
                    WebRTC — NestJS — TypeScript
                  </span>
                </div>
              </div>
            </RevealOnScroll>

            {/* Project 2 — 02-rBOR (reversed) */}
            <RevealOnScroll>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 space-y-3 md:text-right order-2 md:order-1">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:tracking-normal transition-all duration-500 font-[family-name:var(--font-space)]">
                    02-rBOR
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                    A frontend philosophy — recursive Bifurcate, Orchestrate,
                    Render. Clean Architecture for React that fans complexity
                    outward, never inward.
                  </p>
                  <span className="inline-block font-mono text-[0.6rem] tracking-[0.3em] uppercase text-neutral-300 pt-2">
                    React — Clean Architecture — DDD
                  </span>
                  <div className="pt-2">
                    <a
                      href="https://github.com/02-davinci-01/02-rBOR"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-[var(--accent)] transition-colors duration-300"
                      data-cursor-hover
                    >
                      View on GitHub
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M3 9L9 3M9 3H4M9 3V8" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="md:col-span-7 md:col-start-6 relative overflow-hidden bg-white aspect-[16/10] flex items-center justify-center border border-neutral-100 hover:border-neutral-300 transition-colors duration-500 p-4 md:p-6 order-1 md:order-2">
                  <FlowDiagram
                    nodes={rborNodes}
                    edges={rborEdges}
                    layers={rborLayers}
                    width={720}
                    height={480}
                    showGrid
                  />

                  <div className="absolute top-3 left-3 w-3.5 h-3.5 border-l border-t border-neutral-300/50" />
                  <div className="absolute top-3 right-3 w-3.5 h-3.5 border-r border-t border-neutral-300/50" />
                  <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-l border-b border-neutral-300/50" />
                  <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-r border-b border-neutral-300/50" />

                  <div className="absolute top-3.5 right-5 font-mono text-[0.45rem] tracking-[0.3em] uppercase text-neutral-300">
                    Dependency Graph
                  </div>

                  <div className="absolute bottom-4 right-5 font-mono text-[0.55rem] tracking-[0.25em] uppercase text-neutral-300">
                    02
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Project 3 — mo-money */}
            <RevealOnScroll>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 relative overflow-hidden bg-white aspect-[16/10] flex items-center justify-center border border-neutral-100 hover:border-neutral-300 transition-colors duration-500 p-4 md:p-6">
                  <FlowDiagram
                    nodes={moMoneyNodes}
                    edges={moMoneyEdges}
                    layers={moMoneyLayers}
                    width={720}
                    height={400}
                    showGrid
                  />

                  <div className="absolute top-3 left-3 w-3.5 h-3.5 border-l border-t border-neutral-300/50" />
                  <div className="absolute top-3 right-3 w-3.5 h-3.5 border-r border-t border-neutral-300/50" />
                  <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-l border-b border-neutral-300/50" />
                  <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-r border-b border-neutral-300/50" />

                  <div className="absolute top-3.5 right-5 font-mono text-[0.45rem] tracking-[0.3em] uppercase text-neutral-300">
                    System Architecture
                  </div>

                  <div className="absolute bottom-4 left-5 font-mono text-[0.55rem] tracking-[0.25em] uppercase text-neutral-300">
                    03
                  </div>
                </div>
                <div className="md:col-span-4 md:col-start-9 space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:tracking-normal transition-all duration-500 font-[family-name:var(--font-space)]">
                    mo-money
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                    Modern banking application with real-time transactions,
                    JWT authentication, and account management. Full-stack
                    with Express and MongoDB Atlas.
                  </p>
                  <span className="inline-block font-mono text-[0.6rem] tracking-[0.3em] uppercase text-neutral-300 pt-2">
                    Node.js — Express — MongoDB
                  </span>
                  <div className="pt-2">
                    <a
                      href="https://github.com/02-davinci-01/mo-money"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-[var(--accent)] transition-colors duration-300"
                      data-cursor-hover
                    >
                      View on GitHub
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M3 9L9 3M9 3H4M9 3V8" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════
         III. ITER — The Journey (Experience)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="iter"
        className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24"
      >
        {/* 3D computer — positioned right, elevated like the hero statue */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[55%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '4rem' }}>
          <div className="w-[70%] h-[80%] max-h-[600px]">
            <JourneyComputer />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-32">
            <RevealOnScroll>
              <SectionHeading
                latin="Iter"
                english="The Journey"
                index="III"
              />
            </RevealOnScroll>
          </div>

          {/* Experience timeline */}
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-0 md:left-[8.33%] top-0 bottom-0 w-px bg-neutral-200 hidden md:block" />

            <div className="space-y-16 md:space-y-20">
              {/* Experience 1 */}
              <RevealOnScroll>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                  <div className="md:col-span-1 flex items-start justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-neutral-900 mt-2 hidden md:block relative z-10" />
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-neutral-400">
                      2025 — Present
                    </span>
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-[family-name:var(--font-space)]">
                      Software Engineer
                    </h3>
                    <p className="text-sm font-mono text-[var(--accent)] tracking-wide">
                      AceCloud
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed font-mono pt-2 max-w-lg">
                      Working on Infrastructure as Code, DBaaS, and Registry as a Service.
                      Cloud solutions for the masses.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Experience 2 */}
              <RevealOnScroll delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                  <div className="md:col-span-1 flex items-start justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-neutral-300 mt-2 hidden md:block relative z-10" />
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-neutral-400">
                      May — Jul 2024
                    </span>
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-[family-name:var(--font-space)]">
                      SDE Intern
                    </h3>
                    <p className="text-sm font-mono text-[var(--accent)] tracking-wide">
                      Office Banao
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed font-mono pt-2 max-w-lg">
                      Developed the frontend architecture for a real-estate startup,
                      while driving content and design initiatives.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Experience 3 */}
              <RevealOnScroll delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                  <div className="md:col-span-1 flex items-start justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-neutral-300 mt-2 hidden md:block relative z-10" />
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-neutral-400">
                      2023 — Present
                    </span>
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-[family-name:var(--font-space)]">
                      Founding Member
                    </h3>
                    <p className="text-sm font-mono text-[var(--accent)] tracking-wide">
                      Geek Room
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed font-mono pt-2 max-w-lg">
                      Built one of the largest technical communities in India with over 80k members.
                      Lead the Design and Documentation department across 20+ chapters.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════
         IV. ARTIFICIUM — Craft (Design Philosophy)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="artificium"
        className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24"
      >
        {/* 3D redbull — positioned right, mirroring the Journey section */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[45%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '6rem' }}>
          <div className="w-[50%] h-[55%] max-h-[380px]">
            <CraftRedbull />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-32">
            <RevealOnScroll>
              <SectionHeading
                latin="Artificium"
                english="Craft"
                index="IV"
              />
            </RevealOnScroll>
          </div>

          {/* Design gallery */}
          <RevealOnScroll delay={0.25}>
            <DesignGallery />
          </RevealOnScroll>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════
         V. AFFLATUS — Inspiration (Books & Music)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="afflatus"
        className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24"
      >
        {/* 3D Helmet — positioned right, contained to heading area */}
        <div className="absolute top-0 right-0 w-full md:w-[45%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '6rem', height: '480px' }}>
          <div className="w-[50%] h-[80%] max-h-[380px]">
            <PabulumHelmet />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-[20]">
          <div className="mb-32">
            <RevealOnScroll>
              <SectionHeading
                latin="Afflatus"
                english="Inspiration"
                index="V"
              />
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {/* Books column */}
            <div className="flex flex-col">
              <RevealOnScroll>
                <h3 className="font-[family-name:var(--font-space)] text-xs tracking-[0.3em] uppercase text-neutral-400 mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-neutral-300" />
                  Currently Reading
                </h3>
              </RevealOnScroll>

              <div className="flex flex-col justify-between flex-1">
                {[
                  {
                    title: "The Three-Body Problem",
                    author: "Cixin Liu",
                    note: "Currently reading it. If the universe is a dark forest how would you signal that you are a peaceful civilization?",
                    coverUrl: "/book-cover/Death's End by Cixin Liu.jpg",
                  },
                  {
                    title: "Memories, Dreams, Reflections",
                    author: "Carl Jung",
                    note: "\"Non foras ire in interiorie homine habitat veritas.\" Quite an interesting read, with lots of alchemical references.",
                    coverUrl: "/book-cover/Memories, Dreams, Reflections by Carl Jung.jpg",
                  },
                  {
                    title: "The Empusium",
                    author: "Olga Tokarczuk",
                    note: "A bit of a slow burn. On the relation of humans and nature, and the personification of exploitation. Slightly tedious.",
                    coverUrl: "/book-cover/The Empusium by Olga Tokarczuk.jpg",
                  },
                ].map((book, i) => (
                  <RevealOnScroll key={book.title} delay={i * 0.1}>
                    <BookCard
                      title={book.title}
                      author={book.author}
                      note={book.note}
                      coverUrl={book.coverUrl}
                      index={i}
                    />
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            {/* Music column */}
            <div className="flex flex-col">
              <RevealOnScroll>
                <h3 className="font-[family-name:var(--font-space)] text-xs tracking-[0.3em] uppercase text-neutral-400 mb-8 flex items-center gap-3">
                  <span className="w-8 h-px bg-neutral-300" />
                  On Repeat
                </h3>
              </RevealOnScroll>

              <div className="flex flex-col justify-between flex-1">
                {[
                  {
                    album: "Velocity : Design : Comfort",
                    artist: "Sweet Trip",
                    track: "Dsco",
                    coverUrl: "/album-art/velocity-design-comfort.jpg",
                    spotifyTrackId: "1OKkG3vxEuBBwLw1gCqdNW",
                    spotifyUrl: "https://open.spotify.com/track/1OKkG3vxEuBBwLw1gCqdNW",
                  },
                  {
                    album: "Yeezus",
                    artist: "Kanye West",
                    track: "On Sight",
                    coverUrl: "/album-art/yeezus.jpg",
                    spotifyTrackId: "1gqkRc9WtOpnGIqxf2Hvzr",
                    spotifyUrl: "https://open.spotify.com/track/1gqkRc9WtOpnGIqxf2Hvzr",
                  },
                  {
                    album: "Kid A",
                    artist: "Radiohead",
                    track: "Motion Picture Soundtrack",
                    coverUrl: "/album-art/kid-a.jpg",
                    spotifyTrackId: "4SrRrB27n7fiRkQcPoKfpk",
                    spotifyUrl: "https://open.spotify.com/track/4SrRrB27n7fiRkQcPoKfpk",
                  },
                  {
                    album: "Avanti",
                    artist: "Alessandro Cortini",
                    track: "Avanti",
                    coverUrl: "/album-art/avanti.jpg",
                    spotifyTrackId: "5EVaeRCaBAOdbsChFHOiS4",
                    spotifyUrl: "https://open.spotify.com/track/5EVaeRCaBAOdbsChFHOiS4",
                  },
                ].map((item, i) => (
                  <RevealOnScroll key={item.album} delay={i * 0.1}>
                    <MusicCard
                      album={item.album}
                      artist={item.artist}
                      track={item.track}
                      coverUrl={item.coverUrl}
                      spotifyTrackId={item.spotifyTrackId}
                      spotifyUrl={item.spotifyUrl}
                      index={i}
                    />
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <MarqueeStrip
        words={[
          "Open to Collaborations",
          "Let\u2019s Build Something",
          "Available for Projects",
          "Reach Out",
        ]}
        reverse
        className="py-6 border-y border-neutral-100"
      />

      {/* ═══════════════════════════════════════════════════════════════
         VI. NEXUS — Connection (Let's Connect)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="nexus"
        className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24"
      >
        {/* 3D Dog — positioned right, mirroring other section models */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[50%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '1rem' }}>
          <div className="w-[75%] h-[65%] max-h-[480px]">
            <NexusDog />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4">
            <div className="md:col-span-4">
              <RevealOnScroll>
                <SectionHeading
                  latin="Nexus"
                  english="Connect"
                  index="VI"
                />
              </RevealOnScroll>
            </div>
          </div>

          <div className="md:max-w-[50%] space-y-10 pt-24 md:pt-32">
              <RevealOnScroll delay={0.15}>
                <p className="text-base leading-relaxed text-neutral-400 max-w-md font-mono">
                  I love to sleep and I love dogs too :p
                </p>
                <p className="text-base leading-relaxed text-neutral-400 max-w-md font-mono mt-2">
                  Drop in a message!!
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.25}>
                <div className="flex items-center gap-6 pt-4">
                  <div className="w-12 h-px bg-neutral-300" />
                  <MagneticLink
                    href="mailto:vedant@example.com"
                    className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
                  >
                    Email
                  </MagneticLink>
                  <MagneticLink
                    href="https://github.com/vedant-nagwanshi"
                    className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
                  >
                    GitHub
                  </MagneticLink>
                  <MagneticLink
                    href="https://linkedin.com/in/vedant-nagwanshi"
                    className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
                  >
                    LinkedIn
                  </MagneticLink>
                </div>
              </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         DIVINE HERMIT — Dostoevsky closing piece (final viewport)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="closing"
        className="relative flex flex-col justify-end overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* 3D Bust — detached from text, positioned to section directly */}
        <div
          className="absolute z-10 left-1/2 bottom-0 pointer-events-auto"
          style={{
            width: '60vw',
            height: '100vh',
            transform: 'translateX(-50%) translateY(calc(5% - 30px))',
          }}
          onMouseEnter={dostoevskyHover.onEnter}
          onMouseLeave={dostoevskyHover.onLeave}
        >
          <DostoevskyBust hovered={dostoevskyHover.hovered} />
        </div>

        {/* DIVINE HERMIT text — independent of 3D render */}
        <motion.div
          className="w-full px-6 md:px-12 lg:px-20 pb-0 relative z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-end justify-between select-none">
            <span className="font-mono text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter text-neutral-900 leading-none">
              divine
            </span>

            {/* Spacer — holds the gap where the statue visually sits */}
            <div className="flex-shrink-0 w-[160px] md:w-[220px] lg:w-[280px]" />

            <span className="font-mono text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter text-neutral-900 leading-none">
              hermit
            </span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
