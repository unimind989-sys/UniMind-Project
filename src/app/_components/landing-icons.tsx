import type { SVGProps } from "react";

type IconName = "check" | "play" | "replay";
const paths: Record<IconName, string> = {
  check: "M5 12.5 10 17l9-10",
  play: "M8 5.5v13l10-6.5z",
  replay: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4",
};
export function LandingIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={name === "play" ? "currentColor" : "none"}
      stroke={name === "play" ? "none" : "currentColor"}
      strokeWidth={name === "check" ? 2.4 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
