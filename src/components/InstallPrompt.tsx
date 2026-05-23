"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "lovair-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-lg md:left-auto md:right-4">
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">Install Lovair</p>
        <p className="text-muted-foreground">Add to your home screen for quicker access.</p>
      </div>
      <button type="button" onClick={install} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Install
      </button>
      <button type="button" onClick={dismiss} className="text-sm text-muted-foreground hover:text-foreground" aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
