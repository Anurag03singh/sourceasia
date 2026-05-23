import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function PageShell({ eyebrow, title, description, children, className }: Props) {
  return (
    <main className={`mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24 ${className ?? ""}`}>
      <div className="mb-10 border-b border-black/10 pb-6 md:mb-12">
        {eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tighter md:text-6xl">{title}</h1>
        {description ? <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">{description}</p> : null}
      </div>
      {children}
    </main>
  );
}
