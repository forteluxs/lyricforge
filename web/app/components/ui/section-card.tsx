import { CopyButton } from "./copy-button";

export function SectionCard({ title, content, mono = false }: { title: string; content: string; mono?: boolean }) {
  if (!content) return null;
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest">{title}</h3>
        <CopyButton text={content} />
      </div>
      <pre className={`whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed ${mono ? "font-mono text-[13px]" : "font-sans"}`}>
        {content}
      </pre>
    </div>
  );
}
