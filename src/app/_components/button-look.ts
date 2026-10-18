import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive";
export type ButtonTone = "paper" | "night" | "cobalt";
export type ButtonSize = "default" | "large";

export type ButtonLook = {
  variant?: ButtonVariant | undefined;
  tone?: ButtonTone | undefined;
  size?: ButtonSize | undefined;
  /** Fill the inline size of the container (phone forms, sheets). */
  block?: boolean | undefined;
};

/**
 * The Button and action-link look (DESIGN.md) as attributes for any element,
 * so server components and native `<a>`/`<summary>` controls can share it.
 */
export function buttonLook(
  {
    variant = "secondary",
    tone = "paper",
    size = "default",
    block,
  }: ButtonLook,
  className?: string,
) {
  return {
    className: className ? `${styles.button} ${className}` : styles.button,
    "data-variant": variant,
    "data-tone": tone,
    "data-size": size,
    "data-block": block ? "" : undefined,
  } as const;
}
