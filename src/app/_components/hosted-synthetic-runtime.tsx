"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SyntheticRole } from "@/lib/demo/synthetic-account.application";
import { SyntheticNavigationContext } from "./product-navigation";

const HostedSyntheticFlow = lazy(() => import("./hosted-synthetic-flow"));

export function HostedSyntheticRuntime({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<{
    role: SyntheticRole;
    returnPath: string;
  } | null>(null);
  const navigate = useCallback((href: string, replace = false) => {
    const address = new URL(href, window.location.href);
    if (address.origin !== window.location.origin) return;
    const path = address.pathname + address.search + address.hash;
    if (
      path ===
      window.location.pathname + window.location.search + window.location.hash
    )
      return;
    // Next's native history integration updates pathname/search hooks without
    // fetching a server route. No identity marker is written into history.
    window.history[replace ? "replaceState" : "pushState"](null, "", path);
    window.scrollTo(0, 0);
  }, []);
  const enter = useCallback(
    (role: SyntheticRole, locale: string, returnPath: string) => {
      setEntry({ role, returnPath });
      navigate(`/consent?lang=${locale}`, true);
    },
    [navigate],
  );
  const leave = useCallback((locale: string) => {
    setEntry(null);
    // A new document discards every simulation record and renders real login.
    window.location.replace(`/login?lang=${locale}&status=signed_out`);
  }, []);
  useEffect(() => {
    // Returning through the browser's document cache must not revive a role.
    const discard = () => setEntry(null);
    window.addEventListener("pagehide", discard);
    return () => window.removeEventListener("pagehide", discard);
  }, []);
  const navigation = useMemo(
    () => ({ active: entry !== null, enter, leave, navigate }),
    [entry, enter, leave, navigate],
  );
  return (
    <SyntheticNavigationContext.Provider value={navigation}>
      {entry ? (
        <Suspense fallback={null}>
          <HostedSyntheticFlow entry={entry} />
        </Suspense>
      ) : (
        children
      )}
    </SyntheticNavigationContext.Provider>
  );
}
