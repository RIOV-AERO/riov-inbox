export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col px-5 py-7 md:px-7">
      <div className="mx-auto flex w-full max-w-200 flex-col gap-6">
        <div className="h-40 animate-pulse rounded-riov-xl border border-border bg-surface" />
        <div className="h-48 animate-pulse rounded-riov-xl border border-border bg-surface" />
      </div>
    </div>
  );
}
