import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Page,
  type Request as BrowserRequest,
} from "@playwright/test";
import { assertGitHubHostedLinuxRunner } from "../../scripts/lib/ephemeral-supabase";
import {
  expectChatScreen,
  expectMaterialsScreen,
  expectQuizSetupScreen,
  expectStudentSettingsScreen,
  expectStudioScreen,
  expectStudyFrame,
  openChatSessions,
} from "../e2e/support/shared-screens";

assertGitHubHostedLinuxRunner(process.env);
const cohort = "20000000-0000-4000-8000-000000000006";
const unit = "20000000-0000-4000-8000-000000000007";
const campaign = "30000000-0000-4000-8000-000000000001";
const workspace = `/learn/${cohort}/${unit}/chat?lang=en`;
const roles = ["student", "leader", "admin"] as const;
type Role = (typeof roles)[number];
const users = new Map<Role, { id: string; email: string; password: string }>();
let databaseContainer: string;
let inspections: Promise<void>[] = [];
let exposure: string[] = [];
let inspectedDocuments = 0;
let stopInspection: () => void;
let capturedRequests: WeakSet<BrowserRequest>;

function sql(query: string): string {
  try {
    return (
      execFileSync(
        "docker",
        [
          "exec",
          "-i",
          databaseContainer,
          "psql",
          "--no-psqlrc",
          "--quiet",
          "--username",
          "postgres",
          "--dbname",
          "postgres",
          "--tuples-only",
          "--no-align",
          "--set",
          "ON_ERROR_STOP=1",
        ],
        {
          input: `begin; select set_config('unimind.actor_id', '10000000-0000-4000-8000-000000000001', true);
        select set_config('unimind.audit_reason', 'WP03-T08 disposable browser fixture', true);
        select set_config('unimind.correlation_id', '${randomUUID()}', true); ${query} commit;`,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
        },
      )
        .trim()
        .split(/\r?\n/u)
        .at(-1) ?? ""
    );
  } catch {
    throw new Error(
      "Disposable browser fixture SQL failed; no credential/payload output retained.",
    );
  }
}

function inspect(body: string): void {
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    (serverKey !== undefined && body.includes(serverKey)) ||
    /synthetic\/raw\/|synthetic\/processed\/|UNIMIND_SYNTHETIC_CANARY_SOURCE_WP01/u.test(
      body,
    ) ||
    /\\?"(?:object_key|provider_payload|worker_diagnostics|source_text)\\?"\s*:/u.test(
      body,
    )
  )
    exposure.push("private data in browser response");
}

async function login(page: Page, role: Role) {
  const user = users.get(role);
  if (user === undefined) throw new Error("Synthetic role fixture is missing.");
  await page.goto("/login?lang=en");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  const actionResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/login",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const response = await actionResponse;
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["pragma"]).toBe("no-cache");
  expect(response.headers()["expires"]).toBe("0");
  await expect(page).toHaveURL(
    role === "admin"
      ? /\/admin(?:\?|$)/u
      : role === "leader"
        ? /\/batch-leader(?:\?|$)/u
        : /\/learn(?:\?|$)/u,
  );
}

async function expectNoAxeViolations(page: Page, label: string) {
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
      `WCAG A/AA automated findings: ${label}`,
    )
    .toEqual([]);
}

async function expectReflow(page: Page, label: string) {
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect
    .soft(geometry.width, `document reflow: ${label}`)
    .toBeLessThanOrEqual(geometry.viewport + 1);
}

/**
 * The accessibility, focus, reflow and reduced-motion contract the retired
 * /preview workspace checked, applied to the real page currently loaded. The
 * viewport and text size are restored afterwards.
 */
async function expectAccessibleWorkspacePage(
  page: Page,
  locale: "en" | "ar",
  name: string,
) {
  const label = `${name} ${locale}`;
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute(
    "dir",
    locale === "ar" ? "rtl" : "ltr",
  );
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectNoAxeViolations(page, label);
  await expectReflow(page, `${label} 1440px`);

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
  expect(focused, `keyboard focus: ${label}`).not.toBeNull();
  expect(focused?.tag).not.toBe("BODY");
  expect(focused?.outline !== "none" || focused.shadow !== "none").toBe(true);

  for (const width of [640, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectReflow(page, `${label} ${String(width)}px`);
  }
  // 200% text scaling tests text growth independently of viewport reflow.
  const enlarged = await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  await expectReflow(page, `${label} 320px 200% text`);
  await expectNoAxeViolations(page, `${label} 200% text`);
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
  expect(animations, `no endless motion under reduced motion: ${label}`).toBe(
    0,
  );
  await enlarged.evaluate((element) =>
    element.parentNode?.removeChild(element),
  );
  await page.setViewportSize(viewport);
}

test.beforeAll(async () => {
  const names = execFileSync("docker", ["ps", "--format", "{{.Names}}"], {
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/u)
    .filter((name) => /^supabase_db_/u.test(name));
  if (names.length !== 1 || names[0] === undefined)
    throw new Error("Expected exactly one disposable database.");
  databaseContainer = names[0];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url === undefined || key === undefined)
    throw new Error("Disposable Auth configuration missing.");
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const role of roles) {
    const nonce = randomUUID();
    const email = `wp03-t08-${role}-${nonce}@synthetic.unimind.invalid`;
    const password = `Synthetic-A1!${nonce}`;
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error !== null || created.data.user === null)
      throw new Error("Synthetic role creation failed.");
    const id = created.data.user.id;
    if (!/^[a-f0-9-]{36}$/u.test(id))
      throw new Error("Synthetic user identifier invalid.");
    users.set(role, { id, email, password });
    sql(`update public.profiles set account_status = 'ACTIVE', display_name = 'Synthetic ${role}' where user_id = '${id}';
      insert into public.terms_acceptances (user_id, terms_version_id, terms_version, privacy_version, educational_boundary_version)
      select '${id}', id, terms_version, privacy_version, educational_boundary_version from public.terms_versions where status = 'ACTIVE';`);
  }
  sql(`insert into public.cohort_memberships (user_id, cohort_id, status, starts_at, ends_at, granted_by, grant_reason)
    values ('${users.get("student")!.id}', '${cohort}', 'ACTIVE', now() - interval '1 day', now() + interval '1 day',
      '10000000-0000-4000-8000-000000000001', 'Synthetic product-shell gate membership');
    insert into public.batch_leader_assignments (campaign_id, user_id, status, expires_at, invited_by, accepted_at)
    values ('${campaign}', '${users.get("leader")!.id}', 'ACTIVE', now() + interval '1 day',
      '10000000-0000-4000-8000-000000000001', now());
    insert into public.user_roles (user_id, role, granted_by, grant_reason)
    values ('${users.get("admin")!.id}', 'ADMIN', '10000000-0000-4000-8000-000000000001', 'Synthetic product-shell gate administrator'),
      ('${users.get("leader")!.id}', 'BATCH_LEADER', '10000000-0000-4000-8000-000000000001', 'Synthetic product-shell gate Batch Leader');
    insert into public.requested_material_items (campaign_id, curriculum_unit_id, title, expected_type, required, status)
    select '${campaign}', '${unit}', 'Synthetic gate document', 'DOCUMENT', true, 'REQUESTED'
    where not exists (select 1 from public.requested_material_items where campaign_id = '${campaign}' and curriculum_unit_id = '${unit}');`);
  // Diagnose fixture authority before browser/session behavior. Never log
  // credentials or returned rows; these are the same caller RPCs used by pages.
  const caller = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  for (const role of ["student", "leader"] as const) {
    const user = users.get(role)!;
    const signedIn = await caller.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
    expect(signedIn.error?.code ?? "none", `${role} fixture sign-in`).toBe(
      "none",
    );
    const result =
      role === "student"
        ? await caller.rpc("current_student_workspace", {
            target_cohort_id: cohort,
            target_curriculum_unit_id: unit,
          })
        : await caller.rpc("current_batch_leader_campaign", {
            target_campaign_id: campaign,
          });
    expect(result.error?.code ?? "none", `${role} fixture RPC`).toBe("none");
    expect(
      result.data?.length ?? 0,
      `${role} fixture authorized scope`,
    ).toBeGreaterThan(0);
    await caller.auth.signOut({ scope: "local" });
  }
});

test.beforeEach(async ({ page }) => {
  sql(`update public.cohort_releases set release_status = 'UNLOCKED', reason = 'Restore synthetic browser fixture' where cohort_id = '${cohort}';
    update public.source_versions set activation_status = 'ACTIVE' where id = '41000000-0000-4000-8000-000000000001';
    update public.cohort_memberships set status = 'ACTIVE' where user_id = '${users.get("student")!.id}';
    update public.batch_leader_assignments set status = 'ACTIVE', revoked_at = null where user_id = '${users.get("leader")!.id}';`);
  inspections = [];
  exposure = [];
  inspectedDocuments = 0;
  capturedRequests = new WeakSet();
  const completedRequest = (request: BrowserRequest) => {
    if (capturedRequests.has(request)) return;
    inspections.push(
      (async () => {
        const response = await request.response();
        if (response === null) {
          exposure.push("completed browser request has no response");
          return;
        }
        // Redirects carry navigation instructions, not an inspectable page body.
        if (response.status() >= 300 && response.status() < 400) return;
        const mime = response.headers()["content-type"] ?? "";
        if (!/text\/html|text\/x-component|application\/json/iu.test(mime))
          return;
        let body: string;
        try {
          body = await response.text();
        } catch (error) {
          const kind =
            error instanceof Error && /closed/iu.test(error.message)
              ? "context closed"
              : "body unavailable";
          exposure.push(
            `completed response ${kind}: ${request.method()} ${new URL(response.url()).pathname} ${response.status()}`,
          );
          return;
        }
        if (mime.includes("text/html")) inspectedDocuments += 1;
        inspect(body);
      })().catch(() => {
        exposure.push("completed browser response inspection failed");
      }),
    );
  };
  const consoleMessage = (message: { text(): string }) =>
    inspect(message.text());
  const pageError = (error: Error) => inspect(error.message);
  page.on("requestfinished", completedRequest);
  page.on("console", consoleMessage);
  page.on("pageerror", pageError);
  stopInspection = () => {
    page.off("requestfinished", completedRequest);
    page.off("console", consoleMessage);
    page.off("pageerror", pageError);
  };
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname))
      return route.abort("blockedbyclient");
    if (
      !["GET", "POST"].includes(request.method()) ||
      !["document", "fetch", "xhr"].includes(request.resourceType())
    )
      return route.continue();
    // Chromium can discard action and prefetch bodies during navigation. Read
    // the one real server response before forwarding identical bytes/headers;
    // never repeat a mutation or manufacture a role/authorization response.
    const inspection = (async () => {
      const response = await route.fetch({
        maxRedirects: 0,
        maxRetries: 0,
        timeout: 10_000,
      });
      const mime = response.headers()["content-type"] ?? "";
      if (
        /text\/html|text\/x-component|application\/json/iu.test(mime) &&
        (response.status() < 300 || response.status() >= 400)
      ) {
        inspect(await response.text());
        if (mime.includes("text/html")) inspectedDocuments += 1;
      }
      capturedRequests.add(request);
      try {
        await route.fulfill({ response });
      } catch (error) {
        // A speculative request may be cancelled after its complete payload
        // was inspected. Any other forwarding/read failure still rejects.
        if (
          request.headers()["next-router-prefetch"] !== "1" ||
          request.failure()?.errorText !== "net::ERR_ABORTED"
        )
          throw error;
      } finally {
        await response.dispose();
      }
    })().catch(async () => {
      exposure.push("application response could not be inspected or forwarded");
      await route.abort("failed").catch(() => undefined);
    });
    inspections.push(inspection);
    await inspection;
  });
});

test.afterEach(async ({ page }) => {
  test.setTimeout(15_000);
  // Read completed responses while their browser context is still available.
  // Unfinished speculative streams never enter this requestfinished queue.
  stopInspection();
  await Promise.all(inspections);
  inspect(await page.content());
  expect(exposure).toEqual([]);
  expect(inspectedDocuments).toBeGreaterThan(0);
});

test("anonymous: protected routes and upload mutation remain unavailable", async ({
  page,
}) => {
  for (const tool of ["chat", "sources", "evidence", "report"]) {
    await page.goto(`/learn/${cohort}/${unit}/${tool}?lang=en`);
    await expect(page).toHaveURL(/\/login\?/u);
  }
  await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toHaveCount(0);
  const upload = await page.request.post(
    `/api/batch-leader/campaigns/${campaign}/uploads`,
  );
  expect(upload.status()).toBe(403);
  expect(await upload.json()).toEqual({ error: "UPLOAD_REJECTED" });
  await page.goto("/admin?lang=en");
  await expect(page).toHaveURL(/\/login\?/u);
});

for (const role of roles) {
  test(`${role}: signed-in allowed and forbidden direct routes`, async ({
    page,
  }) => {
    await login(page, role);
    await page.goto(workspace);
    if (role === "student") {
      await expect(
        page.getByRole("heading", { level: 2, name: "Chat" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("heading", { name: "Workspace unavailable" }),
      ).toBeVisible();
    }
    await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
    if (role === "leader") {
      await expect(
        page.getByRole("heading", { name: "Synthetic collection campaign" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("heading", { name: "Synthetic collection campaign" }),
      ).toHaveCount(0);
      const upload = await page.request.post(
        `/api/batch-leader/campaigns/${campaign}/uploads`,
      );
      expect(upload.status()).toBe(403);
      expect(await upload.json()).toEqual({ error: "UPLOAD_REJECTED" });
    }
    await page.goto("/admin?lang=en");
    if (role === "admin") {
      await expect(
        page.getByRole("heading", { name: "Admin access required" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("heading", {
          name: "Decision queue",
          exact: true,
        }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("heading", { name: "Admin access required" }),
      ).toBeVisible();
    }
    if (role === "student") {
      await page.goto("/settings?lang=en");
      await page.getByRole("button", { name: "Sign out", exact: true }).click();
      await expect(page).toHaveURL(/\/login\?/u);
      await page.goto(workspace);
      await expect(page).toHaveURL(/\/login\?/u);
    }
  });
}

for (const transition of ["lock", "deactivate", "revoke"] as const) {
  test(`${transition}: an active browser session cannot create another chat`, async ({
    page,
  }) => {
    await login(page, "student");
    await page.goto(workspace);
    await openChatSessions(page, "en");
    await page.getByRole("button", { name: "New session" }).click();
    await expect(page).toHaveURL(/session=[0-9a-f-]+/u);
    const caller = users.get("student")!.id;
    const count = sql(
      `select count(*) from public.chat_sessions where user_id = '${caller}';`,
    );
    const auditBefore = Number(
      sql("select count(*) from unimind_private.audit_events;"),
    );
    const auditCutoff = sql(
      "select extract(epoch from transaction_timestamp());",
    );
    if (!/^\d+(?:\.\d+)?$/u.test(auditCutoff))
      throw new Error("Invalid synthetic audit cutoff.");
    const preservedAudit = () =>
      sql(`select md5(coalesce(string_agg(to_jsonb(event)::text, '' order by id), ''))
      from unimind_private.audit_events event where created_at <= to_timestamp(${auditCutoff});`);
    const auditHashBefore = preservedAudit();
    if (transition === "lock")
      sql(
        `update public.cohort_releases set release_status = 'LOCKED', reason = 'Synthetic session containment' where cohort_id = '${cohort}';`,
      );
    if (transition === "deactivate")
      sql(
        "update public.source_versions set activation_status = 'DEACTIVATED' where id = '41000000-0000-4000-8000-000000000001';",
      );
    if (transition === "revoke")
      sql(
        `update public.cohort_memberships set status = 'REVOKED' where user_id = '${caller}';`,
      );
    // Submit the already rendered form with the same still-valid Auth session.
    await openChatSessions(page, "en");
    await page.getByRole("button", { name: "New session" }).click();
    await expect(
      page.getByRole("heading", { name: "Workspace unavailable" }),
    ).toBeVisible();
    expect(
      sql(
        `select count(*) from public.chat_sessions where user_id = '${caller}';`,
      ),
    ).toBe(count);
    const auditAfter = Number(
      sql("select count(*) from unimind_private.audit_events;"),
    );
    expect(preservedAudit()).toBe(auditHashBefore);
    expect(auditAfter).toBeGreaterThanOrEqual(auditBefore);
    // Only release/source fixture updates have governance audit triggers.
    if (transition !== "revoke")
      expect(auditAfter).toBeGreaterThan(auditBefore);
    expect(
      sql(
        "select count(*) from unimind_private.processed_documents where source_version_id = '41000000-0000-4000-8000-000000000001';",
      ),
    ).toBe("1");
  });
}

// WP03-T27: one account gate for every page, including Batch Leader intake.
test("leader: suspension and a missing profile close intake and uploads", async ({
  page,
}) => {
  const leader = users.get("leader")!.id;
  await login(page, "leader");
  await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toBeVisible();
  try {
    sql(
      `update public.profiles set account_status = 'SUSPENDED' where user_id = '${leader}';`,
    );
    await page.reload();
    await expect(page).toHaveURL(/\/login\?(?:.*&)?status=suspended/u);
    const suspended = await page.request.post(
      `/api/batch-leader/campaigns/${campaign}/uploads`,
    );
    expect(suspended.status()).toBe(403);
    sql(
      `update public.profiles set account_status = 'ACTIVE', display_name = '' where user_id = '${leader}';`,
    );
    await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
    await expect(page).toHaveURL(/\/welcome\?/u);
    const nameless = await page.request.post(
      `/api/batch-leader/campaigns/${campaign}/uploads`,
    );
    expect(nameless.status()).toBe(403);
    expect(await nameless.json()).toEqual({ error: "UPLOAD_REJECTED" });
  } finally {
    sql(
      `update public.profiles set account_status = 'ACTIVE', display_name = 'Synthetic leader' where user_id = '${leader}';`,
    );
  }
});

test("student: a real account without a name completes the profile step once", async ({
  page,
  browser,
}) => {
  const student = users.get("student")!;
  sql(
    `update public.profiles set display_name = '' where user_id = '${student.id}';`,
  );
  try {
    await page.goto(`/login?lang=en&next=${encodeURIComponent(workspace)}`);
    await page.getByLabel("Email address", { exact: true }).fill(student.email);
    await page.getByLabel("Password", { exact: true }).fill(student.password);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(/\/welcome\?/u);
    await expect(
      page.getByRole("heading", { name: "Set up your profile", level: 1 }),
    ).toBeVisible();
    // A forged return path never leaves the product.
    await page.goto("/welcome?lang=en&next=%2F%2Fattacker.invalid%2Flearn");
    await page.getByLabel("Full name", { exact: true }).fill("Rana Fathy");
    await page
      .getByRole("button", { name: "Save and continue", exact: true })
      .click();
    await expect(page).toHaveURL(/\/learn(?:\?|$)/u);
    // The forged return never leaves the app's own origin.
    expect(new URL(page.url()).origin).toBe(
      new URL(test.info().project.use.baseURL!).origin,
    );
    expect(
      sql(
        `select display_name || '|' || preferred_language from public.profiles where user_id = '${student.id}';`,
      ),
    ).toBe("Rana Fathy|EN");
    // A second browser signs in straight to the role home.
    const second = await browser.newContext();
    try {
      const other = await second.newPage();
      await other.goto("/login?lang=en");
      await other
        .getByLabel("Email address", { exact: true })
        .fill(student.email);
      await other
        .getByLabel("Password", { exact: true })
        .fill(student.password);
      await other
        .getByRole("button", { name: "Continue", exact: true })
        .click();
      await expect(other).toHaveURL(/\/learn(?:\?|$)/u);
      await other.goto("/welcome?lang=en");
      await expect(other).toHaveURL(/\/learn(?:\?|$)/u);
    } finally {
      await second.close();
    }
  } finally {
    sql(
      `update public.profiles set display_name = 'Synthetic student' where user_id = '${student.id}';`,
    );
  }
});

// WP03-T28: a device that never chose a language signs in in the account's
// language and keeps it after sign-out and in a later session.
test("student: a new device signs in in the account language and remembers it", async ({
  browser,
}) => {
  const student = users.get("student")!;
  sql(
    `update public.profiles set preferred_language = 'AR' where user_id = '${student.id}';`,
  );
  const device = await browser.newContext();
  try {
    const page = await device.newPage();
    // The landing page links to sign-in in the default language.
    await page.goto("/login?lang=en");
    expect(
      (await device.cookies()).some((entry) => entry.name === "unimind-locale"),
    ).toBe(false);
    await page.getByLabel("Email address", { exact: true }).fill(student.email);
    await page.getByLabel("Password", { exact: true }).fill(student.password);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(/\/learn\?(?:.*&)?lang=ar(?:&|$)/u);
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings\?lang=ar$/u);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page
      .getByRole("button", { name: "تسجيل الخروج", exact: true })
      .click();
    await expect(page).toHaveURL(/\/login\?lang=ar&status=signed_out$/u);
    // A later session on the same device opens in Arabic before sign-in.
    await page.goto("/learn");
    await expect(page).toHaveURL(/\/login\?.*lang=ar/u);
  } finally {
    await device.close();
    sql(
      `update public.profiles set preferred_language = 'EN' where user_id = '${student.id}';`,
    );
  }
});

test("revoked leader loses campaign access in the same browser", async ({
  page,
}) => {
  await login(page, "leader");
  await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toBeVisible();
  sql(
    `update public.batch_leader_assignments set status = 'REVOKED', revoked_at = now(), reason = 'Synthetic active-session revocation' where user_id = '${users.get("leader")!.id}';`,
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toHaveCount(0);
  const upload = await page.request.post(
    `/api/batch-leader/campaigns/${campaign}/uploads`,
  );
  expect(upload.status()).toBe(403);
  expect(await upload.json()).toEqual({ error: "UPLOAD_REJECTED" });
});

// WP03-T17: the real half of the shared student-screen assertions. The
// synthetic half runs the same checks in tests/e2e/demo/chat-shared-screens.spec.ts.
test("student: shared study, settings and catalog screens against the real backend", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await login(page, "student");
  await page.goto(
    `/learn?lang=en&level=forged-level&cohort=forged-cohort&unit=forged-unit`,
  );
  await expect(page).toHaveURL(/\/learn\?/u);
  await expect(page).not.toHaveURL(/forged/u);
  // The catalog canonicalises on the client; let that navigation settle so
  // the next page.goto is not aborted by it.
  await page.waitForLoadState("networkidle");

  const base = `/learn/${cohort}/${unit}`;
  await page.goto(`${base}?lang=en`);
  await expectStudyFrame(page, "en", "Synthetic Unit A");
  await expectMaterialsScreen(page, "en", "real");
  await expect(
    page.getByText(/\d+ approved materials in this /u),
  ).toBeVisible();
  await expectAccessibleWorkspacePage(page, "en", "overview");
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Chat", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`${base}/chat\\?lang=en`, "u"));
  await expectChatScreen(page, "en", "real");
  await expectAccessibleWorkspacePage(page, "en", "chat");

  await openChatSessions(page, "en");
  await page.getByRole("button", { name: "New session" }).click();
  await expect(page).toHaveURL(/session=[0-9a-f-]+/u);
  const firstSession = new URL(page.url()).searchParams.get("session");
  expect(firstSession).not.toBeNull();
  await page.reload();
  await openChatSessions(page, "en");
  // Earlier tests may already have sessions for this student, so read the
  // selected session's number instead of assuming "Session 1".
  const selected = page
    .getByRole("button", { pressed: true })
    .filter({ hasText: /Session \d+/u });
  await expect(selected).toHaveCount(1);
  const firstNumber = /Session (\d+)/u.exec(
    (await selected.textContent()) ?? "",
  )?.[1];
  expect(firstNumber).toBeDefined();
  await page.getByRole("button", { name: "New session" }).click();
  await page.waitForURL(
    (url) => url.searchParams.get("session") !== firstSession,
  );
  await openChatSessions(page, "en");
  await page
    .getByRole("button", {
      name: new RegExp(`Session ${firstNumber}(?!\\d)`, "u"),
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`session=${firstSession}`, "u"));

  await page.goto(`${base}/studio?lang=en`);
  await expectStudioScreen(page, "en", "real");
  await page.goto(`${base}/quiz?lang=en`);
  await expectQuizSetupScreen(page, "en", "real");
  await page.goto(`${base}/sources?lang=en`);
  await expect(
    page.getByText(/The material list is not available yet\. \d+ approved/u),
  ).toBeVisible();
  await page.goto(`${base}/evidence?lang=en`);
  await expect(
    page.getByText("Chat answers are not available yet.", { exact: false }),
  ).toBeVisible();
  await page.goto(`${base}/report?lang=en`);
  await expect(
    page.getByText("Chat answers are not available yet.", { exact: false }),
  ).toBeVisible();
  await page.goto("/settings?lang=en");
  await expectStudentSettingsScreen(page, "en", "real");

  for (const tool of ["", "/chat", "/sources", "/evidence", "/report"]) {
    await page.goto(
      `/learn/${cohort}/20000000-0000-4000-8000-000000000099${tool}?lang=en`,
    );
    await expect(
      page.getByRole("heading", { name: "Workspace unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText("Synthetic Unit A", { exact: true }),
    ).toHaveCount(0);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}?lang=ar`);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expectStudyFrame(page, "ar", "وحدة تجريبية أ");
  await expectMaterialsScreen(page, "ar", "real");
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  await expectAccessibleWorkspacePage(page, "ar", "overview");
  await page.goto(`${base}/chat?lang=ar`);
  await expectChatScreen(page, "ar", "real");
  await expectAccessibleWorkspacePage(page, "ar", "chat");
  await page.goto(`${base}/studio?lang=ar`);
  await expectStudioScreen(page, "ar", "real");
  await page.goto(`${base}/quiz?lang=ar`);
  await expectQuizSetupScreen(page, "ar", "real");
  await page.goto("/settings?lang=ar");
  await expectStudentSettingsScreen(page, "ar", "real");
});

test("leader: real intake validates files in the browser, records a receipt and closes forged campaigns", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await login(page, "leader");
  await page.goto(`/batch-leader/campaigns/${campaign}?lang=en`);
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#app-content")).toBeFocused();
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  const rows = page
    .getByRole("list", { name: "Upload queue" })
    .getByRole("listitem");
  await page.locator('input[type="file"]').setInputFiles([
    {
      name: "too-big.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    },
    {
      name: "wrong.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not PDF bytes"),
    },
  ]);
  await expect(
    rows.getByText("This file exceeds the 10 MB limit.", { exact: false }),
  ).toBeVisible();
  await expect(rows.getByText(/not a supported/u)).toBeVisible();
  await page
    .getByRole("button", { name: "Remove file: too-big.pdf", exact: true })
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-gate.pdf",
    mimeType: "text/plain",
    buffer: Buffer.from("%PDF-1.7\nSynthetic UniMind fixture only\n"),
  });
  await expect(
    rows.getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Professor or source description")
    .fill("Generated fixture for the real collection gate.");
  await page.getByLabel("I have permission").check();
  await page.getByRole("button", { name: "Submit files", exact: true }).click();
  await expect(
    page.locator('[data-record-request] [data-status="RECEIVED"]'),
  ).toBeVisible();

  await page.goto(
    "/batch-leader/campaigns/30000000-0000-4000-8000-000000000099?lang=ar",
  );
  await expect(
    page.getByRole("heading", { name: "الحملة غير متاحة" }),
  ).toBeVisible();
  await expect(page.locator('[data-role="leader"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
  await expect(
    page.getByRole("heading", { name: "Synthetic collection campaign" }),
  ).toHaveCount(0);
});
