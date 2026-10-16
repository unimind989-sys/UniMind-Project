"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ComponentProps } from "react";
import type { SyntheticRole } from "@/lib/demo/synthetic-account.application";

export type SyntheticNavigation = {
  /** A browser-only synthetic runtime owns rendering and navigation. */
  active: boolean;
  /** The runtime was entered from the real login (WP03-T11), not from the
   * loopback demo; hosted presentation omits every local review extra. */
  hosted: boolean;
  enter: (role: SyntheticRole, locale: string, returnPath: string) => void;
  leave: (locale: string) => void;
  navigate: (href: string, replace?: boolean) => void;
};
export const SyntheticNavigationContext =
  createContext<SyntheticNavigation | null>(null);

export function useSyntheticNavigation() {
  return useContext(SyntheticNavigationContext);
}

/** True only inside the synthetic runtime entered from the real login. */
export function useHostedSynthetic() {
  const synthetic = useSyntheticNavigation();
  return Boolean(synthetic?.active && synthetic.hosted);
}

/** Same-document navigation for the synthetic runtime. Next's native history
 * integration updates pathname/search hooks without fetching a server route.
 * No identity marker is written into history. */
export function navigateInDocument(href: string, replace = false) {
  const address = new URL(href, window.location.href);
  if (address.origin !== window.location.origin) return;
  const path = address.pathname + address.search + address.hash;
  if (
    path ===
    window.location.pathname + window.location.search + window.location.hash
  )
    return;
  window.history[replace ? "replaceState" : "pushState"](null, "", path);
  window.scrollTo(0, 0);
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
