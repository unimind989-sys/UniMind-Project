import { pick } from "../support/copy";
import { adminNavigate } from "../support/demo";
import { boxOf } from "../support/layout";
import {
  type ScreenGroup,
  type ScreenState,
  matrixTests,
  productNavigation,
  expectLanguageControl,
  expectShellControls,
  expectSignOutTarget,
} from "../support/layout-matrix";
import { routeSweepTests } from "../support/route-sweep";
import { navigate } from "../support/session";
import { expect, test } from "../support/test";

// Layout matrix for the Admin shell, admin Account and every admin route
// (harness in `support/layout-matrix.ts` and `support/route-sweep.ts`).

// ------------------------------------------------------------------- Admin
const adminRoutes = [
  "/admin",
  "/admin/sources",
  "/admin/campaigns",
  "/admin/catalog",
  "/admin/cohorts",
  "/admin/cohorts?view=users",
  "/admin/jobs",
  "/admin/quality",
  "/admin/usage",
  "/admin/incidents",
] as const;

const adminStates: readonly ScreenState[] = [
  ...adminRoutes.map((route): ScreenState => ({
    name: `${route} keeps resources and 44px admin controls`,
    enter: (page, locale) =>
      route === "/admin"
        ? Promise.resolve()
        : adminNavigate(page, route, locale),
    phoneAxe: route === "/admin",
    check: async ({ page, locale, width }) => {
      await expectShellControls(page, "admin");
      await expect(page.locator("main")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      if (route !== "/admin/sources") return;
      // B07-C: the same five destinations, behind a menu on phones.
      const phone = width < 768;
      const nav = phone
        ? page.getByRole("navigation", {
            name: pick(locale, "Admin navigation", "تنقل الإدارة"),
            exact: true,
          })
        : productNavigation(page, locale);
      const menu = page
        .locator("summary")
        .filter({ hasText: new RegExp(pick(locale, "^Menu$", "^القائمة$")) });
      if (phone) {
        await menu.click();
        // The open panel stays inside the viewport at 320 and 390px and with
        // 200% text, in both directions (it hangs from the bar's gutters).
        const panel = await boxOf(page.locator("[class*='adminMenuPanel']"));
        const viewport = page.viewportSize()!.width;
        expect(panel.x).toBeGreaterThanOrEqual(0);
        expect(panel.x + panel.width).toBeLessThanOrEqual(viewport);
      }
      await expect(nav.getByRole("link")).toHaveCount(5);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      if (phone) {
        await menu.press("Escape");
        await expect(menu).toBeFocused();
      }
      await expectLanguageControl(page, locale);
    },
    checkEnlarged: true,
  })),
  {
    name: "a raw-data hold form keeps its reason, expiry and attestation readable",
    enter: async (page, locale) => {
      await adminNavigate(page, "/admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(pick(locale, "^Place hold ", "^وضع حجز ")),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"))
        .fill(
          pick(locale, "Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
      await page
        .locator('input[name="holdExpiresAtLocal"]')
        .fill("2027-01-18T16:00");
      await page.locator('input[name="reviewAttested"]').check();
    },
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "the campaign invitation example stays readable before review",
    enter: async (page, locale) => {
      // Campaigns is a section resource of Content (Sources).
      await adminNavigate(page, "/admin/sources", locale);
      await adminNavigate(page, "/admin/campaigns", locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Create campaign", "إنشاء حملة"),
          exact: true,
        })
        .press("Enter");
      await page
        .getByLabel(
          pick(
            locale,
            "Review fixed expiring campaign-only invitation",
            "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
          ),
        )
        .press("Space");
    },
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "the student conflict preview keeps its two-source citation",
    enter: async (page, locale) => {
      // Quality is a section resource of Operations (Jobs).
      await adminNavigate(page, "/admin/jobs", locale);
      await adminNavigate(page, "/admin/quality", locale);
      await page
        .getByRole("link", {
          name: pick(
            locale,
            "Inspect student conflict example",
            "فحص مثال تعارض الطالب",
          ),
          exact: true,
        })
        .press("Enter");
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Two source excerpts", "نصان من مصدرين"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main", tags: "all" }],
  },
];

// ------------------------------------------------------------ role Account
const accountState: ScreenState = {
  name: "Account keeps a visible 44px sign-out",
  enter: (page, locale) => navigate(page, "/settings", locale),
  widths: [1440, 768, 390, 320],
  check: async ({ page, locale }) => expectSignOutTarget(page, locale),
  checkEnlarged: true,
};

const groups: readonly ScreenGroup[] = [
  {
    title: "Admin sections and governed previews",
    tags: ["@B05-A", "@B05-B", "@B07-C", "@B01", "@M51", "@M52", "@demo-core"],
    role: "admin",
    states: adminStates,
  },
  ...(["admin", "second-admin"] as const).map((role): ScreenGroup => ({
    title: `${role} Account`,
    tags: ["@B07-B"],
    role,
    states: [accountState],
  })),
];

for (const { title, details, body } of [
  ...matrixTests(groups),
  ...routeSweepTests("admin"),
])
  test(title, details, body);
