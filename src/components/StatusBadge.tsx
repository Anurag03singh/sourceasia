import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "default" | "muted" | "danger";

const toneClass: Record<Tone, string> = {
  default: "bg-primary/10 text-primary",
  muted: "bg-secondary text-muted-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ children, tone = "default", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize", toneClass[tone], className)}>
      {children}
    </span>
  );
}
