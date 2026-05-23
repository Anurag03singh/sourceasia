import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-foreground", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none ring-accent focus:border-accent focus:ring-1",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none ring-accent focus:border-accent focus:ring-1",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
