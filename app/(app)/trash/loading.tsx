function SkeletonRow({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3.5 px-5 py-4 ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="size-9 shrink-0 animate-pulse rounded-riov-md bg-frame" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-2.25 w-40 animate-pulse rounded-full bg-frame" />
        <div className="h-2.75 w-72 animate-pulse rounded-full bg-border-subtle" />
      </div>
      <div className="h-2.25 w-9 shrink-0 animate-pulse rounded-full bg-frame" />
    </div>
  );
}

export default function TrashLoading() {
  return (
    <div className="flex flex-1 flex-col px-5 py-5 md:px-7">
      <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-riov-xl border border-border bg-surface">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow dimmed />
      </div>
    </div>
  );
}
