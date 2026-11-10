import { expect, test } from "@playwright/test";

test.describe("progress mode", () => {
  test("dims later biomes, glows what you can craft, and round-trips JSON", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Progress", exact: true }).click();
    const elder = page.locator("[data-vh-id][data-vh-name='The Elder']");
    const bronze = page.locator("[data-vh-id][data-vh-name='Bronze']");
    const bench = page.locator("[data-vh-id][data-vh-name='Workbench']");
    await expect(elder).toHaveAttribute("data-vh-gated", "");
    await expect(bronze).toHaveAttribute("data-vh-gated", "");
    await expect(bench).toHaveAttribute("data-vh-craftable", "");
    await expect(bench).not.toHaveAttribute("data-vh-gated", "");

    await page.locator("[data-vh-progress]").getByRole("button", { name: "Eikthyr", exact: true }).click();
    await expect(elder).not.toHaveAttribute("data-vh-gated", "");
    await expect(bronze).toHaveAttribute("data-vh-craftable", "");

    await page.getByRole("button", { name: "Stations", exact: true }).click();
    await page.getByLabel("Smelter level").selectOption("0");
    await expect(bronze).not.toHaveAttribute("data-vh-craftable", "");
    await page.getByRole("button", { name: "Stations", exact: true }).click();

    await page.locator("[data-vh-id][data-vh-name='Copper']").click();
    await page.getByRole("button", { name: "I have this" }).click();
    await page.keyboard.press("Escape");
    await page.locator("[data-vh-id][data-vh-name='Tin']").click();
    await page.getByRole("button", { name: "I have this" }).click();
    await expect(bronze).toHaveAttribute("data-vh-craftable", "");

    await page.getByRole("button", { name: "Export JSON" }).click();
    const saved = await page.getByLabel("Progress JSON").inputValue();
    expect(saved).toContain('"v": 1');
    expect(saved).toContain("eikthyr");
    const stored = await page.evaluate(() => localStorage.getItem("vpg.progress.v1"));
    expect(JSON.parse(stored || "{}").v).toBe(1);
    expect(JSON.parse(stored || "{}").bosses).toContain("eikthyr");

    await page.getByRole("button", { name: "Reset progress" }).click();
    await expect(bronze).toHaveAttribute("data-vh-gated", "");
    await expect(page.locator("[data-vh-progress]").getByRole("button", { name: "Eikthyr", exact: true })).toHaveAttribute("aria-pressed", "false");

    await page.getByLabel("Progress JSON").fill(saved);
    await page.getByRole("button", { name: "Import JSON" }).click();
    await expect(page.locator("[data-vh-progress]").getByRole("button", { name: "Eikthyr", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(bronze).toHaveAttribute("data-vh-craftable", "");

    await page.reload();
    await expect(page.getByRole("button", { name: "Progress", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-vh-progress]").getByRole("button", { name: "Eikthyr", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("boss ticks stay at least 40px on a phone", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "coarse pointer");
    await page.goto("/compact/");
    await page.getByRole("button", { name: "Progress", exact: true }).click();
    const height = await page.locator("[data-vh-progress]").getByRole("button", { name: "Eikthyr", exact: true }).evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(40);
  });
});

test.describe("pinned plans", () => {
  test("shares quantities in the URL, sums raw materials, and copies Discord text", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/?plan=bronze:5,iron:1");
    await expect(page.locator("[data-vh-pins]")).toContainText("Bronze");
    await expect(page.locator("[data-vh-pins]")).toContainText("Iron");
    await expect(page.locator("[data-vh-plan-raw]")).toContainText("Copper Ore × 10");
    expect(decodeURIComponent(page.url())).toContain("plan=bronze:5,iron:1");

    await page.getByRole("button", { name: "Copy for Discord" }).click();
    const discord = await page.evaluate(() => navigator.clipboard.readText());
    expect(discord).toContain("**Bronze** × 5");
    expect(discord).toContain("**Iron** × 1");
    expect(discord).toContain("• Copper × 10");

    await page.getByRole("button", { name: "Copy as text" }).click();
    const plain = await page.evaluate(() => navigator.clipboard.readText());
    expect(plain).toContain("Bronze × 5");
    expect(plain).toContain("Copper × 10");
    expect(plain).not.toContain("**");

    const stored = await page.evaluate(() => localStorage.getItem("vpg.pins.v1"));
    expect(stored).toContain("bronze:5");
  });

  test("an alias slug becomes the canonical pin and survives a view switch", async ({ page }) => {
    await page.goto("/compact/?plan=forest-crypt:2&item=iron");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(page.locator("[data-vh-pins]")).toContainText("Burial Chambers");
    expect(decodeURIComponent(page.url())).toContain("plan=burial-chambers:2");
    await page.getByRole("link", { name: "Full graph" }).click();
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(page.locator("[data-vh-pins]")).toContainText("Burial Chambers");
    expect(decodeURIComponent(page.url())).toContain("item=iron");
    expect(decodeURIComponent(page.url())).toContain("plan=burial-chambers:2");
  });

  test("the plan tab pins the chosen quantity", async ({ page }) => {
    await page.goto("/?item=bronze");
    await page.getByRole("tab", { name: "Plan" }).click();
    await page.getByLabel("Quantity").fill("5");
    await page.getByRole("button", { name: "Pin × 5" }).click();
    expect(decodeURIComponent(page.url())).toContain("plan=bronze:5");
    await page.getByRole("button", { name: "Pins 1" }).click();
    await expect(page.locator("[data-vh-plan-raw]")).toContainText("Copper Ore × 10");
  });
});
