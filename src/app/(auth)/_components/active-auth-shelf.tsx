"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "../auth.module.css";

export function ActiveAuthShelf({
  activeStep,
  children,
  label,
}: Readonly<{
  activeStep: number;
  children: ReactNode;
  label: string;
}>) {
  const shelfRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    shelfRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeStep]);

  return (
    <ol ref={shelfRef} className={styles.accessShelf} aria-label={label}>
      {children}
    </ol>
  );
}
