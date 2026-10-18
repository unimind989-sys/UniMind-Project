"use client";

import { CollectionRouteState } from "../../_components/collection-route-state";

export default function CollectionError({
  retry,
}: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  return <CollectionRouteState kind="error" retry={retry} />;
}
