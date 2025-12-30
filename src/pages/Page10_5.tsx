import MediaLibrary from "./MediaLibrary";
import VideoPlayer from "../components/VideoPlayer";

export default function Page10_5() {
  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>
        Media Library & Preview
      </h1>

      {/* 🎞 Video Preview */}
      <div style={{ marginBottom: "32px" }}>
        <VideoPlayer />
      </div>

      {/* 📁 Media Library */}
      <MediaLibrary />
    </div>
  );
}
