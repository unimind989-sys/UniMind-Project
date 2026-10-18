import { inLocales, pick } from "../support/copy";
import { showAccountView, unit } from "../support/demo";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";
test(
  `auth validation, registration, email callback, consent and recovery use no real services`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await page.goto("/login");
    await page.getByLabel("Email address").fill("invalid");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
    await page
      .getByRole("link", { name: "Create an account", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(page).toHaveURL(/\/verify-email\?/u);
    await page
      .getByRole("button", { name: "Resend verification email", exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText("email");
    // This supplied link replaces the email delivery fixture, outside product UI.
    await page.goto("/auth/callback?code=sample-verification&type=signup");
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Accept all and continue to UniMind",
        exact: true,
      })
      .click();
    // A new registration has no profile yet: the profile step comes next.
    await expect(page).toHaveURL(/\/welcome\?/u);
    await page.getByLabel("Full name", { exact: true }).fill("Nour Adel");
    await page
      .getByRole("button", { name: "Save and continue", exact: true })
      .click();
    await expect(page).toHaveURL(/\/learn\?/u);
    await navigate(page, "/settings");
    await showAccountView(page, "identity");
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .first()
      .click();
    await page
      .getByRole("link", { name: "Forgot your password?", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Send recovery email", exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText("email");
    await page.goto(
      "/auth/callback?code=sample-recovery&next=%2Freset-password",
    );
    await page
      .getByRole("button", { name: "Update password", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login\?/u);
    for (const fixture of ["expired", "replayed"]) {
      await page.goto(
        `/reset-password?token=sample-recovery&fixture=${fixture}`,
      );
      await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Update password", exact: true }),
      ).toHaveCount(0);
    }
    finish();
  },
);

test(
  `the runtime blocks mutations and foreign origins; another document cannot inherit access`,
  { tag: ["@demo-core"] },
  async ({ page, request, context }) => {
    await signIn(page);
    const second = await context.newPage();
    await second.goto(unit + "/chat");
    await expect(second).toHaveURL(/\/login\?/u);
    for (const path of [
      "/login",
      "/admin",
      "/api/batch-leader/campaigns/sample-campaign/uploads",
      "/api/health/live",
      "/_next/static/test.png",
    ])
      expect(
        (await request.post(path, { data: { synthetic: true } })).status(),
      ).toBe(403);
    expect(
      (
        await request.get(
          "/api/preview/batch-leader/campaigns/sample-campaign/uploads",
        )
      ).status(),
    ).toBe(403);
    expect((await request.get("/api/health/live")).status()).toBe(403);
    // Raw data URLs that the router maps to real routes (WP03-T22).
    for (const path of [
      "/_next/data/development/admin.json",
      "/_next/data/development/api/health/live.json",
    ])
      expect((await request.get(path)).status()).toBe(404);
    expect(
      (await request.get("/images/study-shelf/clinical-medicine.png")).status(),
    ).toBe(200);
    expect(
      (
        await request.get("/demo-files/unimind-synthetic-test-pack.zip")
      ).status(),
    ).toBe(200);
    expect(
      (
        await request.get("/login", { headers: { host: "attacker.invalid" } })
      ).status(),
    ).toBe(503);
    await page.reload();
    await expect(page).toHaveURL(/\/login\?/u);
    await second.close();
  },
);

test(
  `normal sign-out changes roles without carrying the previous role's screen`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "student", "en", unit + "/chat");
    await navigate(page, "/settings");
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
    await showAccountView(page, "identity");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?lang=en$/u);
    await page.getByLabel("Email address").fill("leader@example.invalid");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Accept all and continue to UniMind",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/batch-leader\?/u);
    await navigate(page, "/settings");
    await expect(
      page.getByRole("heading", { name: "Account", exact: true }),
    ).toBeVisible();
    await showAccountView(page, "identity");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?lang=en$/u);
    await page.getByLabel("Email address").fill("admin@example.invalid");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Accept all and continue to UniMind",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/admin\?/u);
    finish();
  },
);

inLocales(["en"], (locale) => {
  test(
    `password disclosure preserves the value and a blank submission names the required field`,
    { tag: ["@open-folio", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await page.goto(`/login?lang=${locale}`);
      const password = page.getByLabel(
        pick(locale, "Password", "كلمة المرور"),
        {
          exact: true,
        },
      );
      await password.fill("");
      await page
        .getByRole("button", {
          name: pick(locale, "Continue", "متابعة"),
          exact: true,
        })
        .click();
      await expect(password).toBeFocused();
      await expect(password).toHaveAttribute("aria-invalid", "true");
      const description = await password.getAttribute("aria-describedby");
      await expect(page.locator(`[id="${description}"]`)).toBeVisible();
      await password.fill("visible field specimen");
      await page
        .getByRole("button", {
          name: pick(locale, "Show password", "إظهار كلمة المرور"),
          exact: true,
        })
        .click();
      await expect(password).toHaveAttribute("type", "text");
      await expect(password).toHaveValue("visible field specimen");
      await page
        .getByRole("button", {
          name: pick(locale, "Hide password", "إخفاء كلمة المرور"),
          exact: true,
        })
        .click();
      await expect(password).toHaveAttribute("type", "password");
      finish();
    },
  );
});
