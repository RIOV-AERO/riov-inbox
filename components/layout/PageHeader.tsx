import { MobileMenuButton } from "./MobileMenuButton";

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3.5 md:hidden">
      <MobileMenuButton />
      <h1 className="flex-1 truncate text-lg font-bold tracking-tight text-ink">{title}</h1>
      {children}
    </div>
  );
}
