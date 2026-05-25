import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B1E3F",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 32 32">
          <ellipse cx="16" cy="17" rx="10" ry="9" fill="#8B6914" />
          <ellipse cx="16" cy="18" rx="7" ry="6" fill="#F5E6C8" />
          <circle cx="12.5" cy="16" r="3" fill="white" />
          <circle cx="19.5" cy="16" r="3" fill="white" />
          <circle cx="12.5" cy="16" r="1.8" fill="#D4AF37" />
          <circle cx="19.5" cy="16" r="1.8" fill="#D4AF37" />
          <path d="M16 19 L14 22 L18 22 Z" fill="#D4AF37" />
          <polygon points="16,4 8,8 24,8" fill="#1e3a6f" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
