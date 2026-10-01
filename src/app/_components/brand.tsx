import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import styles from "./app-shell.module.css";

export function Brand({
  href = "/",
  variant = "full",
}: {
  href?: string;
  variant?: "full" | "compact" | "small";
}) {
  const asset =
    variant === "full"
      ? "horizontal"
      : variant === "small"
        ? "symbol-small"
        : "symbol";
  return (
    <Link
      href={href as Route}
      className={styles.brand}
      data-variant={variant}
      aria-label="UniMind"
      dir="ltr"
      prefetch={false}
    >
      {(["light", "dark"] as const).map((theme) => (
        <Image
          key={theme}
          data-brand-theme={theme}
          src={`/brand/unimind/unimind-open-folio-${asset}-${theme}.svg`}
          width={variant === "full" ? 944 : 256}
          height={256}
          alt=""
          loading="eager"
          unoptimized
        />
      ))}
    </Link>
  );
}
