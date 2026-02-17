"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useScrollLock } from "@/app/hooks/useScrollLock";

/* ── Shared Spotify iFrame API loader ── */
/* eslint-disable @typescript-eslint/no-explicit-any */
let spotifyAPI: any = null;
const pendingCallbacks: (() => void)[] = [];

function ensureSpotifyAPI(callback: () => void) {
  if (spotifyAPI) {
    callback();
    return;
  }

  pendingCallbacks.push(callback);

  // Only load the script once
  if (document.getElementById("spotify-iframe-api")) return;

  (window as any).onSpotifyIframeApiReady = (API: any) => {
    spotifyAPI = API;
    pendingCallbacks.forEach((cb) => cb());
    pendingCallbacks.length = 0;
  };

  const script = document.createElement("script");
  script.id = "spotify-iframe-api";
  script.src = "https://open.spotify.com/embed/iframe-api/v1";
  script.async = true;
  document.body.appendChild(script);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface MusicCardProps {
  album: string;
  artist: string;
  track: string;
  coverUrl: string;
  spotifyTrackId: string;
  spotifyUrl: string;
  index: number;
}

/**
 * MusicCard — B&W album cover that colorizes on hover.
 * Click opens a custom dark modal with play/pause controls.
 * Audio plays via a hidden off-screen Spotify embed (iFrame API).
 * Custom cursor preserved everywhere — no visible iframe in the modal.
 */
const MusicCard = memo(function MusicCard({
  album,
  artist,
  track,
  coverUrl,
  spotifyTrackId,
  spotifyUrl,
  index,
}: MusicCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controllerRef = useRef<any>(null);
  const embedElRef = useRef<HTMLDivElement | null>(null);

  // Create embed container outside React's tree — appended to document.body
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "music-card__embed-container";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    embedElRef.current = el;

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      el.remove();
    };
  }, []);

  // Lock scroll — overflow:hidden on <html> preserves scroll position,
  // avoids Lenis desync that caused scroll-to-top on close.
  useScrollLock(modalOpen, "music-modal-open");

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Initialize the Spotify controller when we first need it
  const initController = useCallback(() => {
    if (controllerRef.current) return;

    setIsLoading(true);

    ensureSpotifyAPI(() => {
      if (!embedElRef.current || controllerRef.current) return;

      spotifyAPI.createController(
        embedElRef.current,
        {
          uri: `spotify:track:${spotifyTrackId}`,
          width: 1,
          height: 1,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (controller: any) => {
          controllerRef.current = controller;

          controller.addListener("ready", () => {
            setIsLoading(false);
            controller.play();
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          controller.addListener("playback_update", (e: any) => {
            setIsPlaying(!e.data.isPaused);
            setProgress(e.data.position);
            setDuration(e.data.duration);
          });
        }
      );
    });
  }, [spotifyTrackId]);

  const handleCardClick = useCallback(() => {
    setModalOpen(true);
    initController();
  }, [initController]);

  const handleTogglePlay = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.togglePlay();
    }
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    // Pause when closing
    if (controllerRef.current && isPlaying) {
      controllerRef.current.pause();
    }
  }, [isPlaying]);

  // Format ms to m:ss
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="relative">
      {/* ── Card ── */}
      <button
        onClick={handleCardClick}
        className={`music-card group w-full text-left ${isPlaying ? "music-card--active" : ""}`}
        data-cursor-hover
        aria-label={`Play ${track} from ${album} by ${artist}`}
      >
        <div className="flex items-start gap-5">
          {/* Album cover */}
          <div className="music-card__cover shrink-0 relative overflow-hidden">
            <Image
              src={coverUrl}
              alt={`${album} — ${artist}`}
              width={72}
              height={72}
              className={`music-card__img object-cover w-full h-full ${isPlaying ? "music-card__img--playing" : ""}`}
              sizes="72px"
            />
            {/* Play overlay */}
            <div className="music-card__play absolute inset-0 flex items-center justify-center">
              {isPlaying ? (
                <div className="flex items-end gap-[3px] h-4">
                  <span className="music-eq-bar" style={{ animationDelay: "0ms" }} />
                  <span className="music-eq-bar" style={{ animationDelay: "150ms" }} />
                  <span className="music-eq-bar" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-md">
                  <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" fill="currentColor" />
                </svg>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="pt-1 min-w-0">
            <span className="font-mono text-[0.55rem] text-neutral-300 tracking-widest uppercase block mb-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4 className="text-[0.95rem] font-bold tracking-tight text-neutral-900 font-[family-name:var(--font-space)] group-hover:text-[var(--accent)] transition-colors duration-300 leading-snug truncate">
              {album}
            </h4>
            <p className="text-sm text-neutral-400 font-mono mt-1 truncate">
              {artist}
            </p>
          </div>
        </div>
      </button>

      {/* ── Player Modal — all custom UI, no visible iframe ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.35, ease: easeOut } }}
              exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
            />

            {/* Dialog */}
            <motion.div
              className="music-player relative"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easeOut } }}
              exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
            >
              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className="music-player__close"
                data-cursor-hover
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>

              {/* Album art — centered */}
              <div className="music-player__cover-wrap">
                <Image
                  src={coverUrl}
                  alt={`${album} — ${artist}`}
                  width={126}
                  height={126}
                  className="music-player__cover-img"
                  sizes="140px"
                />
              </div>

              {/* Track info */}
              <div className="mt-4 text-center">
                <h3 className="text-xs font-bold tracking-tight text-white font-[family-name:var(--font-space)] leading-snug">
                  {track}
                </h3>
                <p className="text-[0.65rem] text-white/35 font-mono mt-0.5">
                  {artist} — {album}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 px-1">
                <div className="music-player__progress-track">
                  <div
                    className="music-player__progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[0.45rem] text-white/20 font-mono">
                    {formatTime(progress)}
                  </span>
                  <span className="text-[0.45rem] text-white/20 font-mono">
                    {duration > 0 ? formatTime(duration) : "--:--"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center mt-3">
                <button
                  onClick={handleTogglePlay}
                  className="music-player__play-btn"
                  data-cursor-hover
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                  ) : isPlaying ? (
                    /* Pause icon */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    /* Play icon */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Spotify link */}
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="music-player__spotify-link"
                data-cursor-hover
              >
                <span className="music-player__spotify-text">Open on Spotify</span>
                <span className="music-player__spotify-arrow">↗</span>
              </a>

              {/* Top-edge highlight */}
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MusicCard;
