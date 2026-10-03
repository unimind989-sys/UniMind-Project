import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const cohort = "zagazig-university-human-medicine-year-1-term-1-cohort";
const unit = "zagazig-university-human-medicine-y1-t1-anatomy";
const campaign = "11111111-1111-4111-8111-111111111111";
const surfaces = [
  {
    name: "auth",
    path: "/login",
  },
  {
    name: "catalog",
    path: "/preview/learn",
  },
  {
    name: "workspace",
    path: `/preview/learn/${cohort}/${unit}`,
  },
  {
    name: "submission",
    path: `/preview/batch-leader/campaigns/${campaign}`,
  },
  {
    name: "admin",
    path: "/preview/admin",
  },
] as const;

test.describe.configure({ timeout: 90_000 });

// Values are synthetic canaries, never credentials or real private material.
const privateCanaries = [
  "synthetic-server-credential-only",
  "synthetic/private/key",
  "WP03_PRIVATE_SOURCE_CANARY",
  "WP03_OTHER_USER_CANARY",
];
const privateField =
  /\\?"(?:rawObjectKey|object_key|workerDiagnostics|service_role_key|privateSourceText|otherUserState)\\?"\s*:/iu;

function observePrivacy(page: Page) {
  const failures: string[] = [];
  const pending: Promise<void>[] = [];
  let documents = 0;
  let reactPayloads = 0;
  const inspect = (text: string, kind: string) => {
    for (const canary of privateCanaries) {
      if (text.includes(canary)) failures.push(`${kind}: private canary`);
    }
    if (privateField.test(text))
      failures.push(`${kind}: private serialized field`);
  };
  page.on("request", (request) => {
    inspect(request.url(), "request URL");
    inspect(JSON.stringify(request.headers()), "request headers");
    inspect(request.postData() ?? "", "request body");
  });
  page.on("response", (response) => {
    if (response.status() >= 300 && response.status() < 400) return;
    // Next's development-only HMR manifest can outlive its document. It is not
    // an application payload; HTML, RSC and application JSON remain mandatory.
    if (
      /^\/_next\/static\/webpack\/[^/]+\.webpack\.hot-update\.json$/u.test(
        new URL(response.url()).pathname,
      )
    )
      return;
    const type = response.headers()["content-type"] ?? "";
    if (!/text\/html|text\/x-component|application\/json/iu.test(type)) return;
    pending.push(
      (async () => {
        const failure = await response.finished();
        if (failure !== null) return; // Interrupted navigation has no completed payload.
        inspect(await response.text(), "response");
        if (type.includes("text/html")) documents += 1;
        if (type.includes("text/x-component")) reactPayloads += 1;
      })().catch((error: unknown) => {
        failures.push(
          `response body unavailable: ${response.request().method()} ${new URL(response.url()).pathname} ${response.status()} ${error instanceof Error ? error.message : "unknown"}`,
        );
      }),
    );
  });
  return async () => {
    await Promise.all(pending);
    expect(failures).toEqual([]);
    expect(documents).toBeGreaterThan(0);
    return { documents, reactPayloads };
  };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname))
      return route.continue();
    await route.abort("blockedbyclient");
  });
});

async function assertGeometry(page: Page) {
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect
    .soft(geometry.width, "document reflow")
    .toBeLessThanOrEqual(geometry.viewport + 1);
}

async function assertAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal") // Development tooling is absent from the production surface.
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect
    .soft(
      results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
      "WCAG A/AA automated findings",
    )
    .toEqual([]);
}

for (const surface of surfaces) {
  for (const locale of ["en", "ar"] as const) {
    test(`${surface.name} ${locale}: accessibility, focus, reflow, motion and privacy`, async ({
      page,
    }, testInfo) => {
      const finishPrivacy = observePrivacy(page);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.name));
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${surface.path}?lang=${locale}`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      await page.evaluate(() => document.fonts.ready);
      await assertAccessible(page);
      await assertGeometry(page);

      // Accessibility-tree smoke: names, headings and native form semantics as
      // exposed to assistive technology. This is not a spoken screen-reader run.
      const tree = await page.getByRole("main").ariaSnapshot();
      expect(tree).toContain("heading");
      expect(tree).not.toContain("undefined");
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) return null;
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          outline: style.outlineStyle,
          shadow: style.boxShadow,
        };
      });
      expect(focused).not.toBeNull();
      expect(focused?.tag).not.toBe("BODY");
      expect(focused?.outline !== "none" || focused.shadow !== "none").toBe(
        true,
      );
      await assertAccessible(page); // Includes the revealed keyboard skip link.

      for (const width of [640, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await assertGeometry(page);
      }
      const targets = await page
        .locator(
          "main button, main select, main input:not([type=hidden]), main a",
        )
        .evaluateAll((elements) =>
          elements.flatMap((element) => {
            const rectangle = element.getBoundingClientRect();
            if (rectangle.width === 0 || rectangle.height === 0) return [];
            if (
              element instanceof HTMLInputElement &&
              ["checkbox", "radio", "file"].includes(element.type)
            ) {
              const label = element.labels?.[0];
              if (label) {
                const bounds = label.getBoundingClientRect();
                return bounds.width < 44 || bounds.height < 44
                  ? [element.id]
                  : [];
              }
            }
            return rectangle.width < 44 || rectangle.height < 44
              ? [
                  element.textContent?.trim() ||
                    element.getAttribute("name") ||
                    element.tagName,
                ]
              : [];
          }),
        );
      expect.soft(targets, "44px touch targets").toEqual([]);
      // 200% text scaling tests text growth independently of viewport reflow.
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
      await assertGeometry(page);
      await assertAccessible(page);
      const animations = await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.playState === "running" &&
                animation.effect?.getComputedTiming().iterations === Infinity,
            ).length,
      );
      expect(animations, "no endless motion under reduced-motion").toBe(0);
      const network = await finishPrivacy();
      expect(errors).toEqual([]);
      await testInfo.attach("contract-summary", {
        body: JSON.stringify({
          surface: surface.name,
          locale,
          network,
          semanticSmoke: true,
        }),
        contentType: "application/json",
      });
    });
  }
}

test("protected direct URLs and upload API reject anonymous and forged role inputs", async ({
  page,
  request,
}) => {
  const finishPrivacy = observePrivacy(page);
  for (const path of [
    "/learn",
    `/learn/${cohort}/${unit}/chat`,
    "/admin",
    "/admin/sources",
    "/batch-leader",
  ]) {
    await page.goto(`${path}?role=ADMIN&actor=ahmed`);
    await expect(page).toHaveURL(/\/login\?/u);
    await expect(
      page.getByRole("heading", { name: "Admin decision queue" }),
    ).toHaveCount(0);
    await finishPrivacy();
  }
  const response = await request.post(
    `/api/batch-leader/campaigns/${campaign}/uploads?role=BATCH_LEADER`,
    {
      multipart: {
        requestedItemId: "forged",
        file: {
          name: "synthetic.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nSynthetic only"),
        },
      },
    },
  );
  expect([400, 403]).toContain(response.status());
  expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
  expect(response.headers()["cache-control"]).toContain("no-store");
  await finishPrivacy();
});

test("RSC navigation, action responses and upload receipts remain safe", async ({
  page,
}) => {
  const finishPrivacy = observePrivacy(page);
  await page.goto(`/preview/learn/${cohort}/${unit}?lang=en`);
  await finishPrivacy();
  await page.getByRole("link", { name: "View status" }).first().click();
  await expect(page).toHaveURL(/\/chat\?lang=en/u, { timeout: 20_000 });
  await page.getByRole("button", { name: "Start a scoped session" }).click();
  await expect(page).toHaveURL(/session=/u);
  await finishPrivacy();
  await page.goto("/preview/admin?lang=en&state=containment");
  await page
    .getByLabel("Reason for this change")
    .fill("Synthetic privacy contract check.");
  await page.getByRole("button", { name: "Review exact change" }).click();
  await page.getByRole("button", { name: "Submit this action" }).click();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeVisible();
  await finishPrivacy();
  await page.goto(`/preview/batch-leader/campaigns/${campaign}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\nSynthetic only"),
  });
  await page.getByText("Source details", { exact: true }).click();
  await page
    .getByLabel("Source title")
    .fill("Synthetic privacy contract handout");
  await page
    .getByLabel("Professor or source description")
    .fill("Generated test fixture only.");
  await page.getByLabel(/I have permission/u).check();
  await assertAccessible(page);
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await expect(page.getByText("Submission received")).toBeVisible({
    timeout: 20_000,
  });
  const counts = await finishPrivacy();
  expect(counts.reactPayloads).toBeGreaterThan(0);
});
