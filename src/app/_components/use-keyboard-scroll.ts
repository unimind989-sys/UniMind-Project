"use client";

import { useEffect, useRef } from "react";

const focusable =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex="-1"])';

/**
 * Keyboard access to a scroll area. Content with focusable elements scrolls
 * with them; an area that scrolls without any (a real-mode notice at 200%
 * text, Chat's empty conversation before answers launch) becomes focusable,
 * so arrow keys can scroll it. With `label`, the area also becomes a named
 * region; without it, the element keeps its own role and name.
 */
export function useKeyboardScroll<T extends HTMLElement>(label?: string) {
  const area = useRef<T>(null);
  useEffect(() => {
    const element = area.current;
    if (!element) return;
    // Set directly in the observer callback so the focus stop exists in the
    // same frame the overflow appears; React does not own these attributes.
    const measure = () => {
      const needed =
        ["auto", "scroll"].includes(getComputedStyle(element).overflowY) &&
        element.scrollHeight > element.clientHeight + 1 &&
        element.querySelector(focusable) === null;
      if (needed) {
        element.tabIndex = 0;
        if (label) {
          element.setAttribute("role", "region");
          element.setAttribute("aria-label", label);
        }
      } else {
        element.removeAttribute("tabindex");
        if (label) {
          element.removeAttribute("role");
          element.removeAttribute("aria-label");
        }
      }
    };
    const resize = new ResizeObserver(measure);
    const observeChildren = () => {
      resize.disconnect();
      resize.observe(element);
      for (const child of element.children) resize.observe(child);
    };
    const mutation = new MutationObserver(() => {
      observeChildren();
      measure();
    });
    observeChildren();
    mutation.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    measure();
    // Web fonts can change the overflow without resizing an observed box.
    void document.fonts?.ready.then(measure);
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [label]);
  return area;
}
