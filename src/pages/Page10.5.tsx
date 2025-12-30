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
      <h1>Movie Preview</h1>
      <VideoPlayer />
    </div>
  );
}
