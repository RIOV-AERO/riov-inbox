export default function EmailDetailLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2.5 border-b border-border bg-surface px-5 py-3.5 md:px-7">
        <div className="h-9 w-20 animate-pulse rounded-full bg-frame" />
        <div className="h-6 w-px bg-border-subtle" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-frame" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-frame" />
      </div>

      <div className="mx-auto flex w-full max-w-210 flex-1 flex-col gap-5 px-5 py-7 md:px-7">
        <div className="flex flex-col gap-4 rounded-riov-xl border border-border bg-surface p-6">
          <div className="h-7 w-3/4 animate-pulse rounded-md bg-frame" />
          <div className="flex items-start gap-3.5">
            <div className="size-11 shrink-0 animate-pulse rounded-riov-lg bg-frame" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-48 animate-pulse rounded bg-frame" />
              <div className="h-3 w-32 animate-pulse rounded bg-border-subtle" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-frame" />
          </div>
        </div>

        <div className="h-96 w-full animate-pulse rounded-riov-xl border border-border bg-surface" />
      </div>
    </div>
  );
}
