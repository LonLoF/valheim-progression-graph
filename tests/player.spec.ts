import { expect, test, type Page } from "@playwright/test";

async function openJump(page: Page) {
  const jump = page.locator("[data-vh-jump]").first();
  await expect(jump).toBeVisible();
  const name = await jump.getAttribute("data-vh-name");
  expect(name).toBeTruthy();
  await jump.click();
  return name as string;
}

test.describe("deep links", () => {
  test("compact deep link opens Burial Chambers and the first Back stays on the site", async ({ page }, info) => {
    await page.goto("/compact/?item=burial-chambers");
    await expect(page.locator("[data-vh-title]")).toHaveText("Burial Chambers");
    if (info.project.name === "desktop") {
      const chip = page.locator("[data-vh-name='Burial Chambers']");
      await expect(chip).toBeVisible();
    }
    await page.goBack();
    await expect(page.locator("[data-vh-title]")).toHaveCount(0);
    expect(new URL(page.url()).pathname).toMatch(/\/compact\/?$/);
  });

  test("an alias slug opens the same item", async ({ page }) => {
    await page.goto("/compact/?item=forest-crypt");
    await expect(page.locator("[data-vh-title]")).toHaveText("Burial Chambers");
  });

  test("browser Back returns to the previous item", async ({ page }) => {
    await page.goto("/compact/?item=wood");
    await expect(page.locator("[data-vh-title]")).toHaveText("Wood");
    const next = await openJump(page);
    await expect(page.locator("[data-vh-title]")).toHaveText(next);
    expect(page.url()).toContain("item=");
    await page.goBack();
    await expect(page.locator("[data-vh-title]")).toHaveText("Wood");
  });

  test("switching views keeps the selected item and chain mode", async ({ page }) => {
    await page.goto("/?item=iron&mode=chain");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(page.getByRole("radio", { name: "Whole chain" })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("link", { name: "Compact view" }).click();
    await expect(page).toHaveURL(/\/compact\/\?.*item=iron/);
    await expect(page).toHaveURL(/mode=chain/);
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(page.getByRole("radio", { name: "Whole chain" })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("link", { name: "Full graph" }).click();
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(page).toHaveURL(/item=iron/);
    await expect(page).toHaveURL(/mode=chain/);
  });

  test("copy link shows Copied and writes the share URL", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/compact/?item=burial-chambers&biome=black-forest");
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("status")).toHaveText("Copied");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("item=burial-chambers");
    expect(copied).toContain("biome=black-forest");
  });
});

test.describe("compact phone navigation", () => {
  test("search replaces the biome header", async ({ page }) => {
    await page.goto("/compact/");
    await page.locator("#vh-search").fill("iron");
    await expect(page.locator("[data-vh-search-head]")).toHaveText(/Search: \d+ results in all biomes/);
  });

  test("phone biome tabs scroll and Leads to stays above the chain", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "biome scroller is the phone width");
    await page.goto("/compact/?item=wood&mode=chain");
    const biomes = page.locator(".vh-biome-scroll");
    await expect(biomes).toBeVisible();
    const snap = await biomes.evaluate((el) => getComputedStyle(el).scrollSnapType);
    expect(snap).toContain("x");
    await expect(page.locator(".vh-cat-hint")).toBeVisible();
    const leads = await page.getByText("Leads to").first().boundingBox();
    const upstream = await page.getByText("Upstream chain").first().boundingBox();
    const from = await page.getByText("Comes from").first().boundingBox();
    expect(leads && upstream && from).toBeTruthy();
    expect(leads!.y).toBeLessThan(from!.y);
    expect(leads!.y).toBeLessThan(upstream!.y);
  });
});

test("creatures list bosses before the rest", async ({ page }) => {
  await page.goto("/compact/");
  await expect(page.locator("#vh-cat-cre [data-vh-name]").first()).toBeVisible();
  const names = await page.locator("#vh-cat-cre [data-vh-name]").allTextContents();
  expect(names[0]).toBe("Eikthyr");
  const boar = names.indexOf("Boar");
  expect(boar).toBeGreaterThan(0);
});

test("food badges and the food filter", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Food \(\d+\)/ }).first().click();
  await expect(page.locator("[data-vh-name='Honey'] [data-vh-food]")).toHaveAttribute("data-vh-food", "Stamina");
  await expect(page.locator("[data-vh-name='Cooked Boar Meat'] [data-vh-food]")).toHaveAttribute("data-vh-food", "Health");
  await page.getByRole("button", { name: "Stamina", exact: true }).click();
  await expect(page.locator("[data-vh-name='Honey']")).toBeVisible();
  await expect(page.locator("[data-vh-name='Cooked Boar Meat']")).toHaveCount(0);
});

test("portrait windows use the phone layout", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "viewport is set inside the test");
  await page.setViewportSize({ width: 900, height: 1200 });
  await page.goto("/compact/");
  await expect(page.getByRole("button", { name: "Previous biome" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Meadows", exact: true })).toHaveCount(0);
  await expect(page.locator("#vh-results")).toBeVisible();
});

test("a selected chain fits 1280×800 and 1920×1080 without page scrolling", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "desktop viewports");
  for (const size of [{ width: 1280, height: 800 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    await page.goto("/?item=iron");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    const fit = await page.evaluate(() => ({
      scroll: document.documentElement.scrollHeight,
      inner: window.innerHeight,
    }));
    expect(fit.scroll, `${size.width}x${size.height}`).toBeLessThanOrEqual(fit.inner + 2);
    await expect(page.locator("[data-vh-name='Iron']")).toBeVisible();
  }
});

test("a pre-rendered item page opens that item", async ({ page }) => {
  await page.goto("/i/burial-chambers/");
  await expect(page).toHaveURL(/[?&]item=burial-chambers/);
  await expect(page).toHaveTitle("Burial Chambers · Valheim Progression");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Burial Chambers · Valheim Progression");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lonlof.github.io/valheim-progression-graph/i/burial-chambers/");
  await expect(page.locator("[data-vh-title]")).toHaveText("Burial Chambers");
  await expect(page.getByText(/Chest loot/)).toBeVisible();
  await page.goBack();
  await expect(page.locator("[data-vh-title]")).toHaveCount(0);
});

test("an item without a wiki page links to more info", async ({ page }) => {
  await page.goto("/?item=baby-seal");
  await expect(page.locator("[data-vh-title]")).toHaveText("Baby Seal");
  const more = page.locator("[data-vh-more]");
  await expect(more).toHaveText("More info");
  await expect(more).toHaveAttribute("href", /valheimdb\.com\/creatures\/baby-seal/);
});

test("iron whole chain is on screen quickly", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "timed on the desktop project");
  const started = Date.now();
  await page.goto("/?item=iron&mode=chain");
  await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
  await expect(page.getByRole("radio", { name: "Whole chain" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("All raw sources in the chain")).toBeVisible();
  const ms = Date.now() - started;
  console.log(`iron whole chain ${ms} ms`);
  expect(ms, "whole chain after the data split").toBeLessThan(300);
});

test("where to farm, plan, and the next step of a ladder", async ({ page }) => {
  await page.goto("/compact/?item=wood");
  await expect(page.locator("[data-vh-farm]")).toContainText("Where to farm");
  await expect(page.locator("[data-vh-farm]")).toContainText("Earliest lane: Meadows");
  await page.getByRole("tab", { name: "Plan" }).click();
  await expect(page.locator("[data-vh-plan]")).toContainText("Nothing to craft");
  await page.goto("/?item=bronze");
  await page.getByRole("tab", { name: "Plan" }).click();
  await expect(page.locator("[data-vh-plan]")).toContainText("Copper");
  await expect(page.locator("[data-vh-plan]")).toContainText("Tin");
  await page.getByRole("tab", { name: "Progression" }).click();
  await page.getByRole("tab", { name: "Item" }).click();
  await page.goto("/compact/?item=bronze-sword");
  await expect(page.getByRole("button", { name: /Next better:/ })).toBeVisible();
});
