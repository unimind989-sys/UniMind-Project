import { describe, expect, it } from "vitest";

import {
  decideLocale,
  hasChosenLanguage,
} from "../../src/lib/i18n/locale-preference.application";

const page = {
  method: "GET",
  pathname: "/learn",
  search: "",
  cookie: undefined,
  document: true,
  navigation: false,
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
    expect(decideLocale({ ...page, search: "?lang=en", cookie: "ar" })).toEqual(
      { redirectTo: null, remember: "en" },
    );
    expect(decideLocale({ ...page, search: "?lang=ar", cookie: "ar" })).toEqual(
      { redirectTo: null, remember: null },
    );
  });

  it("writes nothing for the default language on a device without a memory", () => {
    // Landing and guard links carry ?lang=en; sign-in may still use the
    // account's language.
    expect(decideLocale({ ...page, search: "?lang=en" })).toEqual({
      redirectTo: null,
      remember: null,
    });
    expect(decideLocale({ ...page, search: "?lang=en", cookie: "fr" })).toEqual(
      { redirectTo: null, remember: null },
    );
  });

  it("treats only a memory or a non-default language as this device's choice", () => {
    expect(hasChosenLanguage("en", undefined)).toBe(false);
    expect(hasChosenLanguage(undefined, undefined)).toBe(false);
    expect(hasChosenLanguage("fr", "de")).toBe(false);
    expect(hasChosenLanguage("ar", undefined)).toBe(true);
    expect(hasChosenLanguage("en", "en")).toBe(true);
    expect(hasChosenLanguage(undefined, "ar")).toBe(true);
  });

  it.each([
    ["no memory", { cookie: undefined }],
    ["a forged memory", { cookie: "fr" }],
    ["an invalid ?lang=", { search: "?lang=fr", cookie: "ar" }],
    ["a POST", { method: "POST", cookie: "ar" }],
    [
      "a fetch that is neither a page load nor a navigation",
      { document: false, cookie: "ar" },
    ],
    [
      "a client navigation without ?lang=",
      { document: false, navigation: true, cookie: "ar" },
    ],
    ["an API route", { pathname: "/api/health/live", cookie: "ar" }],
    ["the email callback", { pathname: "/auth/callback", cookie: "ar" }],
  ] as const)("leaves %s unchanged", (_label, change) => {
    expect(decideLocale({ ...page, ...change })).toEqual({
      redirectTo: null,
      remember: null,
    });
  });

  it("remembers the language a client navigation names (the shell switch)", () => {
    expect(
      decideLocale({
        ...page,
        document: false,
        navigation: true,
        search: "?lang=ar",
        cookie: "en",
      }),
    ).toEqual({ redirectTo: null, remember: "ar" });
  });
});
