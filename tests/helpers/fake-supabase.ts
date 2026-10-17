export type FakeSupabaseResult = Readonly<{ data: unknown; error: unknown }>;

type FakeSupabaseResponses = Readonly<{
  rpc?: Readonly<Record<string, FakeSupabaseResult>>;
  tables?: Readonly<Record<string, FakeSupabaseResult>>;
}>;

const unexpected = (target: string): FakeSupabaseResult => ({
  data: null,
  error: { message: `Unexpected fake Supabase target: ${target}` },
});

/**
 * Chain-free Supabase client fake. It records which RPCs and tables an
 * adapter touched and resolves every query builder chain to the configured
 * result, so tests assert behaviour (target, caller scope, returned DTO)
 * instead of builder call order or column lists.
 */
export function createFakeSupabase(responses: FakeSupabaseResponses) {
  const calls = {
    rpc: [] as Array<Readonly<{ name: string; args: unknown }>>,
    tables: [] as string[],
  };

  function queryBuilder(result: FakeSupabaseResult): unknown {
    const builder: unknown = new Proxy(() => undefined, {
      get(_target, property) {
        if (property === "then") {
          return (resolve: (value: FakeSupabaseResult) => unknown) =>
            resolve(result);
        }
        return () => builder;
      },
    });
    return builder;
  }

  const client = {
    rpc(name: string, args?: unknown) {
      calls.rpc.push({ name, args });
      return Promise.resolve(responses.rpc?.[name] ?? unexpected(name));
    },
    from(table: string) {
      calls.tables.push(table);
      return queryBuilder(responses.tables?.[table] ?? unexpected(table));
    },
  };

  return { client, calls };
}
