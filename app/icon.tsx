import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#060f24",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 3L26 8V16C26 22.5 21.5 27.5 16 29C10.5 27.5 6 22.5 6 16V8L16 3Z"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M12 18C12 14 14 11 16 11C18 11 20 14 20 18"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 11V7"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
