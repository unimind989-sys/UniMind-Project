"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

export type DisclosureHandle = Readonly<{
  /** Closes the panel; `restoreFocus` moves focus back to the summary. */
  close: (restoreFocus?: boolean) => void;
}>;

const DisclosureContext = createContext<DisclosureHandle | null>(null);

/** Lets content inside a floating menu close it, for example after a choice. */
export function useDisclosure() {
  return useContext(DisclosureContext);
}

/**
 * One behaviour for every floating `<details>` menu (WP03 IX-06). Escape, a
 * pointer press outside and focus leaving the menu close it. Escape returns
 * focus to the summary, and so does a close from inside the menu that would
 * otherwise drop focus on the page body (a choice that hides its control).
 * A press outside never moves focus: the user chose where to go next. The
 * summary mirrors the state in `aria-expanded`. The panel's position and
 * look stay with the caller's CSS.
 */
export function Disclosure({
  className,
  summary,
  summaryProps,
  children,
  ref,
  onOpenChange,
  ...rest
}: Omit<HTMLAttributes<HTMLDetailsElement>, "children" | "onToggle"> & {
  summary: ReactNode;
  summaryProps?: HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  children: ReactNode;
  ref?: Ref<DisclosureHandle>;
  onOpenChange?: (open: boolean) => void;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const dismiss = useCallback((focus: "summary" | "auto" | "none") => {
    const element = details.current;
    if (!element?.open) return;
    const hadFocus = element.contains(document.activeElement);
    element.open = false;
    const summaryElement =
      element.querySelector<HTMLElement>(":scope > summary");
    if (focus === "summary") summaryElement?.focus({ preventScroll: true });
    else if (focus === "auto" && hadFocus)
      // Focus inside a closing panel would fall back to the body.
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active === document.body || element.contains(active))
          summaryElement?.focus({ preventScroll: true });
      });
  }, []);
  const close = useCallback(
    (restoreFocus = false) => dismiss(restoreFocus ? "summary" : "auto"),
    [dismiss],
  );
  const handle = useMemo<DisclosureHandle>(() => ({ close }), [close]);
  useImperativeHandle(ref, () => handle, [handle]);
  useEffect(() => {
    const element = details.current;
    if (!element) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !element.open) return;
      event.preventDefault();
      event.stopPropagation();
      dismiss("summary");
    };
    const pointerdown = (event: PointerEvent) => {
      if (element.open && !element.contains(event.target as Node))
        dismiss("none");
    };
    const focusout = (event: FocusEvent) => {
      const next = event.relatedTarget;
      // A null target means the window lost focus or a click on nothing
      // focusable; the pointer handler covers clicks.
      if (element.open && next instanceof Node && !element.contains(next))
        dismiss("none");
    };
    element.addEventListener("keydown", keydown);
    element.addEventListener("focusout", focusout);
    document.addEventListener("pointerdown", pointerdown, true);
    return () => {
      element.removeEventListener("keydown", keydown);
      element.removeEventListener("focusout", focusout);
      document.removeEventListener("pointerdown", pointerdown, true);
    };
  }, [dismiss]);
  return (
    <details
      {...rest}
      ref={details}
      className={className}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
        onOpenChange?.(event.currentTarget.open);
      }}
    >
      <summary {...summaryProps} aria-expanded={open}>
        {summary}
      </summary>
      <DisclosureContext.Provider value={handle}>
        {children}
      </DisclosureContext.Provider>
    </details>
  );
}
