"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { useAuthSync } from "@/hooks/useAuthSync";
import { InstallPrompt } from "@/components/InstallPrompt";

function AuthSync() {
  useAuthSync();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
      <Toaster richColors position="top-center" />
      <InstallPrompt />
    </QueryClientProvider>
  );
}
