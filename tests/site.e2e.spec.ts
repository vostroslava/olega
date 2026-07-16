import { expect, test } from "@playwright/test";

test("consultation panel fits the viewport and gives a working next step", async ({ page }, testInfo) => {
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
  const aiConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_API_URL);
  await expect(panel.getByRole("heading", { name: aiConfigured ? "Разберём задачу до разговора с инженером" : "Передадим задачу инженеру" })).toBeVisible();
  if (aiConfigured) {
    await expect(panel.getByRole("textbox", { name: "Ваш вопрос" })).toBeVisible();
  } else {
    await expect(panel.getByRole("link", { name: "Передать исходные данные" })).toBeVisible();
  }
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

test("admin route keeps the lead database closed until auth is configured", async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/admin/", { waitUntil: "domcontentloaded" });
  const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (authConfigured) {
    await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Админка ещё не подключена" })).toBeVisible();
    await expect(page.getByText("NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")).toBeVisible();
  }
  await page.screenshot({ path: testInfo.outputPath("admin-setup.png"), fullPage: true });
  expect(runtimeErrors).toEqual([]);
});

test("bootstrap administrator can open the protected lead workspace", async ({ page }, testInfo) => {
  test.skip(!process.env.TEST_ADMIN_LOGIN || !process.env.TEST_ADMIN_PASSWORD, "Bootstrap credentials are only provided to secure integration runs.");
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/admin/", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Тип входа").getByRole("button", { name: "Администратор" }).click();
  await page.getByLabel("Логин").fill(process.env.TEST_ADMIN_LOGIN ?? "");
  await page.getByLabel("Пароль").fill(process.env.TEST_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("heading", { name: "Входящие" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Команда" })).toBeVisible();
  await page.getByRole("button", { name: "Команда" }).click();
  const teamDialog = page.getByRole("dialog", { name: "Управление командой" });
  await expect(teamDialog).toBeVisible();
  await expect(teamDialog.getByText("Доступы")).toBeVisible();
  await expect(teamDialog.getByText("Администратор", { exact: true }).last()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("admin-workspace.png"), fullPage: false });
  expect(runtimeErrors).toEqual([]);
});
