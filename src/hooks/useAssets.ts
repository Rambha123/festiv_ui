import { useEffect, useState } from "react";
import { assets } from "../engine/sceneManifest";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function useAssets() {
  const [status, setStatus] = useState({
    ready: false,
    errors: [] as string[],
  });
  useEffect(() => {
    let active = true;
    void Promise.all(
      Object.values(assets).map(async (url) => {
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          return null;
        } catch {
          console.warn(`[PRAKASH] Image failed to decode: ${url}`);
          return url;
        }
      }),
    ).then((results) => {
      if (active) {
        setStatus({
          ready: true,
          errors: results.filter((path): path is string => path !== null),
        });
        ScrollTrigger.refresh();
      }
    });
    return () => {
      active = false;
    };
  }, []);
  return status;
}
