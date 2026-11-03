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
          background: "#da291c",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M14 18 L32 46 L50 18" fill="none" stroke="#ffffff" strokeWidth="9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
