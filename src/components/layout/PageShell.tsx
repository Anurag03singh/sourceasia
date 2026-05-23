import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: string;
  children: ReactNode;
};

export function PageShell({ title, description, children }: Props) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 border-b border-black/10 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </main>
  );
}
