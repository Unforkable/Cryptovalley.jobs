import { ImageResponse } from "next/og";

export const alt = "CryptoValley.jobs - Blockchain & Crypto Jobs in Switzerland";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#6366f1" />
            <circle cx="45" cy="18" r="5.5" fill="#fbbf24" />
            <path
              d="M11 47 L26 21 L34 35 L40 26 L53 47 Z"
              fill="#ffffff"
              opacity="0.96"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>
            <span style={{ color: "#a5b4fc" }}>Crypto</span>
            <span>Valley</span>
            <span style={{ color: "#818cf8" }}>.jobs</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            color: "#c7d2fe",
            textAlign: "center",
          }}
        >
          Blockchain &amp; Crypto Jobs in Switzerland
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: "#818cf8",
          }}
        >
          Zug · Zurich · Remote
        </div>
      </div>
    ),
    { ...size }
  );
}
