import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Devfluent — ADHD-friendly developer learning"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "100px",
            padding: "8px 20px",
            color: "rgba(255,255,255,0.9)",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "32px",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          ADHD-FRIENDLY LEARNING
        </div>

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: "88px",
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: "28px",
            display: "flex",
          }}
        >
          Devfluent
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "32px",
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: "700px",
            display: "flex",
          }}
        >
          Learn to code. Actually finish.
        </div>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "56px",
          }}
        >
          {["🗺 Roadmaps", "🎮 XP & Levels", "🔥 Streaks", "🧠 Curriculum"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "10px 22px",
                color: "white",
                fontSize: "20px",
                fontWeight: 500,
                display: "flex",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
