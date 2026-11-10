import { expect, test, type Page } from "@playwright/test";

const BADGE = "Valheim 1.0.20 · data 2026-10-28";

async function tabbables(page: Page) {
  return page.evaluate(() => {
    return [...document.querySelectorAll("a, button, input, select, textarea")].filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tabIndex < 0) return false;
      if (el.closest("[hidden]")) return false;
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    }).map((el) => ({
      name: (el.getAttribute("data-vh-name") || el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " "),
    }));
  });
}

async function tabToIron(page: Page) {
  const items = await tabbables(page);
  const idx = items.findIndex((el) => el.name === "Iron");
  expect(idx, `Iron was not in the tab order (${items.length} controls)`).toBeGreaterThan(0);
  for (let i = 0; i < idx + 1; i++) await page.keyboard.press("Tab");
  await expect(page.locator("[data-vh-name='Iron']")).toBeFocused();
}

async function clickableStats(page: Page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll("a, button, input, select, textarea, [role='button']")].filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.closest("[hidden]")) return false;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const small = els.filter((el) => (el as HTMLElement).getBoundingClientRect().height < 40);
    return {
      total: els.length,
      small: small.length,
      ratio: els.length ? small.length / els.length : 1,
      sample: small.slice(0, 12).map((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return {
          tag: el.tagName,
          name: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
          h: Math.round(rect.height),
        };
      }),
    };
  });
}

test.describe("full graph", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the dataset version in the header", async ({ page }) => {
    await expect(page.locator("#view-version")).toHaveText(BADGE);
  });

  test("search is a labelled search field with a gold focus ring", async ({ page }) => {
    await expect(page.locator("#vh-search")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Compact view" })).toBeFocused();
    await page.keyboard.press("Tab");
    const search = page.locator("#vh-search");
    await expect(search).toBeFocused();
    await expect(search).toHaveAttribute("type", "search");
    await expect(search).toHaveAttribute("aria-label", "Search");
    await expect(search).toHaveAttribute("autocomplete", "off");
    await expect(search).toHaveAttribute("aria-controls", "vh-results");
    const ring = await search.evaluate((el) => {
      const style = getComputedStyle(el);
      return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset };
    });
    expect(ring).toEqual({ style: "solid", width: "2px", color: "rgb(216, 179, 90)", offset: "2px" });
  });

  test("tabs to Iron and Enter opens it", async ({ page }) => {
    const iron = page.getByRole("button", { name: "Iron", exact: true });
    await expect(iron).toHaveAttribute("aria-pressed", "false");
    await tabToIron(page);
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await expect(iron).toHaveAttribute("aria-pressed", "true");
  });

  test("Enter opens an exact search match, arrows move, Esc clears then closes", async ({ page }) => {
    const search = page.locator("#vh-search");
    await search.fill("Iron");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("[data-vh-result]:focus")).toHaveCount(1);
    await page.keyboard.press("ArrowUp");
    await expect(search).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");

    await search.fill("ore");
    await expect(search).toHaveValue("ore");
    await page.keyboard.press("Enter");
    const title = (await page.locator("[data-vh-title]").innerText()).trim();
    const first = await page.locator("[data-vh-result]").first().getAttribute("data-vh-name");
    expect(title.toLowerCase()).toContain("ore");
    expect(title).toBe(first);

    await page.keyboard.press("Escape");
    await expect(search).toHaveValue("");
    await expect(page.locator("[data-vh-title]")).toHaveText(title);
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-vh-title]")).toHaveCount(0);
  });

  test("group headers expose expanded state", async ({ page }) => {
    const bosses = page.getByRole("button", { name: /Bosses \(\d+\)/ }).first();
    await expect(bosses).toHaveAttribute("aria-expanded", "true");
    const controls = await bosses.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toBeVisible();
    await bosses.click();
    await expect(bosses).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("compact view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compact/");
  });

  test("shows the same version badge", async ({ page }) => {
    await expect(page.locator("#view-version")).toHaveText(BADGE);
    await expect(page.locator("#vh-search")).toHaveAttribute("type", "search");
    await expect(page.locator("#vh-search")).toHaveAttribute("aria-label", "Search all biomes");
    await expect(page.locator("#vh-search")).toHaveAttribute("autocomplete", "off");
  });

  test("Enter opens Iron, Esc clears the query and then the panel", async ({ page }, info) => {
    const search = page.locator("#vh-search");
    await search.fill("Iron");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    if (info.project.name === "desktop") {
      await expect(page.getByRole("button", { name: "Iron", exact: true })).toHaveAttribute("aria-pressed", "true");
    }
    await page.keyboard.press("Escape");
    await expect(search).toHaveValue("");
    await expect(page.locator("[data-vh-title]")).toHaveText("Iron");
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-vh-title]")).toHaveCount(0);
  });

  test("category chips and chain toggle keep their pressed or checked state", async ({ page }, info) => {
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
    const creatures = page.getByRole("button", { name: /Creatures$/ }).first();
    await creatures.click();
    await expect(creatures).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("radio", { name: "Direct links" })).toHaveAttribute("aria-checked", "true");
    if (info.project.name === "desktop") {
      await expect(page.getByRole("button", { name: "Meadows", exact: true })).toHaveAttribute("aria-pressed", "true");
    } else {
      await expect(page.getByRole("button", { name: "Previous biome" })).toHaveAttribute("aria-disabled", "true");
      await expect(page.getByRole("button", { name: "Next biome" })).toHaveAttribute("aria-disabled", "false");
    }
  });
});

test("desktop chips stay dense", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "dense layout is the fine-pointer default");
  await page.goto("/");
  const height = await page.getByRole("button", { name: "Iron", exact: true }).evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeLessThan(36);
  const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
  expect(coarse).toBe(false);
});

test("phone tap targets stay at least 40px for most controls", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "coarse pointer is the phone project");
  await page.goto("/");
  const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
  expect(coarse, "Chromium mobile emulation should report pointer: coarse").toBe(true);

  const iron = await page.getByRole("button", { name: "Iron", exact: true }).evaluate((el) => el.getBoundingClientRect().height);
  expect(iron).toBeGreaterThanOrEqual(40);
  const materials = await page.getByRole("button", { name: /Materials \(\d+\)/ }).first().evaluate((el) => el.getBoundingClientRect().height);
  expect(materials).toBeGreaterThanOrEqual(44);

  for (const path of ["/", "/compact/"]) {
    await page.goto(path);
    const stats = await clickableStats(page);
    expect(stats.ratio, `${path} small controls: ${JSON.stringify(stats)}`).toBeLessThan(0.1);
    await page.locator("#vh-search").fill("Iron");
    await page.keyboard.press("Enter");
    const open = await clickableStats(page);
    expect(open.ratio, `${path} with Iron open: ${JSON.stringify(open)}`).toBeLessThan(0.1);
  }
});
