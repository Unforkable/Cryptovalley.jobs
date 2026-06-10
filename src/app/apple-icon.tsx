import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <circle cx="45" cy="18" r="5.5" fill="#fbbf24" />
          <path
            d="M11 47 L26 21 L34 35 L40 26 L53 47 Z"
            fill="#ffffff"
            opacity="0.96"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
