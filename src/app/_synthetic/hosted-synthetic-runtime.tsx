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
import {
  navigateInDocument,
  SyntheticNavigationContext,
} from "@/app/_components/product-navigation";
import { AcademicSetupDraftProvider } from "@/app/_components/academic-setup-draft";

const SyntheticRuntime = lazy(() => import("./synthetic-runtime"));

/**
 * Hosted synthetic entry (WP03-T11), mounted by the real root layout. The
 * real login hands an invented account to `enter`; the product then renders
 * from browser-only state until sign-out or a new document.
 */
export function HostedSyntheticRuntime({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<{
    role: SyntheticRole;
    returnPath: string;
  } | null>(null);
  const enter = useCallback(
    (role: SyntheticRole, locale: string, returnPath: string) => {
      setEntry({ role, returnPath });
      navigateInDocument(`/consent?lang=${locale}`, true);
    },
    [],
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
    () => ({
      active: entry !== null,
      hosted: true,
      enter,
      leave,
      navigate: navigateInDocument,
    }),
    [entry, enter, leave],
  );
  return (
    <AcademicSetupDraftProvider>
      <SyntheticNavigationContext.Provider value={navigation}>
        {entry ? (
          <Suspense fallback={null}>
            <SyntheticRuntime entry={entry} />
          </Suspense>
        ) : (
          children
        )}
      </SyntheticNavigationContext.Provider>
    </AcademicSetupDraftProvider>
  );
}
