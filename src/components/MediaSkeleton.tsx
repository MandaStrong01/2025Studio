export default function MediaSkeleton() {
  return (
    <div className="bg-black/50 border border-purple-600/30 rounded-xl p-4 animate-pulse">
      <div className="h-32 bg-purple-900/20 rounded-lg mb-4"></div>
      <div className="h-4 bg-purple-900/20 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-purple-900/20 rounded mb-3 w-1/2"></div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-purple-900/20 rounded-lg"></div>
        <div className="w-10 h-8 bg-purple-900/20 rounded-lg"></div>
      </div>
    </div>
  );
}
