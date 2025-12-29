import { test, expect } from '@playwright/test';

test.describe('KDL REPL', () => {
  test('should load the REPL page with example KDL', async ({ page }) => {
    await page.goto('/');

    // Check that the page loaded
    await expect(page.locator('h1')).toHaveText('KDL REPL');

    // Check that the input has example content
    const input = page.locator('#kdl-input');
    await expect(input).not.toBeEmpty();

    // Check that AST view is visible by default
    const astView = page.locator('#ast-view');
    await expect(astView).toBeVisible();

    // Check that AST content is rendered
    const astContent = page.locator('#ast-content');
    await expect(astContent).not.toBeEmpty();
  });

  test('should parse simple KDL input', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const astContent = page.locator('#ast-content');

    // Clear and enter simple KDL
    await input.clear();
    await input.fill('node "value"');

    // Wait for parsing and rendering
    await page.waitForTimeout(100);

    // Check that AST contains the node
    await expect(astContent.locator('.ast-node-name')).toContainText('node');
    await expect(astContent.locator('.ast-node-value')).toContainText('"value"');
  });

  test('should show error for invalid KDL', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const errorMessage = page.locator('#error-message');

    // Clear and enter invalid KDL
    await input.clear();
    await input.fill('invalid { unclosed');

    // Wait for parsing
    await page.waitForTimeout(100);

    // Check that error is displayed
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Parse Error');
  });

  test('should switch between AST and JSON views', async ({ page }) => {
    await page.goto('/');

    const viewSelector = page.locator('#view-selector');
    const astView = page.locator('#ast-view');
    const jsonView = page.locator('#json-view');

    // AST view should be visible by default
    await expect(astView).toBeVisible();
    await expect(jsonView).not.toBeVisible();

    // Switch to JSON view
    await viewSelector.selectOption('json');

    // JSON view should be visible now
    await expect(astView).not.toBeVisible();
    await expect(jsonView).toBeVisible();

    // Check that JSON content is present
    const jsonContent = page.locator('#json-content');
    await expect(jsonContent).not.toBeEmpty();

    // Switch back to AST view
    await viewSelector.selectOption('ast');
    await expect(astView).toBeVisible();
    await expect(jsonView).not.toBeVisible();
  });

  test('should render JSON representation correctly', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const viewSelector = page.locator('#view-selector');
    const jsonContent = page.locator('#json-content');

    // Enter simple KDL
    await input.clear();
    await input.fill('package "my-app" version="1.0.0"');

    // Switch to JSON view
    await viewSelector.selectOption('json');

    // Wait for rendering
    await page.waitForTimeout(100);

    // Check JSON content
    const json = await jsonContent.textContent();
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty('nodes');
    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.nodes[0].name).toBe('package');
    expect(parsed.nodes[0].arguments).toEqual(['my-app']);
    expect(parsed.nodes[0].properties).toEqual({ version: '1.0.0' });
  });

  test('should handle nested KDL nodes in AST', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const astContent = page.locator('#ast-content');

    // Enter nested KDL
    await input.clear();
    await input.fill(`parent {
  child "value"
}`);

    // Wait for rendering
    await page.waitForTimeout(100);

    // Check that parent node exists
    const parentNode = astContent.locator('.ast-node').first();
    await expect(parentNode.locator('.ast-node-name')).toContainText('parent');

    // Check that toggle button exists for parent
    const toggleBtn = parentNode.locator('.ast-toggle').first();
    await expect(toggleBtn).toBeVisible();

    // Children should be collapsed by default
    const children = parentNode.locator('.ast-node-children').first();
    await expect(children).toHaveClass(/collapsed/);

    // Click toggle to expand
    await toggleBtn.click();

    // Wait for re-render
    await page.waitForTimeout(100);

    // Children should now be visible
    await expect(children).not.toHaveClass(/collapsed/);

    // Check that child node is visible
    await expect(children.locator('.ast-node-name')).toContainText('child');
  });

  test('should handle empty input', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const astContent = page.locator('#ast-content');
    const jsonContent = page.locator('#json-content');
    const errorMessage = page.locator('#error-message');

    // Clear input
    await input.clear();

    // Wait for update
    await page.waitForTimeout(100);

    // Error should not be shown
    await expect(errorMessage).not.toBeVisible();

    // AST should show empty message
    await expect(astContent).toContainText('Enter KDL to see the AST');

    // JSON should be empty
    await expect(jsonContent).toBeEmpty();
  });

  test('should escape HTML in node values', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#kdl-input');
    const astContent = page.locator('#ast-content');

    // Enter KDL with HTML-like content
    await input.clear();
    await input.fill('node "<script>alert(1)</script>"');

    // Wait for rendering
    await page.waitForTimeout(100);

    // Check that the script tag is escaped in the output
    const nodeValue = astContent.locator('.ast-node-value');
    const innerHTML = await nodeValue.innerHTML();

    // Should not contain actual script tag
    expect(innerHTML).not.toContain('<script>');
    // Should contain escaped version
    expect(innerHTML).toContain('&lt;script&gt;');
  });
});

test.describe('KDL REPL Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be mobile-friendly', async ({ page }) => {
    await page.goto('/');

    // Check that view selector is visible and full-width on mobile
    const viewSelector = page.locator('#view-selector');
    await expect(viewSelector).toBeVisible();

    // Check that input is responsive
    const input = page.locator('#kdl-input');
    await expect(input).toBeVisible();

    // Test interaction on mobile
    await input.clear();
    await input.fill('mobile "test"');

    // Wait for rendering
    await page.waitForTimeout(100);

    // Check that AST is rendered
    const astContent = page.locator('#ast-content');
    await expect(astContent.locator('.ast-node-name')).toContainText('mobile');
  });

  test('should switch views on mobile', async ({ page }) => {
    await page.goto('/');

    const viewSelector = page.locator('#view-selector');
    const astView = page.locator('#ast-view');
    const jsonView = page.locator('#json-view');

    // Initially AST view
    await expect(astView).toBeVisible();

    // Switch to JSON
    await viewSelector.selectOption('json');
    await expect(jsonView).toBeVisible();
    await expect(astView).not.toBeVisible();
  });
});
