import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — online fakturisanje`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #05070A 0%, #0a1628 100%)",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#94a3b8",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Moderno rešenje za online fakturisanje
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            color: "#00E5FF",
            fontWeight: 600,
          }}
        >
          fakturaone.app
        </div>
      </div>
    ),
    { ...size },
  );
}
