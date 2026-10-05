import Image from "next/image";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import styles from "./app-shell.module.css";

export function Brand({
  href = "/",
  variant = "full",
  tone,
}: {
  href?: string;
  variant?: "full" | "compact" | "small";
  tone?: "light" | "dark";
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
      data-brand-tone={tone}
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
