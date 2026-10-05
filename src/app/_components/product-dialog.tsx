"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./product-ui";
import styles from "./product-dialog.module.css";

/** Native modality keeps focus contained and restores the invoking control. */
export function ProductDialog({
  open,
  title,
  closeLabel,
  onClose,
  children,
  dismissible = true,
  onAfterClose,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
  onAfterClose?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
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
        const exit = element.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "translateY(4px)" },
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
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={title}
      onClose={onAfterClose}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
    >
      <header>
        <h2 ref={heading} tabIndex={-1}>
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
