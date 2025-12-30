export default function VideoPlayer() {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      style={{ width: "100%" }}
    >
      <source src="/videos/movie.mp4" type="video/mp4" />
    </video>
  );
}
