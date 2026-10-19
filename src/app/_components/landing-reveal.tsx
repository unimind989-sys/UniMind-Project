"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * A landing section that rises once (≤10px over 420ms, the shared easing)
 * the first time it is seen, then rests (DESIGN.md "Public landing").
 * It renders `data-reveal="out"` and flips to `in` on first view; the CSS
 * hides the `out` state only when scripts run and motion is not reduced, so
 * a page without JavaScript or with reduced motion shows the final layout at
 * once. `stagger` lets the children arrive in order (each sets `--order`).
 * Nothing loops, tracks the pointer or depends on scroll position: scrolling
 * only decides when the one rise happens.
 */
export function Reveal({
  as = "div",
  stagger = false,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "figure" | "ol" | "footer";
  stagger?: boolean;
  children: ReactNode;
}) {
  // The tags share the HTMLElement surface this component uses.
  const Tag = as as "div";
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.reveal = "done";
      return;
    }
    const reveal = () => {
      node.dataset.reveal = "in";
      observer.disconnect();
      removeEventListener("scroll", passed);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    // A fast scroll can jump a section from below the viewport to above it
    // between two frames, so the observer never sees it; a section the
    // reader has already passed is shown too.
    const passed = () => {
      if (node.getBoundingClientRect().bottom < 0) reveal();
    };
    observer.observe(node);
    addEventListener("scroll", passed, { passive: true });
    return () => {
      observer.disconnect();
      removeEventListener("scroll", passed);
    };
  }, []);
  return (
    <Tag
      {...rest}
      ref={element}
      data-reveal="out"
      data-stagger={stagger ? "" : undefined}
    >
      {children}
    </Tag>
  );
}
