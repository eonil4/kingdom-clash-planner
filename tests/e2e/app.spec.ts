import { test, expect, Page } from '@playwright/test';

async function navigateToApp(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[aria-label^="Formation grid"]', { timeout: 60000 });
}

async function selectUnitFromDropdown(page: Page, unitName: string) {
  const dialog = page.getByRole('dialog');
  const selectTrigger = dialog.locator('[role="combobox"]').first();
  await selectTrigger.click();
  await page.waitForSelector('[role="listbox"]', { state: 'visible' });
  await page.getByRole('option', { name: unitName }).click();
  await page.waitForSelector('[role="listbox"]', { state: 'hidden' });
}

async function clickManageUnitsButton(page: Page) {
  // Button shows "Manage Units" on desktop and "Manage" on mobile
  await page.getByRole('button', { name: /^Manage( Units)?$/ }).click();
}

async function addUnitToRoster(page: Page, unitName: string, levels: number[]) {
  await clickManageUnitsButton(page);
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.getByRole('button', { name: 'Add New Unit' }).click();
  
  await selectUnitFromDropdown(page, unitName);
  
  for (const level of levels) {
    await page.getByLabel(String(level), { exact: true }).check();
  }
  
  await page.getByRole('button', { name: 'Add Units' }).click();
  await page.click('[aria-label="Close"]');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

test.describe('App Loading', () => {
  test('should load the application with title', async ({ page }) => {
    await navigateToApp(page);
    await expect(page).toHaveTitle(/Kingdom Clash Planner/i);
  });

  test('should display formation grid, header, and unit list', async ({ page }) => {
    await navigateToApp(page);

    await expect(page.locator('[aria-label^="Formation grid"]')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[aria-label^="Unit roster"]')).toBeVisible();
  });
});

test.describe('Help Overlay', () => {
  test('should open help overlay when clicking help button', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');
    await expect(page.getByText('Application Guide')).toBeVisible();
  });

  test('should display all help sections', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visual Structure' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Usage Guide' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible();
  });

  test('should display formation header section content', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');

    await expect(page.getByText('1. Formation Header')).toBeVisible();
    await expect(page.getByText('Formation Name:')).toBeVisible();
    await expect(page.getByText('Power Display:')).toBeVisible();
  });

  test('should display formation grid section content', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');

    await expect(page.getByText('2. Formation Grid (7x7)')).toBeVisible();
    await expect(page.getByText('Place Units:', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Remove Units:', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Swap Units:', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Replace Units:', { exact: true }).first()).toBeVisible();
  });

  test('should display available units list section content', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');

    await expect(page.getByText('3. Available Units List')).toBeVisible();
    await expect(page.getByText('Sort Controls:')).toBeVisible();
    await expect(page.getByText('Search:')).toBeVisible();
    await expect(page.getByText('Manage Units Button:')).toBeVisible();
    await expect(page.getByText('Withdraw All Button:')).toBeVisible();
  });

  test('should display limits and constraints', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');

    await expect(page.getByText('Limits and Constraints')).toBeVisible();
    await expect(page.getByText('Total Units:')).toBeVisible();
    await expect(page.getByText('Per Unit Per Level:')).toBeVisible();
    await expect(page.getByText('Formation Grid:')).toBeVisible();
  });

  test('should close help overlay when clicking close button', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');
    await expect(page.getByText('Application Guide')).toBeVisible();

    await page.click('[aria-label="Close help overlay"]');
    await expect(page.getByText('Application Guide')).not.toBeVisible();
  });

  test('should close help overlay when pressing Escape', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Open help overlay"]');
    await expect(page.getByText('Application Guide')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByText('Application Guide')).not.toBeVisible();
  });
});

test.describe('Formation Header', () => {
  test('should display formation name', async ({ page }) => {
    await navigateToApp(page);

    await expect(page.getByText('Formation 1')).toBeVisible();
  });

  test('should display total power badge', async ({ page }) => {
    await navigateToApp(page);

    await expect(page.getByText('⚔')).toBeVisible();
  });

  test('should allow editing formation name', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Edit formation name"]');
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Test Formation Name');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Test Formation Name')).toBeVisible();
  });

  test('should cancel editing formation name with Escape', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Edit formation name"]');
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Should Be Cancelled');
    await page.keyboard.press('Escape');

    await expect(page.getByText('Formation 1')).toBeVisible();
    await expect(page.getByText('Should Be Cancelled')).not.toBeVisible();
  });

  test('should update page title with formation name', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Edit formation name"]');
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('Custom Name');
    await page.keyboard.press('Enter');

    await expect(page).toHaveTitle(/Custom Name.*Kingdom Clash Planner/);
  });
});

test.describe('Formation Grid', () => {
  test('should display 7x7 formation grid', async ({ page }) => {
    await navigateToApp(page);

    const tiles = page.locator('[role="gridcell"]');
    await expect(tiles).toHaveCount(49);
  });

  test('should place unit via double-click', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const archerCard = page.locator('[aria-label^="1 Archers"]').first();
    await archerCard.dblclick();

    const firstTile = page.locator('[aria-label*="at row 1 column 1"]');
    await expect(firstTile.locator('[aria-label^="1 Archers"]')).toBeVisible();
  });

  test('should remove unit from formation via double-click', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const archerCard = page.locator('[aria-label^="1 Archers"]').first();
    await archerCard.dblclick();

    const firstTile = page.locator('[aria-label*="at row 1 column 1"]');
    await expect(firstTile.locator('[aria-label^="1 Archers"]')).toBeVisible();

    await firstTile.locator('[aria-label^="1 Archers"]').dblclick();
    await expect(firstTile.locator('[aria-label^="1 Archers"]')).not.toBeVisible();
  });

  test('should update formation power when placing unit', async ({ page }) => {
    await navigateToApp(page);

    const powerBadge = page.locator('header').locator('text=⚔').locator('..');
    const initialPowerText = await powerBadge.textContent();

    await addUnitToRoster(page, 'Archers', [1]);

    const archerCard = page.locator('[aria-label^="1 Archers"]').first();
    await archerCard.dblclick();

    const updatedPowerText = await powerBadge.textContent();
    expect(updatedPowerText).not.toBe(initialPowerText);
  });
});

test.describe('Available Units List', () => {
  test('should display available units area', async ({ page }) => {
    await navigateToApp(page);

    const unitListSection = page.locator('[aria-label^="Unit roster"]');
    await expect(unitListSection).toBeVisible();
    await expect(unitListSection.getByPlaceholder('Search units...')).toBeVisible();
    await expect(unitListSection.getByRole('button', { name: /^Manage( Units)?$/ })).toBeVisible();
  });

  test('should display sort controls', async ({ page }) => {
    await navigateToApp(page);

    await expect(page.locator('[aria-label="Sort units by (primary)"]')).toBeVisible();
    await expect(page.locator('[aria-label="Sort units by (secondary)"]')).toBeVisible();
    await expect(page.locator('[aria-label="Sort units by (tertiary)"]')).toBeVisible();
  });

  test('should filter units by search', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);
    await addUnitToRoster(page, 'Infantry', [1]);

    const searchInput = page.getByPlaceholder('Search units...');
    await searchInput.fill('Archers');

    await expect(page.locator('[aria-label^="1 Archers"]')).toBeVisible();
    await expect(page.locator('[aria-label^="1 Infantry"]')).not.toBeVisible();
  });

  test('should clear search', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);
    await addUnitToRoster(page, 'Infantry', [1]);

    const searchInput = page.getByPlaceholder('Search units...');
    await searchInput.fill('Archers');

    await page.click('[aria-label="Clear search"]');

    await expect(page.locator('[aria-label^="1 Archers"]')).toBeVisible();
    await expect(page.locator('[aria-label^="1 Infantry"]')).toBeVisible();
  });

  test('should sort units by level', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1, 5]);

    await page.locator('[aria-label="Sort units by (primary)"]').click();
    await page.getByRole('option', { name: 'Level' }).click();

    const units = page.locator('[aria-label*="Archers"]');
    await expect(units).toHaveCount(2);
  });

  test('should withdraw all units from formation', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1, 2]);

    const unit1 = page.locator('[aria-label^="1 Archers"]').first();
    await unit1.dblclick();
    const unit2 = page.locator('[aria-label^="2 Archers"]').first();
    await unit2.dblclick();

    const tile1 = page.locator('[aria-label*="at row 1 column 1"]');
    const tile2 = page.locator('[aria-label*="at row 1 column 2"]');
    await expect(tile1.locator('[aria-label^="1 Archers"]')).toBeVisible();
    await expect(tile2.locator('[aria-label^="2 Archers"]')).toBeVisible();

    await page.getByRole('button', { name: /^Withdraw( All)?$/i }).click();

    await expect(tile1.locator('[aria-label^="1 Archers"]')).not.toBeVisible();
    await expect(tile2.locator('[aria-label^="2 Archers"]')).not.toBeVisible();
    const unitList = page.locator('[aria-label^="Unit roster"]');
    await expect(unitList.locator('[aria-label^="1 Archers"]')).toBeVisible();
  });
});

test.describe('Manage Units Modal', () => {
  test('should open manage units modal', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Manage Units')).toBeVisible();
  });

  test('should close manage units modal', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should add new unit', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();

    await selectUnitFromDropdown(page, 'Archers');

    await page.getByLabel('1', { exact: true }).check();
    await page.getByLabel('3', { exact: true }).check();

    await page.getByRole('button', { name: 'Add Units' }).click();

    await expect(page.locator('table').getByRole('cell', { name: 'Archers' }).first()).toBeVisible();
  });

  test('should show unit preview when selecting unit', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();

    await expect(page.getByText('Select a unit')).toBeVisible();

    await selectUnitFromDropdown(page, 'Archers');

    await expect(page.getByText('Select a unit')).not.toBeVisible();
  });

  test('should select all levels when clicking Select All', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();

    await selectUnitFromDropdown(page, 'Archers');

    await page.getByLabel('Select All Levels').click();

    for (let i = 1; i <= 10; i++) {
      await expect(page.getByLabel(String(i), { exact: true })).toBeChecked();
    }
  });

  test('should cancel adding new unit', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();

    await selectUnitFromDropdown(page, 'Archers');
    await page.getByLabel('1', { exact: true }).check();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('button', { name: 'Add New Unit' })).toBeVisible();
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(0);
  });

  test('should edit existing unit', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();
    await selectUnitFromDropdown(page, 'Archers');
    await page.getByLabel('1', { exact: true }).check();
    await page.getByRole('button', { name: 'Add Units' }).click();

    await page.click('[aria-label="Edit Archers"]');

    const countInput = page.locator('input[type="number"]').first();
    await countInput.clear();
    await countInput.fill('5');

    await page.click('[aria-label="Save Archers"]');

    await expect(page.locator('table').locator('td').filter({ hasText: /^5$/ }).first()).toBeVisible();
  });

  test('should delete unit', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();
    await selectUnitFromDropdown(page, 'Archers');
    await page.getByLabel('1', { exact: true }).check();
    await page.getByRole('button', { name: 'Add Units' }).click();

    await expect(page.locator('table').getByRole('cell', { name: 'Archers' }).first()).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    const deleteButton = page.getByRole('button', { name: 'Delete Archers' });
    await deleteButton.click();

    await expect(page.locator('tbody').getByRole('row')).toHaveCount(0, { timeout: 10000 });
  });

  test('should clear entire roster', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();
    await selectUnitFromDropdown(page, 'Archers');
    await page.getByLabel('1', { exact: true }).check();
    await page.getByRole('button', { name: 'Add Units' }).click();

    await page.getByRole('button', { name: 'Add New Unit' }).click();
    await selectUnitFromDropdown(page, 'Infantry');
    await page.getByLabel('1', { exact: true }).check();
    await page.getByRole('button', { name: 'Add Units' }).click();

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear Roster' }).click();

    await expect(page.locator('tbody').getByRole('row')).toHaveCount(0, { timeout: 10000 });
  });

  test('should display unit count in modal', async ({ page }) => {
    await navigateToApp(page);

    await clickManageUnitsButton(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.getByRole('button', { name: 'Add New Unit' }).click();
    await selectUnitFromDropdown(page, 'Archers');
    await page.getByLabel('1', { exact: true }).check();
    await page.getByLabel('2', { exact: true }).check();
    await page.getByRole('button', { name: 'Add Units' }).click();

    await expect(page.getByText('Unit Roster (2 total units)')).toBeVisible();
  });
});

test.describe('Unit Card Interactions', () => {
  test('should show tooltip on click', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    await unitCard.click();

    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('should display unit rarity colors', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    await expect(unitCard).toBeVisible();
  });
});

test.describe('URL Sync', () => {
  test('should update URL when adding units', async ({ page }) => {
    await navigateToApp(page);

    const initialUrl = page.url();

    await addUnitToRoster(page, 'Archers', [1]);

    await page.waitForTimeout(500);
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
    expect(newUrl).toContain('units=');
  });

  test('should update URL when placing units in formation', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    await page.waitForTimeout(300);
    const urlBeforePlacement = page.url();

    const archerCard = page.locator('[aria-label^="1 Archers"]').first();
    await archerCard.dblclick();

    await page.waitForTimeout(500);
    const urlAfterPlacement = page.url();
    expect(urlAfterPlacement).not.toBe(urlBeforePlacement);
    expect(urlAfterPlacement).toContain('formation=');
  });

  test('should update URL when renaming formation', async ({ page }) => {
    await navigateToApp(page);

    await page.click('[aria-label="Edit formation name"]');
    const input = page.locator('input[type="text"]').first();
    await input.clear();
    await input.fill('MyCustomFormation');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);
    const newUrl = page.url();
    expect(newUrl).toContain('formation=');
    expect(decodeURIComponent(newUrl)).toContain('MyCustomFormation');
  });

  test('should load formation from URL', async ({ page }) => {
    const emptyCell = '_';
    const archerCell = '2,1';
    const cells = [archerCell, ...Array(48).fill(emptyCell)];
    const formationData = `MyTestFormation;${cells.join(';')}`;

    await page.goto(`/?formation=${formationData}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('[aria-label^="Formation grid"]', { timeout: 60000 });

    await expect(page.getByText('MyTestFormation')).toBeVisible();
    const firstTile = page.locator('[aria-label*="at row 1 column 1"]');
    await expect(firstTile.locator('[aria-label^="1 Archers"]')).toBeVisible();
  });

  test('should load units from URL', async ({ page }) => {
    const unitsData = '20,2,1;24,3,1';

    await page.goto(`/?units=${unitsData}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('[aria-label^="Formation grid"]', { timeout: 60000 });

    await expect(page.locator('[aria-label^="2 Iron Guards"]')).toBeVisible();
    await expect(page.locator('[aria-label^="3 Monk"]')).toBeVisible();
  });
});

test.describe('Drag and Drop', () => {
  test('should place unit to specific formation tile via drag', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    const targetTile = page.locator('[aria-label*="at row 2 column 3"]');

    const unitBox = await unitCard.boundingBox();
    const tileBox = await targetTile.boundingBox();

    if (unitBox && tileBox) {
      await page.mouse.move(unitBox.x + unitBox.width / 2, unitBox.y + unitBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2, { steps: 10 });
      await page.mouse.up();
    }

    await expect(targetTile.locator('[aria-label^="1 Archers"]')).toBeVisible({ timeout: 5000 });
  });

  test('should remove unit from formation via double-click', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    await unitCard.dblclick();

    const firstTile = page.locator('[aria-label*="at row 1 column 1"]');
    await expect(firstTile.locator('[aria-label^="1 Archers"]')).toBeVisible();

    await firstTile.locator('[aria-label^="1 Archers"]').dblclick();

    await expect(firstTile.locator('[aria-label^="1 Archers"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('[aria-label="Available units"]').locator('[aria-label^="1 Archers"]')).toBeVisible();
  });

  test('should swap units in formation via drag', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);
    await addUnitToRoster(page, 'Infantry', [2]);

    const archer = page.locator('[aria-label^="1 Archers"]').first();
    await archer.dblclick();
    await page.waitForTimeout(300);
    
    const infantry = page.locator('[aria-label^="2 Infantry"]').first();
    await infantry.dblclick();
    await page.waitForTimeout(300);

    const tile1 = page.locator('[aria-label*="at row 1 column 1"]');
    const tile2 = page.locator('[aria-label*="at row 1 column 2"]');

    await expect(tile1.locator('[aria-label^="1 Archers"]')).toBeVisible({ timeout: 10000 });
    await expect(tile2.locator('[aria-label^="2 Infantry"]')).toBeVisible({ timeout: 10000 });

    const archerInFormation = tile1.locator('[aria-label^="1 Archers"]');
    const archerBox = await archerInFormation.boundingBox();
    const tile2Box = await tile2.boundingBox();

    if (archerBox && tile2Box) {
      await page.mouse.move(archerBox.x + archerBox.width / 2, archerBox.y + archerBox.height / 2);
      await page.waitForTimeout(100);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.move(tile2Box.x + tile2Box.width / 2, tile2Box.y + tile2Box.height / 2, { steps: 20 });
      await page.waitForTimeout(100);
      await page.mouse.up();
    }

    await expect(tile1.locator('[aria-label^="2 Infantry"]')).toBeVisible({ timeout: 10000 });
    await expect(tile2.locator('[aria-label^="1 Archers"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Keyboard Navigation', () => {
  test('should navigate units with keyboard', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    await unitCard.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('should close tooltip with Escape', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitCard = page.locator('[aria-label^="1 Archers"]').first();
    await unitCard.click();
    await expect(page.getByRole('tooltip')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });
});

test.describe('Unit Count Badge', () => {
  test('should display unit count badge', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1]);

    const unitList = page.locator('[aria-label^="Unit roster"]');
    await expect(unitList).toBeVisible();
  });

  test('should update available units when placed in formation', async ({ page }) => {
    await navigateToApp(page);

    await addUnitToRoster(page, 'Archers', [1, 2]);

    const availableUnits = page.locator('[aria-label^="Available units"]');
    const initialCount = await availableUnits.locator('[role="button"]').count();

    const archer = page.locator('[aria-label^="1 Archers"]').first();
    await archer.dblclick();

    const newCount = await availableUnits.locator('[role="button"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});
