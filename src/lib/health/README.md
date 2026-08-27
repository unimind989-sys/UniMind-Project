# Runtime health module

- **Interface:** Minimal liveness and configuration-readiness results for external runtime probes.
- **Allowed dependencies:** Injected validation functions and shared TypeScript types.
- **Prohibited dependencies:** Provider SDKs, database calls, secret values, internal topology, React, and Next.js request objects.
- **Owner:** WP01-T09 environment-isolation executor; deployment operators consume the public health routes.

Liveness proves only that the web process can answer a request. Readiness validates the server configuration but deliberately returns no failing variable names or infrastructure details.
