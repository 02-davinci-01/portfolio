"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/app/hooks/useScrollLock";

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface BookCardProps {
  title: string;
  author: string;
  note: string;
  coverUrl: string;
  index: number;
}

/* ── Book Modal (matches Section IV DesignModal pattern) ── */
function BookModal({
  title,
  author,
  note,
  coverUrl,
  onClose,
}: {
  title: string;
  author: string;
  note: string;
  coverUrl: string;
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
  useScrollLock(true, "book-modal-open");

  return (
    <motion.div
      className="book-modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35, ease: easeOut } }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      onClick={onClose}
    >
      <motion.div
        className="book-modal__container"
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: easeOut } }}
        exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="book-modal__close"
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

        {/* Left — Cover */}
        <motion.div
          className="book-modal__image-wrap"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
        >
          <Image
            src={coverUrl}
            alt={`Cover of ${title}`}
            width={400}
            height={600}
            className="book-modal__image"
            sizes="(max-width: 640px) 100vw, 200px"
            unoptimized
          />
        </motion.div>

        {/* Right — Details */}
        <motion.div
          className="book-modal__info"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: easeOut }}
        >
          <span className="font-[family-name:var(--font-space)] text-[0.6rem] tracking-[0.3em] uppercase text-neutral-300 mb-2">
            Currently Reading
          </span>
          <h3 className="font-[family-name:var(--font-space)] text-lg font-semibold tracking-tight text-neutral-900">
            {title}
          </h3>
          <p className="text-[0.8rem] text-neutral-400 font-mono mt-1">
            {author}
          </p>
          <div className="w-full h-px bg-neutral-100 mt-5 mb-5" />
          <p className="text-[0.8rem] text-neutral-400 leading-relaxed font-mono italic">
            {note}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * BookCard — B&W cover that colorizes on hover.
 * Click opens a white modal (Section IV style) with cover + details.
 */
const BookCard = memo(function BookCard({
  title,
  author,
  note,
  coverUrl,
  index,
}: BookCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      {/* ── Card ── */}
      <button
        onClick={openModal}
        className="book-card group w-full text-left"
        data-cursor-hover
        aria-label={`View details for ${title} by ${author}`}
      >
        <div className="flex items-start gap-5">
          {/* Cover */}
          <div className="book-card__cover shrink-0 relative overflow-hidden">
            <Image
              src={coverUrl}
              alt={`Cover of ${title}`}
              width={60}
              height={90}
              className="book-card__img object-cover w-full h-full"
              sizes="60px"
              unoptimized
            />
          </div>

          {/* Info */}
          <div className="pt-1 min-w-0">
            <span className="font-mono text-[0.55rem] text-neutral-300 tracking-widest uppercase block mb-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4 className="text-[0.95rem] font-bold tracking-tight text-neutral-900 font-[family-name:var(--font-space)] group-hover:text-[var(--accent)] transition-colors duration-300 leading-snug">
              {title}
            </h4>
            <p className="text-sm text-neutral-400 font-mono mt-1">
              {author}
            </p>
          </div>
        </div>
      </button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <BookModal
            key={title}
            title={title}
            author={author}
            note={note}
            coverUrl={coverUrl}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default BookCard;
