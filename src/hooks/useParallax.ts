import { useCallback, useEffect, useRef, type RefObject } from "react";
import { revealTransform, type Frame } from "../engine/courtyardGeometry";

interface Options {
  surface: RefObject<HTMLDivElement | null>;
  layer: RefObject<HTMLDivElement | null>;
  frame: Frame | null;
  active: boolean;
  reduced: boolean;
  suspended: boolean;
}

// Updates the DOM only, and stops requesting frames once the view settles.
export function useParallax({ surface, layer, frame, active, reduced, suspended }: Options) {
  const reveal = useRef<(x: number, y: number) => void>(() => undefined);
  const dragged = useRef(false);

  useEffect(() => {
    const surfaceElement = surface.current;
    const layerElement = layer.current;
    if (!surfaceElement || !layerElement || !frame) return;
    let raf = 0;
    const previousTransform = new DOMMatrixReadOnly(getComputedStyle(layerElement).transform);
    let currentX = previousTransform.m41;
    let currentY = previousTransform.m42;
    let targetX = reduced && suspended && active ? currentX : 0;
    let targetY = reduced && suspended && active ? currentY : 0;
    let start: { x: number; y: number; viewX: number } | null = null;
    const clampX = (x: number) => Math.max(
      frame.viewportWidth - frame.width - frame.left,
      Math.min(-frame.left, x),
    );
    const tick = () => {
      currentX += (targetX - currentX) * (reduced ? 1 : 0.1);
      currentY += (targetY - currentY) * (reduced ? 1 : 0.1);
      layerElement.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.08) {
        raf = requestAnimationFrame(tick);
      } else raf = 0;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
    schedule();
    dragged.current = false;
    reveal.current = (x, y) => {
      if (!active || (suspended && !reduced)) return;
      const target = revealTransform(frame, x, y);
      targetX = target.x;
      targetY = target.y;
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (!active || suspended) return;
      if (event.pointerType === "touch" && start) {
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!dragged.current && (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy))) return;
        dragged.current = true;
        targetX = clampX(start.viewX + dx);
        schedule();
      } else if (event.pointerType === "mouse" && !reduced) {
        const bounds = surfaceElement.getBoundingClientRect();
        const nx = (event.clientX - bounds.left) / bounds.width - 0.5;
        const ny = (event.clientY - bounds.top) / bounds.height - 0.5;
        targetX = clampX(-nx * 28);
        targetY = Math.max(frame.viewportHeight - frame.height - frame.top,
          Math.min(-frame.top, -ny * 18));
        schedule();
      }
    };
    const down = (event: PointerEvent) => {
      dragged.current = false;
      if (event.pointerType === "touch") start = { x: event.clientX, y: event.clientY, viewX: targetX };
    };
    const release = () => { start = null; };
    const leave = (event: PointerEvent) => {
      release();
      if (event.pointerType !== "mouse") return;
      targetX = 0;
      targetY = 0;
      schedule();
    };
    surfaceElement.addEventListener("pointermove", move, { passive: true });
    surfaceElement.addEventListener("pointerdown", down, { passive: true });
    surfaceElement.addEventListener("pointerup", release, { passive: true });
    surfaceElement.addEventListener("pointercancel", release, { passive: true });
    surfaceElement.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      reveal.current = () => undefined;
      surfaceElement.removeEventListener("pointermove", move);
      surfaceElement.removeEventListener("pointerdown", down);
      surfaceElement.removeEventListener("pointerup", release);
      surfaceElement.removeEventListener("pointercancel", release);
      surfaceElement.removeEventListener("pointerleave", leave);
    };
  }, [surface, layer, frame, active, reduced, suspended]);

  return {
    revealPoint: useCallback((x: number, y: number) => reveal.current(x, y), []),
    wasDragged: useCallback(() => dragged.current, []),
  };
}
