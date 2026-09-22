"use client";

import { CollectionRouteState } from "../../_components/collection-route-state";

export default function CollectionError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return <CollectionRouteState kind="error" reset={reset} />;
}
