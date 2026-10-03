"use client";
import { useSearchParams } from "next/navigation";
import { Brand } from "./_components/brand";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const arabic = useSearchParams().get("lang") === "ar";
  return (
    <main
      className="status-page"
      lang={arabic ? "ar" : "en"}
      dir={arabic ? "rtl" : "ltr"}
    >
      <Brand />
      <h1>{arabic ? "تعذر تحميل الصفحة" : "This page could not load"}</h1>
      <p>
        {arabic
          ? "حاول تحميل هذه الصفحة مرة أخرى."
          : "Try loading this page again."}
      </p>
      <button type="button" onClick={reset}>
        {arabic ? "حاول مرة أخرى" : "Try again"}
      </button>
    </main>
  );
}
