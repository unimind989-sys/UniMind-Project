import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductNativePage } from "@/app/_components/product-native-page";
import { resolveSyntheticPage } from "@/lib/demo/synthetic-route.application";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";

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
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (resolveDemoRuntime(process.env) !== "ENABLED") notFound();
  const [{ path }, query] = await Promise.all([params, searchParams]);
  const parameters = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) parameters.set(name, first);
  }
  const page = resolveSyntheticPage(`/${path.join("/")}`, parameters);
  if (!page) notFound();
  return <ProductNativePage key={path.join("/") + page.fixture} {...page} />;
}
