// Hosted synthetic entry (WP03-T11): the real login page hands an invented
// @example.invalid account to the browser-only synthetic runtime.
import { expect, type Page } from "@playwright/test";

export const hostedPassword = "Synthetic-study-2026!";

const pick = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;

/**
 * Signs an invented account in through the real login and consent screens.
 * The returned check fails the test if, after entry, the page sent anything
 * but a local GET (no API, server action or RSC request) or threw.
 */
export async function enterHosted(
  page: Page,
  role: string,
  locale = "en",
  next?: string,
) {
  await page.goto(
    `/login?lang=${locale}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
  );
  await expect(
    page.getByLabel(pick(locale, "Email address", "البريد الإلكتروني")),
  ).toHaveValue("");
  await page
    .getByLabel(pick(locale, "Email address", "البريد الإلكتروني"))
    .fill(`${role}@example.invalid`);
  await page
    .getByLabel(pick(locale, "Password", "كلمة المرور"), { exact: true })
    .fill(hostedPassword);
  const forbidden: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      request.method() !== "GET" ||
      url.pathname.startsWith("/api/") ||
      request.headers()["rsc"] ||
      url.hostname !== "127.0.0.1"
    )
      forbidden.push(`${request.method()} ${url.pathname}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("button", {
      name: pick(locale, "Continue", "متابعة"),
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: pick(
        locale,
        "Accept all and continue to UniMind",
        "الموافقة والمتابعة إلى UniMind",
      ),
      exact: true,
    })
    .click();
  await expect(page).not.toHaveURL(/\/consent\?/u);
  return () => {
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  };
}
