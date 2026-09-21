import { expect, test } from "@playwright/test";

const cohort = "zagazig-university-human-medicine-year-1-term-1-cohort";
const unit = "zagazig-university-human-medicine-y1-t1-anatomy";
const base = `/preview/learn/${cohort}/${unit}`;
const workspaceExpect = expect.configure({ timeout: 20_000 });

test.describe.configure({ timeout: 60_000 });

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname))
      return route.continue();
    await route.abort("blockedbyclient");
  });
});

test("the overview exposes canonical scope, truthful state, and real child routes", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await workspaceExpect(
    page.getByRole("heading", { name: "Anatomy", level: 1 }),
  ).toBeVisible();
  await workspaceExpect(page.getByText("8 approved sources")).toBeVisible();
  await workspaceExpect(
    page.getByText("Not active in this mock"),
  ).toBeVisible();
  await workspaceExpect(page.getByText("Planned capability")).toHaveCount(5);
  await page.keyboard.press("Tab");
  await workspaceExpect(
    page.getByRole("link", { name: "Overview" }).first(),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await workspaceExpect(page.getByRole("main")).toBeFocused();
  await page.getByRole("link", { name: "View status" }).first().click();
  await workspaceExpect(page).toHaveURL(new RegExp(`${base}/chat\\?lang=en`));
  await workspaceExpect(
    page.getByText("Messaging is not available in WP03-T04."),
  ).toBeVisible();
});

test("the mock chat creates, persists, and switches caller-scoped sessions", async ({
  page,
}) => {
  await page.goto(`${base}/chat?lang=en`);
  await page.getByRole("button", { name: "Start a scoped session" }).click();
  await workspaceExpect(page).toHaveURL(/session=[0-9a-f-]+/u);
  const firstSession = new URL(page.url()).searchParams.get("session");
  expect(firstSession).not.toBeNull();
  await page.reload();
  await workspaceExpect(
    page.getByText(firstSession?.slice(0, 8) ?? "missing"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start a scoped session" }).click();
  await page.waitForURL(
    (url) => url.searchParams.get("session") !== firstSession,
  );
  const secondSession = new URL(page.url()).searchParams.get("session");
  expect(secondSession).not.toBe(firstSession);
  await page.getByRole("link", { name: /Session 1/u }).click();
  await workspaceExpect(page).toHaveURL(new RegExp(`session=${firstSession}`));
});

test("forged and release-stale child routes share one non-identifying boundary", async ({
  page,
}) => {
  await page.goto("/preview/learn/forged-cohort/forged-unit/chat?lang=en");
  await workspaceExpect(
    page.getByRole("heading", { name: "Workspace unavailable" }),
  ).toBeVisible();
  await workspaceExpect(page.getByText("Anatomy", { exact: true })).toHaveCount(
    0,
  );

  await page.goto(`${base}/chat?lang=en`);
  await page.getByRole("button", { name: "Start a scoped session" }).click();
  const active = new URL(page.url());
  active.searchParams.set("state", "deactivated");
  await page.goto(active.toString());
  await workspaceExpect(
    page.getByRole("heading", { name: "Workspace unavailable" }),
  ).toBeVisible();
  await workspaceExpect(
    page.getByText("8 approved sources").first(),
  ).toBeHidden();
});

test("Arabic uses the intended face and stays aligned at a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}?lang=ar`);
  await workspaceExpect(page.locator("html")).toHaveAttribute("lang", "ar");
  await workspaceExpect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await workspaceExpect(
    page.getByRole("heading", { name: "علم التشريح", level: 1 }),
  ).toBeVisible();

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  });
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "h1",
  });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  expect(
    fonts.some(
      (font: { familyName: string; isCustomFont: boolean }) =>
        font.familyName === "Noto Sans Arabic" && font.isCustomFont,
    ),
  ).toBe(true);

  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    controls: Array.from(document.querySelectorAll("a,button,textarea"))
      .filter((element) => (element as HTMLElement).offsetParent !== null)
      .map((element) => element.getBoundingClientRect().height),
    clipped: Array.from(
      document.querySelectorAll("button,a,input,textarea,[role=status]"),
    ).filter((element) => {
      const style = getComputedStyle(element);
      return (
        ["hidden", "clip"].includes(style.overflowY) &&
        element.scrollHeight > element.clientHeight + 1
      );
    }).length,
    bodyWeight: getComputedStyle(document.body).fontWeight,
    fontAdjust: getComputedStyle(document.documentElement).fontSizeAdjust,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(Math.min(...geometry.controls)).toBeGreaterThanOrEqual(44);
  expect(geometry.clipped).toBe(0);
  expect(Number(geometry.bodyWeight)).toBeGreaterThanOrEqual(450);
  expect(geometry.fontAdjust).toBe("0.56");
});

test("English keeps Manrope and the shell survives 200 percent zoom geometry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto(`${base}?lang=en`);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  });
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "h1",
  });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  expect(
    fonts.some((font: { familyName: string }) =>
      font.familyName.startsWith("Manrope"),
    ),
  ).toBe(true);
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  await workspaceExpect(
    page.getByRole("navigation", { name: "Workspace navigation" }),
  ).toBeVisible();
});
