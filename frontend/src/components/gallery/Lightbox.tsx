import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { Photo } from "@/types/api";

interface LightboxProps {
  photos: Photo[];
  index: number;
  projectName: string;
  open: boolean;
  onClose: () => void;
  onIndexChange: (idx: number) => void;
}

export function Lightbox({
  photos,
  index,
  projectName,
  open,
  onClose,
  onIndexChange,
}: LightboxProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, photos.length, onClose, onIndexChange]);

  const current = photos[index];

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${projectName} photo ${index + 1} of ${photos.length}`}
        >
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white/85 md:p-6">
            <div className="text-xs uppercase tracking-widest2">
              <span className="text-white">{projectName}</span>
              <span className="mx-3 text-white/40">/</span>
              <span>
                {String(index + 1).padStart(2, "0")} —{" "}
                {String(photos.length).padStart(2, "0")}
              </span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={current.url}
              src={current.url}
              alt={`${projectName} — ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[82svh] max-w-[92vw] object-contain shadow-2xl"
            />
          </AnimatePresence>

          {/* Nav */}
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index - 1 + photos.length) % photos.length);
            }}
            className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-white/85 backdrop-blur transition-colors hover:bg-white/10 md:left-6"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index + 1) % photos.length);
            }}
            className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-white/85 backdrop-blur transition-colors hover:bg-white/10 md:right-6"
          >
            <ChevronRight className="size-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
