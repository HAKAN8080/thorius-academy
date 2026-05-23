import { ImageResponse } from "next/og"

// iOS home screen ikonu (180x180)
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 130,
          background: "#0B1E3F",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 900,
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        T
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#D4AF37",
          }}
        />
      </div>
    ),
    { ...size }
  )
}