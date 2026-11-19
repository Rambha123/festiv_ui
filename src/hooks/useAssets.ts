import { useEffect, useRef, useState } from "react";
import { assets } from "../engine/sceneManifest";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useAssets(furthest: number) {
  const [status, setStatus] = useState({ ready: false, errors: [] as string[] });
  const pending = useRef(new Map<string, Promise<string | null>>());
  useEffect(() => {
    let active = true;
    const urls = [assets.unlit, assets.front, assets.side,
      ...(furthest >= 1 ? [assets.courtyard] : []),
      ...(furthest >= 2 ? [assets.riverbank] : []),
      ...(furthest >= 3 ? [assets.riverSteps, assets.sunrise] : []),
    ];
    const decode = (url: string) => {
      const existing = pending.current.get(url);
      if (existing) return existing;
      const promise = (async () => {
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          return null;
        } catch {
          console.warn(`[PRAKASH] Image failed to decode: ${url}`);
          return url;
        }
      })();
      pending.current.set(url, promise);
      return promise;
    };
    void Promise.all(urls.map(decode)).then((results) => {
      if (!active) return;
      setStatus({ ready: true, errors: results.filter((url): url is string => url !== null) });
      ScrollTrigger.refresh();
    });
    return () => { active = false; };
  }, [furthest]);
  return status;
}
