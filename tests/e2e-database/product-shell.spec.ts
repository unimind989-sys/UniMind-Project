import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Page,
  type Request as BrowserRequest,
} from "@playwright/test";
import { assertGitHubHostedLinuxRunner } from "../../scripts/lib/ephemeral-supabase";

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
  const landingResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      new URL(response.url()).pathname === "/learn" &&
      response.status() === 200,
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const response = await actionResponse;
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["pragma"]).toBe("no-cache");
  expect(response.headers()["expires"]).toBe("0");
  await expect(page).toHaveURL(/\/learn(?:\?|$)/u);
  // A Server Action can update the URL before its redirected RSC body ends.
  // Finish and inspect that payload before a direct-route probe replaces it.
  const landing = await landingResponse;
  expect(await landing.finished()).toBeNull();
  inspect(await landing.text());
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
    sql(`update public.profiles set account_status = 'ACTIVE' where user_id = '${id}';
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
    values ('${users.get("admin")!.id}', 'ADMIN', '10000000-0000-4000-8000-000000000001', 'Synthetic product-shell gate administrator');
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
  const completedRequest = (request: BrowserRequest) => {
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
    if (
      ["127.0.0.1", "localhost"].includes(
        new URL(route.request().url()).hostname,
      )
    )
      return route.continue();
    await route.abort("blockedbyclient");
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
  await page.goto(workspace);
  await expect(page).toHaveURL(/\/login\?/u);
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
        page.getByRole("button", { name: "Start a scoped session" }),
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
          name: "Admin decision queue",
          exact: true,
        }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("heading", { name: "Admin access required" }),
      ).toBeVisible();
    }
    if (role === "student") {
      await page.goto("/learn?lang=en");
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
    await page.getByRole("button", { name: "Start a scoped session" }).click();
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
    await page.getByRole("button", { name: "Start a scoped session" }).click();
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
