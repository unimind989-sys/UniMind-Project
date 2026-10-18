import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname)) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
});

test("login presents one identity form and supports RTL", async ({ page }) => {
  await page.goto("/login?lang=en&next=%2Flearn%2Frenal");

  await expect(
    page.getByRole("link", { name: "UniMind", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign in to UniMind" }),
  ).toBeVisible();
  await expect(page.getByRole("search")).toHaveCount(0);
  // Sign-in names the account: password managers pair `username` with the
  // current password (WP03-T29 IX-14).
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "username",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.locator('input[name="returnPath"]')).toHaveValue(
    "/learn/renal",
  );
  await page.getByRole("link", { name: "العربية", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "تسجيل الدخول إلى UniMind" }),
  ).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
});

test("a forged return path is replaced before it reaches the form or links", async ({
  page,
}) => {
  await page.goto(
    "/login?next=https%3A%2F%2Fattacker.invalid%2Fsteal&status=not_allowed",
  );

  await expect(page.locator('input[name="returnPath"]')).toHaveValue("/learn");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  const registrationHref = await page
    .getByRole("link", { name: "Create an account" })
    .getAttribute("href");
  expect(registrationHref).not.toContain("attacker.invalid");
  expect(registrationHref).toContain("%2Flearn");
});

test("invalid login restores focus to a generic summary and marks fields", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("not-an-email");
  await page
    .getByLabel("Password", { exact: true })
    .fill("invalid-form-specimen");
  await page.getByRole("button", { name: "Continue" }).click();

  const summary = page.getByRole("main").getByRole("alert");
  await expect(summary).toContainText("Check the marked fields");
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "false",
  );
});

// WP03-T29 IX-01: React resets an action form after every submission. A
// failed sign-in (here Auth is unreachable) keeps the typed email and never
// the password.
test("a failed sign-in keeps the typed email and clears the password", async ({
  page,
}) => {
  await page.goto("/login?lang=en");
  const email = page.getByLabel("Email address");
  const password = page.getByLabel("Password", { exact: true });
  await email.fill("synthetic.student@example.com");
  await password.fill("synthetic-specimen-only");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
  // The cleared password proves React's reset ran; the email survived it.
  await expect(password).toHaveValue("");
  await expect(email).toHaveValue("synthetic.student@example.com");
  // A second failure keeps the corrected address, not the first one.
  await email.fill("another.student@example.com");
  await password.fill("synthetic-specimen-only");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(password).toHaveValue("");
  await expect(email).toHaveValue("another.student@example.com");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
});

// WP03-T29 IX-14, IX-16: keyboard hints, autocomplete, limits and the
// password policy reach browsers, password managers and screen readers.
test("auth inputs carry their keyboard, autocomplete and policy semantics", async ({
  page,
}) => {
  await page.goto("/login?lang=en");
  const email = page.getByLabel("Email address");
  await expect(email).toHaveAttribute("type", "email");
  await expect(email).toHaveAttribute("enterkeyhint", "next");
  await expect(email).toHaveAttribute("autocapitalize", "none");
  await expect(email).toHaveAttribute("spellcheck", "false");
  await expect(email).toHaveAttribute("maxlength", "320");
  const loginPassword = page.getByLabel("Password", { exact: true });
  await expect(loginPassword).toHaveAttribute("enterkeyhint", "go");
  await expect(loginPassword).toHaveAttribute("maxlength", "1024");
  await expect(loginPassword).not.toHaveAttribute("passwordrules");
  // One signal per state: a switching name, no `aria-pressed`.
  const show = page.getByRole("button", { name: "Show password" });
  await expect(show).not.toHaveAttribute("aria-pressed");
  await show.click();
  await expect(loginPassword).toHaveAttribute("type", "text");
  await expect(
    page.getByRole("button", { name: "Hide password" }),
  ).not.toHaveAttribute("aria-pressed");

  await page.goto("/register?lang=en");
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email",
  );
  const password = page.getByLabel("Password", { exact: true });
  await expect(password).toHaveAttribute("autocomplete", "new-password");
  await expect(password).toHaveAttribute("minlength", "12");
  await expect(password).toHaveAttribute("maxlength", "128");
  await expect(password).toHaveAttribute(
    "passwordrules",
    "minlength: 12; maxlength: 128; required: lower, upper; required: digit; required: special;",
  );
  await expect(password).toHaveAccessibleDescription(
    "Use at least 12 characters with a letter, number, and symbol.",
  );
  const confirmation = page.getByLabel("Confirm password", { exact: true });
  await expect(confirmation).toHaveAttribute("autocomplete", "new-password");
  await expect(confirmation).toHaveAttribute("enterkeyhint", "go");

  await page.goto("/forgot-password?lang=en");
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "enterkeyhint",
    "send",
  );
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email",
  );
});

test("a missing password stays local and focuses its described field in both locales", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") submissions.push(request.url());
  });
  for (const [locale, passwordLabel, continueLabel, required] of [
    ["en", "Password", "Continue", "Enter your password."],
    ["ar", "كلمة المرور", "متابعة", "أدخل كلمة المرور."],
  ] as const) {
    await page.goto(`/login?lang=${locale}`);
    await page
      .getByRole("button", { name: continueLabel, exact: true })
      .click();
    const password = page.getByLabel(passwordLabel, { exact: true });
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute("aria-invalid", "true");
    await expect(password).toHaveAccessibleDescription(required);
    await expect(page).toHaveURL(new RegExp(`/login\\?lang=${locale}$`, "u"));
  }
  expect(submissions).toEqual([]);
});

test("public link states are bounded and recovery actions are visible", async ({
  page,
}) => {
  await page.goto("/verify-email?status=expired_link");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "link has expired",
  );
  await expect(
    page.getByRole("button", { name: "Resend verification email" }),
  ).toBeVisible();

  await page.goto("/forgot-password?status=replayed_link");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "already been used",
  );
  await expect(
    page.getByRole("button", { name: "Send recovery email" }),
  ).toBeVisible();
});

test("learning routes reject missing verified sessions", async ({ page }) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/login\?lang=en&next=%2Flearn$/u);
});

test("reset routes reject missing verified sessions", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page).toHaveURL(
    /\/forgot-password\?lang=en&status=invalid_link$/u,
  );
});

test("an incomplete callback becomes a generic recoverable link state", async ({
  page,
}) => {
  await page.goto("/auth/callback?next=https%3A%2F%2Fattacker.invalid");
  await expect(page).toHaveURL(/\/verify-email\?status=invalid_link$/u);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "link is invalid",
  );
});

test("mobile routes expose the current access step without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/verify-email?lang=ar");
  await expect(
    page.getByRole("heading", { name: "راجع بريدك الإلكتروني" }),
  ).toBeVisible();

  const activeStage = page.locator('li[aria-current="step"]');
  await expect(activeStage).toHaveCount(1);
  await expect
    .poll(async () => (await activeStage.boundingBox())?.x ?? -1)
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(async () => {
      const rectangle = await activeStage.boundingBox();
      return rectangle === null
        ? Number.POSITIVE_INFINITY
        : rectangle.x + rectangle.width;
    })
    .toBeLessThanOrEqual(390);

  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

// WP03-T28: the interface language is remembered between visits.
test("a chosen interface language is remembered for later visits", async ({
  page,
  context,
}) => {
  await page.goto("/login?lang=ar");
  const cookie = (await context.cookies()).find(
    (entry) => entry.name === "unimind-locale",
  );
  expect(cookie).toMatchObject({
    value: "ar",
    httpOnly: true,
    sameSite: "Lax",
  });
  // A later visit without ?lang= (a typed address or an old bookmark).
  await page.goto("/login?next=%2Flearn");
  await expect(page).toHaveURL(/\/login\?next=%2Flearn&lang=ar$/u);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  // Signed-out guards keep it too.
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/login\?.*lang=ar/u);
  // Choosing English updates the memory.
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/lang=en/u);
  await page.goto("/register");
  await expect(page).toHaveURL(/\/register\?lang=en$/u);
});

test("registration refuses reserved test domains before Auth", async ({
  page,
}) => {
  await page.goto("/register?lang=en");
  await page.getByLabel("Email address").fill("student@example.invalid");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Synthetic!Password1");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Synthetic!Password1");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByRole("main")).toContainText(
    "Demo accounts sign in directly on the sign-in page.",
  );
  await expect(page).toHaveURL(/\/register\?/u);
  // The refused address stays for correction; the passwords clear (IX-01).
  await expect(page.getByLabel("Email address")).toHaveValue(
    "student@example.invalid",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});
