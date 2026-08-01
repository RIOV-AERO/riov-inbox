import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RIOV Inbox · Caixa de entrada centralizada";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7F6F3",
        color: "#17201C",
        fontFamily: "sans-serif",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "96px",
          height: "96px",
          borderRadius: "24px",
          backgroundColor: "#17201C",
          color: "#FFFFFF",
          fontSize: "46px",
          fontWeight: "bold",
          marginBottom: "28px",
          boxShadow: "0 10px 30px rgba(23, 32, 28, 0.15)",
        }}
      >
        R
      </div>
      <div
        style={{
          fontSize: "56px",
          fontWeight: "800",
          letterSpacing: "-0.03em",
          marginBottom: "12px",
          color: "#17201C",
        }}
      >
        RIOV Inbox
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "500",
          color: "#6B7671",
          textAlign: "center",
          maxWidth: "640px",
          lineHeight: "1.4",
        }}
      >
        Caixa de entrada centralizada da RIOV. Sua comunicação corporativa, sem
        ruído.
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "44px",
          padding: "10px 24px",
          borderRadius: "100px",
          backgroundColor: "#E6F6EF",
          color: "#00694A",
          fontSize: "16px",
          fontWeight: "600",
          border: "1px solid #00A86B33",
        }}
      >
        inbox.riov.com.br
      </div>
    </div>,
    {
      ...size,
    },
  );
}
