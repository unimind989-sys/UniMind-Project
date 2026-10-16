import { describe, expect, it } from "vitest";

import { isProductDemoPath } from "../../src/lib/demo/demo-runtime.application";
import {
  resolveSyntheticPage,
  syntheticProductPath,
  syntheticRoutes,
} from "../../src/lib/demo/synthetic-route.application";

const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const query = (value = "") => new URLSearchParams(value);
const resolve = (path: string, search = "") =>
  resolveSyntheticPage(path, query(search));

describe("synthetic route table", () => {
  it.each([
    ["/", "home", "home"],
    ["/login", "auth", "login"],
    ["/register", "auth", "register"],
    ["/verify-email", "auth", "verify-email"],
    ["/consent", "auth", "consent"],
    ["/forgot-password", "auth", "forgot-password"],
    ["/reset-password", "auth", "reset-password"],
    ["/learn", "catalog", "catalog"],
    ["/settings", "settings", "settings"],
    ["/admin", "admin", "decisions"],
    ["/admin/sources", "admin", "admin-sources"],
    ["/batch-leader", "leader", "campaign-list"],
    ["/batch-leader/invitation", "leader", "invitation"],
    ["/batch-leader/campaigns/sample-campaign", "leader", "collection"],
    [unit, "study", "overview"],
    [`${unit}/chat`, "study", "chat"],
    [`${unit}/quiz/sample-attempt/review`, "study", "quiz-review"],
    [`${unit}/report`, "study", "report"],
  ])("composes %s with the %s composer", (path, composer, screen) => {
    expect(resolve(path)).toMatchObject({ composer, screen });
  });

  it("binds route parameters only to fixtures the runtime owns", () => {
    expect(resolve(`${unit}/sources`)?.scope).toMatchObject({
      unitId: "zagazig-university-human-medicine-y1-t1-anatomy",
      sourceCount: 8,
    });
    expect(
      resolve("/batch-leader/campaigns/sample-biochemistry-campaign")
        ?.campaignId,
    ).toBe("sample-biochemistry-campaign");
    for (const path of [
      "/learn/forged-cohort/forged-unit",
      `${unit}/forged-tool`,
      "/admin/forged",
      "/batch-leader/campaigns/forged",
      "/preview/learn",
      "/synthetic-runtime/admin",
      "/api/health/live",
    ])
      expect(resolve(path)).toBeNull();
  });

  it("reads locale and the local fixture selector from the query", () => {
    expect(resolve("/admin", "lang=ar&fixture=stale")).toMatchObject({
      locale: "ar",
      fixture: "stale",
    });
    expect(resolve("/admin", "lang=fr")).toMatchObject({
      locale: "en",
      fixture: "ready",
    });
  });

  it("accepts only the invented callback tokens for their own purpose", () => {
    expect(resolve("/auth/callback", "code=sample-verification")).toMatchObject(
      {
        composer: "auth",
        screen: "verify-email",
        callbackToken: "sample-verification",
      },
    );
    expect(
      resolve("/auth/callback", "code=sample-recovery&next=/reset-password"),
    ).toMatchObject({
      screen: "reset-password",
      callbackToken: "sample-recovery",
    });
    expect(resolve("/auth/callback", "code=sample-recovery")).toMatchObject({
      fixture: "expired",
      callbackToken: undefined,
    });
  });

  it("serves every table route through the loopback proxy and strips its rewrite", () => {
    // "/home" is the proxy's rewrite target for "/", not a public product URL.
    for (const route of syntheticRoutes.filter(
      ({ pattern }) => pattern !== "/home",
    ))
      expect(
        isProductDemoPath(route.pattern.replaceAll(/:[a-zA-Z]+/gu, "x")),
      ).toBe(true);
    expect(syntheticProductPath("/synthetic-runtime/learn")).toBe("/learn");
    expect(syntheticProductPath("/synthetic-runtime/home")).toBe("/home");
    expect(syntheticProductPath("/synthetic-runtime")).toBe("/");
    expect(syntheticProductPath("/learn")).toBe("/learn");
    expect(syntheticProductPath("/synthetic-runtimes/learn")).toBe(
      "/synthetic-runtimes/learn",
    );
  });
});
