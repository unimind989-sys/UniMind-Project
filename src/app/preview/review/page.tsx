export default function RetiredReviewInterface() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>UniMind synthetic product demo</h1>
      <p>
        The separate review interface has been retired. Run{" "}
        <code>corepack pnpm demo</code>, then open{" "}
        <code>http://127.0.0.1:3101/login</code> to use the normal product flow
        with isolated synthetic services.
      </p>
      <p>
        The normal runtime retains its real access checks. A query parameter
        cannot activate the demo.
      </p>
    </main>
  );
}
