import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_28px_-6px_var(--primary-glow)]">
        <Icon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-2xs text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
