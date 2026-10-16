import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";
import { resolveSyntheticPage } from "@/lib/demo/synthetic-route.application";

// The loopback demo proxy rewrites product URLs here so a reload or deep link
// gets a document without running a real route's Auth and data loaders. The
// root layout renders the synthetic client runtime in place of this segment;
// the segment only keeps the previous titles and 404 status. Outside the
// loopback demo the route does not exist (the proxy also answers 404).

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  if (resolveDemoRuntime(process.env) !== "ENABLED") return {};
  const [{ path }, query] = await Promise.all([params, searchParams]);
  if (path[0] !== "batch-leader") return {};
  const arabic = query.lang === "ar";
  const title =
    path.length === 1 && query.view === "history"
      ? arabic
        ? "آخر الإرسالات"
        : "Latest submissions"
      : arabic
        ? "استلام المصادر"
        : "Source intake";
  return { title: `${title} · UniMind` };
}

export default async function SyntheticProductRoute({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  if (resolveDemoRuntime(process.env) !== "ENABLED") notFound();
  const { path } = await params;
  // A URL outside the synthetic route table keeps its 404 status; the client
  // runtime renders the same not-found page.
  if (!resolveSyntheticPage(`/${path.join("/")}`, new URLSearchParams()))
    notFound();
  return null;
}
