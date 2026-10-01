import { Brand } from "./_components/brand";
export default function Loading() {
  return (
    <main className="status-page" aria-busy="true" aria-live="polite">
      <Brand />
      <p>Loading UniMind…</p>
    </main>
  );
}
