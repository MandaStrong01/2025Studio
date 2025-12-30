import VideoPlayer from "../components/VideoPlayer";

export default function Page11() {
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
        Page 11 – Movie Preview
      </h1>

      <VideoPlayer />
    </div>
  );
}
