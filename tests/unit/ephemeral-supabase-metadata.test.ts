import { describe, expect, it } from "vitest";

import {
  findSupabaseContainer,
  parsePostgresRuntimeMetadata,
} from "../../scripts/lib/ephemeral-supabase-metadata";

describe("ephemeral Supabase runtime metadata", () => {
  it("selects the database and PostgREST containers without exposing inventory", () => {
    const inventory = [
      "supabase_auth_unimind\tauth-image:v1",
      "supabase_db_unimind\tpostgres-image:v17",
      "supabase_rest_unimind\tpostgrest-image:v14",
    ].join("\n");

    expect(findSupabaseContainer(inventory, "db")).toEqual({
      name: "supabase_db_unimind",
      image: "postgres-image:v17",
    });
    expect(findSupabaseContainer(inventory, "rest")).toEqual({
      name: "supabase_rest_unimind",
      image: "postgrest-image:v14",
    });
  });

  it("fails closed when a service container is missing or ambiguous", () => {
    expect(() => findSupabaseContainer("", "db")).toThrow(
      "Expected one disposable Supabase db container.",
    );
    expect(() =>
      findSupabaseContainer(
        "supabase_db_one\timage:v1\nsupabase_db_two\timage:v1",
        "db",
      ),
    ).toThrow("Expected one disposable Supabase db container.");
  });

  it("parses the PostgreSQL and installed-extension versions", () => {
    expect(
      parsePostgresRuntimeMetadata(
        "17.6\npg_graphql=1.5.11\nplpgsql=1.0\nvector=0.8.0\n",
      ),
    ).toEqual({
      version: "17.6",
      extensions: {
        pg_graphql: "1.5.11",
        plpgsql: "1.0",
        vector: "0.8.0",
      },
    });
  });
});
