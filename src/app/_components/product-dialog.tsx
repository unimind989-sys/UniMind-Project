"use client";

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button } from "./product-ui";
import styles from "./product-dialog.module.css";

/** A pointer event on the dialog element itself, outside its box: the backdrop. */
function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const box = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  );
}

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
  const pressedBackdrop = useRef(false);
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
      // The backdrop closes the dialog only when both the press and the
      // release land on it: a text selection dragged out of the dialog ends
      // with a click on the backdrop too, and must not close it.
      onPointerDown={(event) => {
        pressedBackdrop.current = onBackdrop(event);
      }}
      onClick={(event) => {
        const pressed = pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (dismissible && pressed && onBackdrop(event)) onClose();
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
