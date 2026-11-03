import { ImageResponse } from "next/og";

export const alt = "CryptoValley.jobs - Blockchain & Crypto Jobs in Switzerland";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same poster as the homepage hero: red field, white type, flush left
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#da291c",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect width="64" height="64" fill="#ffffff" />
            <path d="M14 18 L32 46 L50 18" fill="none" stroke="#da291c" strokeWidth="9" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>CryptoValley.jobs</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 112,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: -3,
            maxWidth: 1000,
          }}
        >
          Crypto jobs in Switzerland
        </div>
      </div>
    ),
    { ...size }
  );
}
