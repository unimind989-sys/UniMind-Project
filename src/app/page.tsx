import { getServerEnvironment } from "@/lib/config/env.server";

export default function HomePage() {
  const environment = getServerEnvironment();

  return (
    <main className="foundation-page">
      <h1>UniMind</h1>
      <p>
        The application foundation is running. Product workflows remain behind
        deterministic mocks until their decisions and review gates pass.
      </p>
      <section aria-labelledby="foundation-status">
        <h2 id="foundation-status">Foundation status</h2>
        <dl>
          <div>
            <dt>Runtime</dt>
            <dd>Node.js application</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>Synthetic only</dd>
          </div>
          <div>
            <dt>Providers</dt>
            <dd>
              {environment.PROVIDER_MODE === "mock"
                ? "Mock only"
                : "Approved real mode"}
            </dd>
          </div>
          <div>
            <dt>Release</dt>
            <dd>{environment.NEXT_PUBLIC_RELEASE_ID}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
