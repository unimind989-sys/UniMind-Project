import type { SVGProps } from "react";

type IconName =
  | "arrow"
  | "book"
  | "chat"
  | "studio"
  | "quiz"
  | "check"
  | "plus"
  | "source"
  | "expand";
const paths: Record<IconName, string> = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  book: "M12 5v15M3 4.5c3-1 6-.5 9 1 3-1.5 6-2 9-1v14c-3-1-6-.5-9 1-3-1.5-6-2-9-1z",
  chat: "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2zM7 9h10M7 13h6",
  studio: "M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM17 14v7m-3-3.5h6",
  quiz: "M8 3h8v4H8zM8 5H5v16h14V5h-3M8 12l1.5 1.5L12 11m-4 6h7",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  source: "M7 3h7l4 4v14H6V3h1m7 0v5h4M9 12h6M9 16h4",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
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
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
