import { expect, test } from "@playwright/test";

test("AI consultant fits the viewport and opens without runtime errors", async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Открыть AI-консультант" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const panel = page.getByRole("dialog", { name: "AI-консультант СтеклоСтройГрупп" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Разберём задачу до разговора с инженером")).toBeVisible();
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

  await page.screenshot({ path: testInfo.outputPath("ai-chat.png"), fullPage: false });
  await page.getByRole("button", { name: "Закрыть чат" }).click();
  await expect(panel).toBeHidden();
  expect(runtimeErrors).toEqual([]);
});

test("quote wizard tabs are directly navigable and preserve the project", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/raschet/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /02 Размеры/ }).click();
  const size = page.getByPlaceholder(/фасад 12 × 6 м/);
  await size.fill("Фасад 8 × 3 м");
  await page.getByRole("button", { name: /04 Контакты/ }).click();
  await expect(page.getByText(/Фасад 8 × 3 м/)).toBeVisible();
  await expect(page.getByRole("checkbox")).toBeVisible();
  await page.getByRole("button", { name: /02 Размеры/ }).click();
  await expect(size).toHaveValue("Фасад 8 × 3 м");
  expect(runtimeErrors).toEqual([]);
});
