"use client";

import { lazy, Suspense } from "react";
import {
  navigateInDocument,
  SyntheticNavigationContext,
} from "@/app/_components/product-navigation";

const SyntheticRuntime = lazy(() => import("./synthetic-runtime"));

// The loopback demo starts signed out and keeps its local review extras
// (fixture selectors, prefilled invented credentials, the demo notice and
// clock). Hosted-only entry and exit are never reachable here.
const loopback = {
  active: true,
  hosted: false,
  enter: () => {},
  leave: () => {},
  navigate: navigateInDocument,
};

/**
 * The loopback synthetic demo (`pnpm demo`), mounted by the root layout only
 * when `resolveDemoRuntime` is ENABLED (development, 127.0.0.1, invented
 * credentials). It is the same client runtime as hosted entry.
 */
export function LoopbackSyntheticRuntime() {
  return (
    <SyntheticNavigationContext.Provider value={loopback}>
      <Suspense fallback={null}>
        <SyntheticRuntime />
      </Suspense>
    </SyntheticNavigationContext.Provider>
  );
}
