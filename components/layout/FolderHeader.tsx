import { MobileMenuButton } from "./MobileMenuButton";

export function FolderHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-4 md:px-7">
      <MobileMenuButton />
      <h1 className="flex-1 text-base font-bold tracking-tight text-ink">{title}</h1>
      {meta && <span className="text-[12.5px] text-ink-secondary">{meta}</span>}
    </div>
  );
}
