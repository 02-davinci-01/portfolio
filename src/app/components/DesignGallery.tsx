"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/app/hooks/useScrollLock";

/* ── Design data ── */
interface DesignItem {
  src: string;
  title: string;
  year: string;
  description: string;
}

const designs: DesignItem[] = [
  {
    src: "/designs/god's_theme_edited.png",
    title: "God's Theme",
    year: "2025",
    description:
      "\"I try hard as I can to understand life through god\" — Ayrton Senna",
  },
  {
    src: "/designs/drop_fruit.png",
    title: "Drop Fruit",
    year: "2024",
    description:
      "After one of my favorite films of all time. Rock paper scissors with a pond.",
  },
  {
    src: "/designs/AEDIS.png",
    title: "AEDIS",
    year: "2023",
    description:
      "A little temple made from scraps. A man can make his own rituals after all.",
  },
  {
    src: "/designs/jesus_is_king.png",
    title: "Jesus Is King",
    year: "2023",
    description:
      "One of my earliest works. Saw it in my dream :)",
  },
  {
    src: "/designs/f_l_w_u.png",
    title: "F.L.W.U.",
    year: "2025",
    description:
      "\"Mio Dio, mio Dio, perché mi hai abbandonato?\" — Ralph Fiennes, Conclave 2025",
  },
  {
    src: "/designs/SADVILLAIN.png",
    title: "SADVILLAIN",
    year: "2023",
    description:
      "\"Living off borrowed time the clock ticks faster\" — MF\u00A0DOOM",
  },
];

/* ── Easing ── */
const easeOut = [0.16, 1, 0.3, 1] as const;

/* ── Design Card ── */
const DesignCard = memo(function DesignCard({
  item,
  index,
  onOpen,
}: {
  item: DesignItem;
  index: number;
  onOpen: (item: DesignItem) => void;
}) {
  return (
    <motion.button
      className="design-card group relative overflow-hidden text-left w-full"
      onClick={() => onOpen(item)}
      data-cursor-hover
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: easeOut }}
      aria-label={`View ${item.title}`}
    >
      {/* Image container */}
      <div className="design-card__image-wrap relative aspect-square overflow-hidden">
        <Image
          src={item.src}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="design-card__image object-cover"
          quality={85}
        />

        {/* Hover overlay */}
        <div className="design-card__overlay absolute inset-0 flex flex-col justify-end p-4">
          <span className="font-mono text-[0.5rem] tracking-[0.4em] uppercase text-white/70">
            {item.year}
          </span>
          <span className="font-[family-name:var(--font-space)] text-sm font-semibold text-white tracking-tight mt-0.5">
            {item.title}
          </span>
        </div>

        {/* Corner index marker */}
        <div className="absolute top-3 right-3 font-mono text-[0.5rem] tracking-[0.3em] text-neutral-400/0 group-hover:text-white/50 transition-colors duration-500">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Click prompt — appears on hover */}
        <div className="design-card__prompt absolute top-1/2 left-1/2">
          <div className="design-card__prompt-circle">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            >
              <path d="M7 3v8M3 7h8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title below the image */}
      <div className="mt-3 px-0.5">
        <h4 className="font-[family-name:var(--font-space)] text-sm font-semibold tracking-tight text-neutral-900 group-hover:text-[var(--accent)] transition-colors duration-300">
          {item.title}
        </h4>
        <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-neutral-300">
          {item.year}
        </span>
      </div>
    </motion.button>
  );
});

/* ── Design Modal ── */
function DesignModal({
  item,
  onClose,
}: {
  item: DesignItem;
  onClose: () => void;
}) {
  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock scroll — overflow:hidden on <html> preserves scroll position,
  // avoids Lenis desync that caused scroll-to-top on close.
  useScrollLock(true, "design-modal-open");

  return (
    <motion.div
      className="design-modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35, ease: easeOut } }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      onClick={onClose}
    >
      <motion.div
        className="design-modal__container"
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: easeOut } }}
        exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="design-modal__close"
          data-cursor-hover
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </motion.button>

        {/* Left — Image */}
        <motion.div
          className="design-modal__image-wrap"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            className="design-modal__image"
          />
        </motion.div>

        {/* Right — Description */}
        <motion.div
          className="design-modal__info"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: easeOut }}
        >
          <span className="font-[family-name:var(--font-space)] text-[0.6rem] tracking-[0.3em] uppercase text-neutral-300 mb-2">
            {item.year}
          </span>
          <h3 className="font-[family-name:var(--font-space)] text-lg font-semibold tracking-tight text-neutral-900">
            {item.title}
          </h3>
          <div className="w-full h-px bg-neutral-100 mt-5 mb-5" />
          <p className="text-[0.8rem] text-neutral-400 leading-relaxed font-mono italic">
            {item.description}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── Gallery ── */
const DesignGallery = memo(function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null);
  const handleOpen = useCallback((item: DesignItem) => setSelectedDesign(item), []);
  const handleClose = useCallback(() => setSelectedDesign(null), []);

  return (
    <>
      {/* Grid */}
      <div className="design-gallery">
        {designs.map((item, i) => (
          <DesignCard key={item.src} item={item} index={i} onOpen={handleOpen} />
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <DesignModal
            key={selectedDesign.src}
            item={selectedDesign}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default DesignGallery;
