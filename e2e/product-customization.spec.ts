import { test, expect } from '@playwright/test';

test.describe('Product Customization Flow', () => {
  test('should allow users to customize a product and add it to cart', async ({ page }) => {
    // Navigate to a product detail page
    await page.goto('/product/1');
    await expect(page).toHaveTitle(/Candle Detail/);

    // Verify product information is displayed
    await expect(page.locator('h1')).toContainText('Vanilla Candle');
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();

    // Select customization options
    // Select scent
    await page.locator('[data-testid="scent-option-vanilla"]').click();
    await expect(page.locator('[data-testid="scent-option-vanilla"]')).toHaveAttribute('aria-pressed', 'true');

    // Select color
    await page.locator('[data-testid="color-option-white"]').click();
    await expect(page.locator('[data-testid="color-option-white"]')).toHaveAttribute('aria-pressed', 'true');

    // Select size
    await page.locator('[data-testid="size-option-medium"]').click();
    await expect(page.locator('[data-testid="size-option-medium"]')).toHaveAttribute('aria-pressed', 'true');

    // Verify price updates
    const basePrice = await page.locator('[data-testid="product-base-price"]').textContent();
    const customizedPrice = await page.locator('[data-testid="product-customized-price"]').textContent();
    expect(customizedPrice).not.toEqual(basePrice);

    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();

    // Verify cart drawer opens
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();

    // Verify item was added to cart
    await expect(page.locator('[data-testid="cart-item"]')).toContainText('Vanilla Candle');
    await expect(page.locator('[data-testid="cart-item-customizations"]')).toContainText('Vanilla');
    await expect(page.locator('[data-testid="cart-item-customizations"]')).toContainText('White');
    await expect(page.locator('[data-testid="cart-item-customizations"]')).toContainText('Medium');
  });

  test('should validate customization combinations', async ({ page }) => {
    // Navigate to a product detail page
    await page.goto('/product/1');

    // Select an invalid combination (assuming Vanilla scent is not available with Black color)
    await page.locator('[data-testid="scent-option-vanilla"]').click();
    await page.locator('[data-testid="color-option-black"]').click();

    // Verify validation error is displayed
    await expect(page.locator('[data-testid="customization-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="customization-error"]')).toContainText('Invalid combination');

    // Verify Add to Cart button is disabled
    await expect(page.locator('button:has-text("Add to Cart")')).toBeDisabled();

    // Select a valid combination
    await page.locator('[data-testid="color-option-white"]').click();

    // Verify error is gone
    await expect(page.locator('[data-testid="customization-error"]')).not.toBeVisible();

    // Verify Add to Cart button is enabled
    await expect(page.locator('button:has-text("Add to Cart")')).toBeEnabled();
  });

  test('should show animations when interacting with customization options', async ({ page }) => {
    // Navigate to a product detail page
    await page.goto('/product/1');

    // Get initial transform state of a product image
    const initialTransform = await page.locator('[data-testid="product-image"]').evaluate(el => 
      window.getComputedStyle(el).transform
    );

    // Hover over a color option to trigger animation
    await page.locator('[data-testid="color-option-red"]').hover();

    // Wait for animation to complete
    await page.waitForTimeout(500);

    // Get new transform state
    const hoverTransform = await page.locator('[data-testid="product-image"]').evaluate(el => 
      window.getComputedStyle(el).transform
    );

    // Verify transform has changed (animation occurred)
    expect(hoverTransform).not.toEqual(initialTransform);

    // Click on a scent option
    await page.locator('[data-testid="scent-option-vanilla"]').click();

    // Verify description appears with animation
    await expect(page.locator('[data-testid="scent-description"]')).toBeVisible();
    
    // Check for animation class
    const hasAnimationClass = await page.locator('[data-testid="scent-description"]')
      .evaluate(el => el.classList.contains('animate-fadeIn'));
    expect(hasAnimationClass).toBeTruthy();
  });
});