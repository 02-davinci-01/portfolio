"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins once — import from this module everywhere
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Global defaults matching DESIGN.md §5
// "power3.out" ≈ cubic-bezier(0.16, 1, 0.3, 1)
gsap.defaults({
  ease: "power3.out",
  duration: 0.6,
});

export { gsap, ScrollTrigger, useGSAP };
