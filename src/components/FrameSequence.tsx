import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { frames, frameAt } from "../engine/sequence";
import { assets } from "../engine/sceneManifest";
export interface SequenceHandle {
  render: (progress: number) => void;
}
export const FrameSequence = forwardRef<SequenceHandle, { reduced: boolean }>(
  ({ reduced }, ref) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const displayed = useRef<HTMLImageElement | null>(null);
    const progress = useRef(0);
    const render = useRef<(p: number) => void>(() => {});
    const [failed, setFailed] = useState(false);
    useImperativeHandle(
      ref,
      () => ({
        render: (p) => {
          progress.current = p;
          render.current(p);
        },
      }),
      [],
    );
    useEffect(() => {
      let active = true,
        wanted = 0,
        last: HTMLImageElement | null = displayed.current,
        running = 0;
      const cache = new Map<number, HTMLImageElement>();
      const pending = new Set<number>();
      const errors = new Set<number>();
      const draw = (image: HTMLImageElement) => {
        const c = canvas.current;
        if (!c) return;
        const box = c.getBoundingClientRect();
        const dpr = Math.min(devicePixelRatio, 1.5);
        c.width = Math.round(box.width * dpr);
        c.height = Math.round(box.height * dpr);
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const scale = Math.max(c.width / image.width, c.height / image.height);
        ctx.drawImage(
          image,
          (c.width - image.width * scale) / 2,
          (c.height - image.height * scale) / 2,
          image.width * scale,
          image.height * scale,
        );
        last = image;
        displayed.current = image;
      };
      const load = (index: number) => {
        if (
          index < 0 ||
          index >= frames.length ||
          cache.has(index) ||
          pending.has(index) ||
          errors.has(index) ||
          running >= 4
        )
          return;
        pending.add(index);
        running++;
        const image = new Image();
        image.src = frames[index].url;
        void image
          .decode()
          .then(() => {
            if (!active) return;
            cache.set(index, image);
            if (index === wanted || !last) draw(image);
            while (cache.size > 20) {
              const oldest = [...cache.keys()].sort(
                (a, b) => Math.abs(b - wanted) - Math.abs(a - wanted),
              )[0];
              cache.delete(oldest);
            }
            setFailed(false);
          })
          .catch(() => {
            if (active) {
              errors.add(index);
              setFailed(true);
              console.warn("[PRAKASH] Frame unavailable:", frames[index].name);
            }
          })
          .finally(() => {
            running--;
            pending.delete(index);
            if (active && !cache.has(wanted) && !errors.has(wanted))
              load(wanted);
          });
      };
      render.current = (p) => {
        wanted = reduced
          ? p < 0.35
            ? 0
            : p < 0.52
              ? 99
              : p < 0.68
                ? 149
                : p < 0.94
                  ? 174
                  : 299
          : frameAt(p);
        const ready = cache.get(wanted);
        if (ready && ready !== last) draw(ready);
        load(wanted);
        for (const delta of [1, -1, 2, -2, 3, -3]) load(wanted + delta);
      };
      const resize = new ResizeObserver(() => {
        if (last) draw(last);
      });
      if (canvas.current) resize.observe(canvas.current);
      load(0);
      render.current(progress.current);
      return () => {
        active = false;
        resize.disconnect();
        cache.clear();
        render.current = () => {};
      };
    }, [reduced]);
    return (
      <div className="frame-sequence">
        <img
          src={frames[0].url}
          alt=""
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = "true";
              e.currentTarget.src = assets.alley;
            }
          }}
        />
        <canvas ref={canvas} aria-hidden="true" />
        {failed && (
          <span className="frame-warning">
            A frame could not load. Showing the last available view.
          </span>
        )}
      </div>
    );
  },
);
