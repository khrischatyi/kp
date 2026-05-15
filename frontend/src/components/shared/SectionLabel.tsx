import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-xs uppercase tracking-widest2 text-muted-foreground", className)}>
      {index && <span className="text-accent">{index}</span>}
      <span className="h-px w-8 bg-foreground/30" />
      <span>{children}</span>
    </div>
  );
}
