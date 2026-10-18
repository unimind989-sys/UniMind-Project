import { getAuthCopy, promptExamples, type Locale } from "./app-fixtures";
import { localized } from "./copy";
import { expect, type Page } from "./test";

export type Role = "student" | "leader" | "admin" | "second-admin";

/**
 * Fails the test if the page sends anything other than local GET/HEAD
 * requests, calls an API, receives a cookie or throws. Call the returned
 * function at the end of the journey.
 */
export function isolation(page: Page) {
  const violations: string[] = [];
  page.on("request", (request) => {
    if (
      !["GET", "HEAD"].includes(request.method()) ||
      new URL(request.url()).hostname !== "127.0.0.1" ||
      new URL(request.url()).pathname.startsWith("/api/")
    )
      violations.push(`${request.method()} ${new URL(request.url()).pathname}`);
  });
  page.on("response", (response) => {
    if (response.headers()["set-cookie"]) violations.push("cookie");
  });
  page.on("pageerror", (error) => violations.push(error.name));
  return () => expect(violations).toEqual([]);
}

/** Signs a synthetic role in through the product login and consent screens. */
export async function signIn(
  page: Page,
  role: Role | string = "student",
  locale: Locale = "en",
  next?: string,
) {
  const copy = getAuthCopy(locale);
  const response = await page.goto(
    `/login?lang=${locale}&email=${role}@example.invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`,
  );
  // A relative rewrite stays inside the dev server. An absolute one means Next
  // proxies the render to itself over HTTP, which drops connections (WP03-T22).
  expect(response?.headers()["x-middleware-rewrite"]).toMatch(
    /^\/synthetic-runtime\/login\?/u,
  );
  await expect(page.getByLabel(copy.email)).toHaveValue(
    `${role}@example.invalid`,
  );
  // A click that lands before the login form hydrates is ignored; retry it.
  await expect(async () => {
    if (!/\/consent\?/u.test(page.url()))
      await page
        .getByRole("button", { name: copy.signIn, exact: true })
        .click({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/consent\?/u, { timeout: 5_000 });
  }).toPass({ timeout: 30_000 });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.accept, exact: true }).click();
  await expect(page).not.toHaveURL(/\/consent\?/u);
}

/**
 * From the login screen of the same document, continues as another synthetic
 * account (optionally with the shared synthetic password) and accepts consent.
 */
export async function continueAs(
  page: Page,
  email: string,
  locale: Locale = "en",
  options: { password?: boolean } = {},
) {
  const copy = getAuthCopy(locale);
  await page.getByLabel(copy.email, { exact: true }).fill(email);
  if (options.password)
    await page
      .getByLabel(copy.password, { exact: true })
      .fill("Synthetic-study-2026!");
  await page.getByRole("button", { name: copy.signIn, exact: true }).click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.accept, exact: true }).click();
}

/**
 * Follows the same client router as a product link, preserving the demo's
 * document-local adapter. No identity is injected by the helper.
 */
export async function navigate(
  page: Page,
  path: string,
  locale: Locale = "en",
) {
  await page
    .locator(`a[href="${path}?lang=${locale}"]`)
    .filter({ visible: true })
    .first()
    .click();
}

/** Sends one of the supplied sample prompts and waits for the stream to end. */
export async function send(
  page: Page,
  kind: keyof typeof promptExamples,
  locale: Locale = "en",
) {
  await page
    .getByLabel(locale === "ar" ? "السؤال" : "Message", { exact: true })
    .fill(localized(promptExamples[kind], locale));
  await page
    .getByRole("button", {
      name: locale === "ar" ? "إرسال" : "Send",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: locale === "ar" ? "بث محاكى" : "Simulated stream" }),
  ).toHaveCount(0);
}

/** Opens the Chat "Sessions and privacy" disclosure if it is closed. */
export async function openSessionTools(page: Page, locale: Locale) {
  const summary = page.locator(
    `summary[aria-label^="${locale === "ar" ? "الجلسات والخصوصية" : "Sessions and privacy"}"]`,
  );
  await summary.waitFor();
  if ((await summary.locator("..").getAttribute("open")) === null)
    await summary.click();
}
