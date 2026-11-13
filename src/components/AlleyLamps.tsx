import { Fragment, type CSSProperties } from "react";
import { assets } from "../engine/sceneManifest";
import { alleyLamps } from "../data/alleyLamps";
import { useJourney } from "../store/journeyStore";
import { Diya } from "./Diya";
export function AlleyLamps({ active }: { active: boolean }) {
  const lit = useJourney((s) => s.lit);
  const ne = useJourney((s) => s.language === "ne");
  return (
    <div className="scene-lamps alley-lamps" inert={!active}>
      {alleyLamps.map((lamp) => {
        const style = {
          "--lamp-x": `${lamp.x}%`,
          "--lamp-y": `${lamp.y}%`,
        } as CSSProperties;
        return (
          <Fragment key={lamp.id}>
            <div
              aria-hidden="true"
              className={`local-illumination lamp-${lamp.position} ${lit.includes(lamp.id) ? "is-lit" : ""}`}
              style={{ ...style, backgroundImage: `url("${assets.unlit}")` }}
            />
            <div
              className={`artwork-lamp alley-lamp lamp-${lamp.position}`}
              style={style}
            >
              <Diya
                id={lamp.id}
                variant="front"
                artwork
                label={ne ? lamp.ne : lamp.label}
              />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
