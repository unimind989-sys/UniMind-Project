import { notFound } from "next/navigation";
import { ProductNativePage } from "@/app/_components/product-native-page";
import { resolveSyntheticPage } from "@/app/_components/synthetic-route";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";

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
