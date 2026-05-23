"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";

/** Wire Supabase auth session into the Zustand user store. Mount once at the root. */
export function useAuthSync() {
  const setSession = useUserStore((s) => s.setSession);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession({
          token: session.access_token,
          userId: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setSession(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          token: session.access_token,
          userId: session.user.id,
          email: session.user.email ?? null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession]);
}
