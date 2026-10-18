import { describe, expect, it } from "vitest";

import { decideLocale } from "../../src/lib/i18n/locale-preference.application";

const page = {
  method: "GET",
  pathname: "/learn",
  search: "",
  cookie: undefined,
  document: true,
} as const;

describe("remembered interface language", () => {
  it("returns a page load without ?lang= in the remembered language", () => {
    expect(
      decideLocale({ ...page, search: "?view=subjects", cookie: "ar" }),
    ).toEqual({ redirectTo: "/learn?view=subjects&lang=ar", remember: null });
  });

  it("remembers an explicit language, only when it changes", () => {
    expect(decideLocale({ ...page, search: "?lang=ar" })).toEqual({
      redirectTo: null,
      remember: "ar",
    });
    expect(decideLocale({ ...page, search: "?lang=ar", cookie: "ar" })).toEqual(
      { redirectTo: null, remember: null },
    );
  });

  it.each([
    ["no memory", { cookie: undefined }],
    ["a forged memory", { cookie: "fr" }],
    ["an invalid ?lang=", { search: "?lang=fr", cookie: "ar" }],
    ["a POST", { method: "POST", cookie: "ar" }],
    ["an RSC or fetch request", { document: false, cookie: "ar" }],
    ["an API route", { pathname: "/api/health/live", cookie: "ar" }],
    ["the email callback", { pathname: "/auth/callback", cookie: "ar" }],
  ] as const)("leaves %s unchanged", (_label, change) => {
    expect(decideLocale({ ...page, ...change })).toEqual({
      redirectTo: null,
      remember: null,
    });
  });
});
