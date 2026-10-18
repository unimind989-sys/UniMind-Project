import { ensureB09Intake } from "../support/collection-b09";
import { pick } from "../support/copy";
import { campaign } from "../support/demo";
import { boxOf, expectReflow, withEnlargedText } from "../support/layout";
import {
  type ScreenGroup,
  type ScreenState,
  matrixTests,
  productNavigation,
  expectLanguageControl,
  expectSignOutTarget,
} from "../support/layout-matrix";
import { routeSweepTests } from "../support/route-sweep";
import { navigate, signIn } from "../support/session";
import { expect, test, type Page } from "../support/test";

// Layout matrix for the Batch Leader shell and every leader route (harness in
// `support/layout-matrix.ts` and `support/route-sweep.ts`).

// ------------------------------------------------------------ Batch Leader
/** The current navigation item keeps at least 4.5:1 contrast while settling. */
async function expectCurrentNavigationContrast(page: Page) {
  const contrast = await page
    .locator('nav a[aria-current="page"]')
    .first()
    .evaluate(async (link) => {
      const luminance = (color: string) => {
        const channels = color.match(/[0-9.]+/gu)?.map(Number);
        if (
          !channels ||
          channels.length < 3 ||
          (channels.length === 4 && channels[3] !== 1)
        )
          throw new Error("Navigation must use an opaque readable palette.");
        const linear = channels.slice(0, 3).map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
      };
      const samples: number[] = [];
      for (let frame = 0; frame < 12; frame += 1) {
        const style = getComputedStyle(link);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        samples.push(
          (Math.max(foreground, background) + 0.05) /
            (Math.min(foreground, background) + 0.05),
        );
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      }
      return Math.min(...samples);
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
}

/** No visible main control of the page is shorter than 44px. */
async function expectMainTargets(page: Page) {
  expect(
    await page
      .locator("main button,main a,main summary,main select")
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length)
          .filter((element) => element.getBoundingClientRect().height < 44)
          .map((element) => element.textContent),
      ),
  ).toEqual([]);
}

const leaderWidths = [1440, 768, 430, 390, 360, 320] as const;

const leaderStates: readonly ScreenState[] = [
  {
    name: "campaign intake with device and reference rows keeps 44px controls",
    enter: async (page, locale) => {
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-recording.wav");
      await expect(
        page
          .getByRole("list", {
            name: pick(locale, "Upload queue", "قائمة الرفع"),
            exact: true,
          })
          .getByRole("listitem"),
      ).toHaveCount(2);
    },
    widths: leaderWidths,
    height: 844,
    strictReflow: true,
    phoneAxe: true,
    axe: [{}, { include: "main" }],
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Upload files", "رفع الملفات"),
          exact: true,
        }),
      ).toBeVisible();
      const nav = productNavigation(page, locale);
      await expect(nav.getByRole("link")).toHaveCount(3);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      await expectMainTargets(page);
    },
  },
  {
    name: "assignment dates stay readable when expanded",
    enter: async (page, locale) => {
      await page
        .locator("details")
        .filter({
          has: page.getByText(
            pick(
              locale,
              "Assignment and campaign dates",
              "مواعيد التكليف والحملة",
            ),
            { exact: true },
          ),
        })
        .locator("summary")
        .press("Enter");
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.locator("details").filter({
          has: page.getByText(
            pick(
              locale,
              "Assignment and campaign dates",
              "مواعيد التكليف والحملة",
            ),
            { exact: true },
          ),
        }),
      ).toHaveAttribute("open");
    },
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "History keeps its latest submissions readable",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "History", "السجل"),
          exact: true,
        })
        .click();
    },
    widths: leaderWidths,
    height: 844,
    strictReflow: true,
    axe: [{}, { include: "main", tags: "all" }],
  },
  {
    name: "the leader home keeps 44px destinations and language controls",
    enter: (page, locale) => navigate(page, "/batch-leader", locale),
    widths: [1440, 768, 390, 320],
    check: async ({ page, locale, width }) => {
      const nav = productNavigation(page, locale);
      await expect(nav.getByRole("link")).toHaveCount(3);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      await expectLanguageControl(page, locale);
      if (width === 1440)
        await expect(
          page.locator("header[data-workspace-chrome]"),
        ).not.toContainText("Study deeper");
    },
  },
  {
    name: "leader Account keeps existing controls readable",
    enter: (page, locale) => navigate(page, "/settings", locale),
    widths: [1440, 768, 390, 360, 320],
    height: 844,
    strictReflow: true,
    phoneAxe: true,
    check: async ({ page, locale }) => expectSignOutTarget(page, locale),
    checkEnlarged: true,
  },
  {
    name: "corrections keep every request action visible",
    enter: (page, locale) =>
      signIn(page, "leader", locale, `${campaign}?fixture=corrections`),
    height: 844,
    check: async ({ page }) => {
      const requests = page.locator("[data-request-id]");
      await expect(requests).toHaveCount(3);
      for (const request of await requests.all())
        await expect(request.locator("a,button")).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "a permanent upload failure keeps its remedy readable",
    enter: async (page, locale) => {
      await signIn(page, "leader", locale, `${campaign}?fixture=checksum`);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page
        .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
        .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("list", {
          name: pick(locale, "Upload queue", "قائمة الرفع"),
          exact: true,
        }),
      ).toContainText(pick(locale, "integrity check", "فحص السلامة"));
    },
    axe: [{ include: "main" }],
  },
  {
    name: "three received files keep readable statuses at enlarged text",
    enter: async (page, locale) => {
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles([
          "public/demo-files/synthetic-handout.pdf",
          "public/demo-files/synthetic-recording.wav",
          "public/demo-files/synthetic-diagram.png",
        ]);
      await page
        .getByLabel(
          pick(
            locale,
            "Professor or source description",
            "وصف الأستاذ أو المصدر",
          ),
        )
        .fill("Synthetic retained context for all three supplied files.");
      await page
        .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
        .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(3);
    },
    widths: [1440, 768, 390, 320],
    check: async ({ page, locale }) => {
      await withEnlargedText(page, async () => {
        await expectReflow(page);
        for (const request of await page
          .locator('[data-record-request^="sample-item-"]')
          .all())
          await expect(request.locator("summary [data-status]")).toHaveText(
            pick(locale, "Received", "تم الاستلام"),
          );
      });
    },
    axe: [{ include: "main" }],
  },
  {
    name: "three assigned campaigns keep unclipped titles",
    enter: (page, locale) =>
      signIn(page, "leader", locale, "/batch-leader?fixture=dense"),
    height: 1000,
    check: async ({ page, locale }) => {
      const titles = page
        .getByRole("region", {
          name: pick(locale, "Assigned campaigns", "الحملات المسندة"),
          exact: true,
        })
        .getByRole("heading", { level: 3 });
      await expect(titles).toHaveCount(3);
      expect(
        await titles.evaluateAll((elements) =>
          elements.every(
            (element) =>
              element.scrollWidth <= element.clientWidth + 1 &&
              getComputedStyle(element).textOverflow !== "ellipsis",
          ),
        ),
      ).toBe(true);
    },
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "an invitation keeps a high-contrast current destination",
    enter: (page, locale) =>
      signIn(page, "leader", locale, "/batch-leader/invitation"),
    widths: [1440, 390, 360, 320],
    height: 844,
    strictReflow: true,
    check: async ({ page }) => expectCurrentNavigationContrast(page),
    axe: [{}, { include: "main", tags: "all" }],
  },
  ...[
    "/batch-leader/invitation?fixture=expired",
    `${campaign}?fixture=expired`,
    "/batch-leader/invitation?fixture=replayed",
  ].map((path): ScreenState => ({
    name: `a denied fixture (${path}) offers a readable safe exit`,
    enter: (page, locale) => signIn(page, "leader", locale, path),
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  })),
];

const groups: readonly ScreenGroup[] = [
  {
    title: "Batch Leader intake, History, Account and fixtures",
    tags: ["@B04", "@B07-C", "@B09", "@B01", "@M53", "@demo-core"],
    role: "leader",
    path: campaign,
    states: leaderStates,
  },
];

for (const { title, details, body } of [
  ...matrixTests(groups),
  ...routeSweepTests("leader"),
])
  test(title, details, body);
