"use client";
import { useRef, useEffect, useCallback } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum px to register a swipe
  maxAngle?: number;  // max deviation from horizontal (deg)
  enabled?: boolean;
}

/**
 * Pointer-based swipe detector. Attaches to a single element ref.
 * Used by the mobile drawer to close on swipe-left.
 */
export function useSwipe<T extends HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  maxAngle = 30,
  enabled = true,
}: SwipeOptions) {
  const ref = useRef<T | null>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onStart = useCallback((e: PointerEvent) => {
    if (e.pointerType === "mouse") return; // touch / pen only
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  const onEnd = useCallback(
    (e: PointerEvent) => {
      if (!startRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      startRef.current = null;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < threshold) return;
      const angle = Math.atan2(absDy, absDx) * (180 / Math.PI);
      if (angle > maxAngle) return;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    [onSwipeLeft, onSwipeRight, threshold, maxAngle],
  );

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    el.addEventListener("pointerdown", onStart, { passive: true });
    el.addEventListener("pointerup", onEnd, { passive: true });
    el.addEventListener("pointercancel", () => (startRef.current = null), { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onStart);
      el.removeEventListener("pointerup", onEnd);
    };
  }, [enabled, onStart, onEnd]);

  return ref;
}
