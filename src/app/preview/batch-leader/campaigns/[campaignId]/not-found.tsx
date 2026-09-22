import { CollectionRouteState } from "@/app/batch-leader/_components/collection-route-state";

export default function PreviewCollectionNotFound() {
  return <CollectionRouteState kind="not-found" backHref="/preview/learn" />;
}
