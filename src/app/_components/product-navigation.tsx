"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ComponentProps } from "react";
import type { SyntheticRole } from "@/lib/demo/synthetic-account.application";

export type SyntheticNavigation = {
  active: boolean;
  enter: (role: SyntheticRole, locale: string, returnPath: string) => void;
  leave: (locale: string) => void;
  navigate: (href: string, replace?: boolean) => void;
};
export const SyntheticNavigationContext =
  createContext<SyntheticNavigation | null>(null);

export function useSyntheticNavigation() {
  return useContext(SyntheticNavigationContext);
}

export function useProductRouter() {
  const router = useRouter();
  const synthetic = useSyntheticNavigation();
  return useMemo(
    () =>
      synthetic?.active
        ? {
            ...router,
            push: (href: string) => synthetic.navigate(href),
            replace: (href: string) => synthetic.navigate(href, true),
            back: () => window.history.back(),
            forward: () => window.history.forward(),
            refresh: () => {},
            prefetch: async () => {},
          }
        : router,
    [router, synthetic],
  );
}

// Preserve the same Link presentation and handlers. A browser-only journey
// neither prefetches protected RSC payloads nor dispatches server navigation.
export function ProductNavigationLink({
  onClick,
  prefetch,
  ...props
}: ComponentProps<typeof NextLink>) {
  const synthetic = useSyntheticNavigation();
  return (
    <NextLink
      {...props}
      {...(synthetic?.active
        ? { prefetch: false }
        : prefetch !== undefined
          ? { prefetch }
          : {})}
      onClick={(event) => {
        onClick?.(event);
        if (
          !synthetic?.active ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.currentTarget.target === "_blank" ||
          event.currentTarget.hasAttribute("download")
        )
          return;
        const address = new URL(event.currentTarget.href);
        if (address.origin !== window.location.origin) return;
        event.preventDefault();
        synthetic.navigate(
          address.pathname + address.search + address.hash,
          props.replace,
        );
      }}
    />
  );
}
