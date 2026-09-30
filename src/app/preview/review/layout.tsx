import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ReviewProvider } from "./_components/review-provider";

export const metadata: Metadata = {
  title: "UniMind · Synthetic product review",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ReviewProvider>{children}</ReviewProvider>
    </Suspense>
  );
}
