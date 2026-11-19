export interface Frame {
  width: number;
  height: number;
  left: number;
  top: number;
  viewportWidth: number;
  viewportHeight: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function courtyardFrame(width: number, height: number): Frame {
  const scale = Math.max(width / 1672, height / 941) * 1.04;
  const imageWidth = 1672 * scale;
  const imageHeight = 941 * scale;
  return {
    width: imageWidth,
    height: imageHeight,
    left: (width - imageWidth) * 0.55,
    top: (height - imageHeight) * 0.52,
    viewportWidth: width,
    viewportHeight: height,
  };
}

export function inspectionTransform(frame: Frame, x: number, y: number) {
  const mobile = frame.viewportWidth < 700;
  const scale = mobile ? 1.34 : 1.65;
  const left = clamp(
    frame.viewportWidth * (mobile ? 0.5 : 0.34) - x * frame.width * scale,
    frame.viewportWidth - frame.width * scale,
    0,
  );
  const top = clamp(
    frame.viewportHeight * (mobile ? 0.29 : 0.5) - y * frame.height * scale,
    frame.viewportHeight - frame.height * scale,
    0,
  );
  return { x: left - frame.left, y: top - frame.top, scale };
}

// A deliberate keyboard look uses both axes, including short/ultrawide crops.
export function revealTransform(frame: Frame, x: number, y: number) {
  return {
    x: clamp(frame.viewportWidth * 0.5 - frame.left - x * frame.width,
      frame.viewportWidth - frame.width - frame.left, -frame.left),
    y: clamp(frame.viewportHeight * 0.5 - frame.top - y * frame.height,
      frame.viewportHeight - frame.height - frame.top, -frame.top),
  };
}
