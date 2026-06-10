export function SkeletonSongCard({ position }: { position: number }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-4 border border-white/5 shadow-lg min-h-[64px]">
      <span className="text-sm font-mono text-zinc-600 shrink-0 tabular-nums bg-white/5 px-2 py-1 rounded-md">
        {String(position).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-2 flex-1 w-full">
        <div className="h-4 bg-white/10 rounded-md w-1/3 animate-pulse" />
        <div className="h-3 bg-white/5 rounded-md w-1/4 animate-pulse delay-75" />
      </div>
    </div>
  );
}
