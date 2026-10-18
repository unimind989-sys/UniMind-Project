"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./product-ui";
import styles from "./product-dialog.module.css";

/**
 * Native modality keeps focus contained and restores the invoking control.
 * `sheet` (sources) becomes a bottom sheet below 768px and stays a dialog on
 * wider screens (DESIGN.md "SourcesPanel / source sheet"). A press on the
 * backdrop closes a dismissible dialog, as Escape does.
 */
export function ProductDialog({
  open,
  title,
  closeLabel,
  onClose,
  children,
  dismissible = true,
  presentation = "dialog",
  onAfterClose,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
  presentation?: "dialog" | "sheet";
  onAfterClose?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      heading.current?.focus({ preventScroll: true });
    } else if (!open && element.open) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        element.close();
      } else {
        const sheet =
          presentation === "sheet" &&
          window.matchMedia("(max-width: 767px)").matches;
        const exit = element.animate(
          [
            { opacity: 1, transform: "none" },
            {
              opacity: 0,
              transform: sheet ? "translateY(10px)" : "translateY(4px)",
            },
          ],
          { duration: 140, easing: "ease-in", fill: "forwards" },
        );
        exit.onfinish = () => {
          element.close();
          exit.cancel();
        };
        return () => {
          exit.cancel();
        };
      }
    }
  }, [open, presentation]);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-presentation={presentation}
      aria-labelledby={headingId}
      onClose={onAfterClose}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        // A click on the dialog element itself outside its box is the backdrop.
        if (!dismissible || event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose();
      }}
    >
      <header>
        <h2 ref={heading} id={headingId} tabIndex={-1}>
          {title}
        </h2>
        <Button variant="quiet" disabled={!dismissible} onClick={onClose}>
          {closeLabel}
        </Button>
      </header>
      {children}
    </dialog>
  );
}
