// What this file does: generates the 1200x630 share image shown when the link is
// pasted into chat apps or social media. Next.js finds this file by its name and
// wires up the og:image tag automatically, so no PNG file is needed.
import { ImageResponse } from "next/og";

export const alt = "Anino ng Ani: Who Paid for the Harvest?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#fafaf9",
          color: "#171717",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>Anino ng Ani</div>
        <div style={{ fontSize: 48, marginTop: 24, color: "#b45309" }}>
          Who Paid for the Harvest?
        </div>
        <div style={{ fontSize: 30, marginTop: 40, color: "#525252" }}>
          A map of martial-law farm policy in CALABARZON, 1972 to 1986
        </div>
      </div>
    ),
    size,
  );
}
