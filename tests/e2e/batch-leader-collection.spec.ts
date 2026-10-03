import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const campaign = "11111111-1111-4111-8111-111111111111";
const base = `/preview/batch-leader/campaigns/${campaign}`;
const proof = expect.configure({ timeout: 20_000 });
const pdf = {
  name: "synthetic-anatomy.pdf",
  mimeType: "text/plain",
  buffer: Buffer.from("%PDF-1.7\nSynthetic UniMind fixture only\n"),
};
const audio = {
  name: "synthetic-recording.wav",
  mimeType: "audio/wav",
  buffer: readFileSync("public/demo-files/synthetic-recording.wav"),
};
const image = {
  name: "synthetic-diagram.png",
  mimeType: "image/png",
  buffer: readFileSync("public/demo-files/synthetic-diagram.png"),
};
const rows = (page: Page) =>
  page.getByRole("list", { name: "Upload queue" }).getByRole("listitem");
async function prepare(page: Page) {
  await page
    .getByLabel("Professor or source description")
    .fill("Generated fixture for the bounded WP03 collection flow.");
  await page.getByLabel("I have permission").check();
}
const key = (body: string | null) =>
  body?.match(/name="clientIdempotencyKey"\r\n\r\n([^\r]+)/u)?.[1];
test.describe.configure({ timeout: 60_000 });
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) =>
    ["127.0.0.1", "localhost"].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort("blockedbyclient"),
  );
});

test("mixed files infer requests, register separately and finish before processing", async ({
  page,
}) => {
  const uploads: {
    key: string | undefined;
    type: string;
    bytes: number;
    privateFields: boolean;
  }[] = [];
  page.on("response", async (response) => {
    if (
      response.url().includes("/api/preview/batch-leader/") &&
      response.ok()
    ) {
      const value = (await response.json()) as Record<string, unknown>;
      uploads.push({
        key: key(response.request().postData()),
        type: String(value.mimeType),
        bytes: Number(value.byteSize),
        privateFields: "objectKey" in value || "provider" in value,
      });
    }
  });
  await page.goto(`${base}?lang=en`);
  await proof(
    page.getByRole("heading", { name: "Synthetic Anatomy source call" }),
  ).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles([pdf, audio, image]);
  await proof(
    rows(page)
      .last()
      .getByRole("combobox", { name: "Requested item", exact: true }),
  ).toBeVisible();
  await rows(page)
    .last()
    .getByRole("combobox", { name: "Requested item", exact: true })
    .selectOption("22222222-2222-4222-8222-222222222223");
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toHaveCount(3);
  await proof(page.getByLabel("Requested item", { exact: true })).toHaveCount(
    0,
  );
  await rows(page).first().getByText("Source details", { exact: true }).click();
  await rows(page)
    .first()
    .getByLabel("Source title")
    .fill("Synthetic Week 3 handout");
  await prepare(page);
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toHaveCount(3);
  expect(uploads.map((upload) => upload.type)).toEqual([
    "application/pdf",
    "audio/wav",
    "image/png",
  ]);
  expect(new Set(uploads.map((upload) => upload.key)).size).toBe(3);
  expect(
    uploads.every(
      (upload) => upload.key && upload.bytes > 0 && !upload.privateFields,
    ),
  ).toBe(true);
  await proof(
    page.getByText(
      "Received safely. Processing will continue separately; you can upload the next file.",
    ),
  ).toHaveCount(3);
});

test("interrupted retry preserves the same per-file key", async ({ page }) => {
  const keys: (string | undefined)[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/uploads")) keys.push(key(request.postData()));
  });
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles(pdf);
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
  await prepare(page);
  await page.route(
    "**/api/preview/batch-leader/**/uploads",
    (route) => route.abort("internetdisconnected"),
    { times: 1 },
  );
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(rows(page).getByText(/interrupted/u)).toBeVisible();
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
});

test("cancel stops the active batch, retains the next file, and retries safely", async ({
  page,
}) => {
  const keys: (string | undefined)[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/uploads")) keys.push(key(request.postData()));
  });
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles([pdf, audio]);
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toHaveCount(2);
  await prepare(page);
  await page.route(
    "**/api/preview/batch-leader/**/uploads",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue().catch(() => undefined);
    },
    { times: 1 },
  );
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(
    page.getByRole("button", { name: "Cancel upload", exact: true }),
  ).toBeVisible();
  await proof(page.locator('input[type="file"]')).toBeDisabled();
  await page
    .getByRole("button", { name: "Cancel upload", exact: true })
    .click();
  await proof(
    rows(page)
      .first()
      .getByText(/interrupted/u),
  ).toBeVisible();
  await proof(
    rows(page).nth(1).getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toHaveCount(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
  expect(keys[2]).not.toBe(keys[0]);
});

test("a failed submission retries its retained receipt without uploading twice", async ({
  page,
}) => {
  let uploads = 0;
  let interrupted = false;
  page.on("request", (request) => {
    if (
      request.url().includes("/api/preview/batch-leader/") &&
      request.method() === "POST"
    )
      uploads++;
  });
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles(pdf);
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
  await prepare(page);
  await page.route(
    `**/preview/batch-leader/campaigns/${campaign}*`,
    async (route) => {
      if (route.request().headers()["next-action"] && !interrupted) {
        interrupted = true;
        await route.abort("internetdisconnected");
      } else await route.continue();
    },
  );
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(
    page.getByRole("button", { name: "Retry submission", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Retry submission", exact: true })
    .click();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toBeVisible();
  expect(uploads).toBe(1);
});

test("invalid bytes do not block valid files and new files need a fresh rights declaration", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles([
    pdf,
    {
      name: "wrong.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not PDF bytes"),
    },
  ]);
  await proof(rows(page).getByText(/not a supported/u)).toBeVisible();
  await prepare(page);
  await proof(
    page.getByRole("button", { name: "Upload files", exact: true }),
  ).toBeEnabled();
  await page
    .locator('input[type="file"]')
    .setInputFiles("public/demo-files/synthetic-recording.wav");
  await proof(page.getByLabel("I have permission")).not.toBeChecked();
  await proof(
    page.getByRole("button", { name: "Upload files", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("I have permission").check();
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await proof(
    rows(page).getByText("Submission received", { exact: true }),
  ).toHaveCount(2);
  await proof(rows(page).getByText(/not a supported/u)).toBeVisible();
});

test("keyboard skip, picker and source details remain reachable", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.keyboard.press("Tab");
  await proof(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await proof(page.locator("#app-content")).toBeFocused();
  const choose = page
    .getByRole("button", {
      name: "Choose files",
      exact: true,
    })
    .and(page.locator("button"));
  for (
    let index = 0;
    index < 20 &&
    !(await choose.evaluate((element) => element === document.activeElement));
    index++
  )
    await page.keyboard.press("Tab");
  await proof(choose).toBeFocused();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await chooser).setFiles(pdf);
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
});

for (const locale of ["en", "ar"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`mobile ${locale} ${theme} queue meets AA and reflows at 360px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 844 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto(`${base}?lang=${locale}`);
      await page.locator('input[type="file"]').setInputFiles(pdf);
      await proof(
        page.getByText(locale === "ar" ? "جاهز للرفع" : "Ready to upload", {
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
      const small = await page
        .locator("main button,main a,main select,main summary")
        .evaluateAll((elements) =>
          elements
            .filter((element) => element.getClientRects().length)
            .filter((element) => element.getBoundingClientRect().height < 44)
            .map((element) => element.textContent),
        );
      expect(small).toEqual([]);
    });

test("wrong and expired campaigns keep the same non-identifying boundary", async ({
  page,
}) => {
  for (const href of [
    "/preview/batch-leader/campaigns/forged?lang=en",
    `${base}?lang=en&state=expired`,
  ]) {
    await page.goto(href);
    await proof(
      page.getByRole("heading", { name: "Campaign unavailable" }),
    ).toBeVisible();
    await proof(page.getByText("Synthetic Anatomy source call")).toHaveCount(0);
  }
  await page.goto("/preview/batch-leader/campaigns/forged?lang=ar");
  await proof(
    page.getByRole("heading", { name: "الحملة غير متاحة" }),
  ).toBeVisible();
  await proof(page.locator('[data-role="leader"]')).toHaveAttribute(
    "dir",
    "rtl",
  );
});

test("mixed drop retains every file and rejects oversized content before uploading", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "too-big.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await proof(
    rows(page).getByText("This file exceeds the 10 MB limit.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove file: too-big.pdf", exact: true })
    .click();
  await page
    .getByText("Drop files here, or choose them from your device.", {
      exact: true,
    })
    .evaluate(
      (element, files) => {
        const transfer = new DataTransfer();
        for (const file of files)
          transfer.items.add(
            new File(
              [Uint8Array.from(atob(file.bytes), (c) => c.charCodeAt(0))],
              file.name,
              { type: file.type },
            ),
          );
        element.parentElement!.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
      },
      [
        {
          name: pdf.name,
          type: pdf.mimeType,
          bytes: pdf.buffer.toString("base64"),
        },
        {
          name: audio.name,
          type: audio.mimeType,
          bytes: audio.buffer.toString("base64"),
        },
      ],
    );
  await proof(rows(page)).toHaveCount(2);
  await proof(
    rows(page).getByText("Ready to upload", { exact: true }),
  ).toHaveCount(2);
});
