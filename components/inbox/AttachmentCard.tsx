import { ArrowDown } from "lucide-react";
import { attachmentBadge } from "@/lib/attachment-style";
import { formatBytes } from "@/lib/format";

export function AttachmentCard({
  id,
  filename,
  contentType,
  size,
}: {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}) {
  const badge = attachmentBadge(filename, contentType);

  return (
    <a
      href={`/api/attachments/${id}`}
      download={filename}
      className="flex items-center gap-3.5 rounded-riov-lg border border-border-subtle bg-[#FCFCFA] px-4 py-3.5 transition-colors hover:border-border-strong"
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-3.25 text-[11px] font-bold"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {badge.label}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">
          {filename}
        </div>
        <div className="truncate text-[12.5px] text-ink-muted">
          {contentType} · {formatBytes(size)}
        </div>
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-tint">
        <ArrowDown size={16} strokeWidth={1.8} className="text-accent-hover" />
      </div>
    </a>
  );
}
