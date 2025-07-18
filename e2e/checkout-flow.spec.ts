import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart before each test
    await page.goto('/product/1');
    await page.locator('[data-testid="scent-option-vanilla"]').click();
    await page.locator('[data-testid="color-option-white"]').click();
    await page.locator('[data-testid="size-option-medium"]').click();
    await page.locator('button:has-text("Add to Cart")').click();
    
    // Wait for cart drawer to appear and then close it
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await page.locator('[data-testid="close-cart-button"]').click();
  });

  test('should complete the checkout process as a guest user', async ({ page }) => {
    // Navigate to cart page
    await page.goto('/cart');
    
    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // Proceed to checkout
    await page.locator('button:has-text("Proceed to Checkout")').click();
    
    // Verify we're on the checkout page
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('h1')).toContainText('Checkout');
    
    // Fill shipping information
    await page.locator('[data-testid="first-name-input"]').fill('John');
    await page.locator('[data-testid="last-name-input"]').fill('Doe');
    await page.locator('[data-testid="street-input"]').fill('123 Main St');
    await page.locator('[data-testid="city-input"]').fill('Anytown');
    await page.locator('[data-testid="state-input"]').fill('CA');
    await page.locator('[data-testid="zip-code-input"]').fill('12345');
    await page.locator('[data-testid="country-input"]').selectOption('USA');
    await page.locator('[data-testid="phone-input"]').fill('555-123-4567');
    
    // Select shipping option
    await page.locator('[data-testid="shipping-option-express"]').click();
    
    // Continue to payment
    await page.locator('button:has-text("Continue to Payment")').click();
    
    // Verify we're on the payment step
    await expect(page.locator('[data-testid="payment-step"]')).toBeVisible();
    
    // Fill payment information using Stripe test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242 4242 4242 4242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');
    
    // Complete payment
    await page.locator('button:has-text("Complete Payment")').click();
    
    // Verify we're on the review step
    await expect(page.locator('[data-testid="review-step"]')).toBeVisible();
    
    // Place order
    await page.locator('button:has-text("Place Order")').click();
    
    // Verify we're redirected to order confirmation
    await expect(page).toHaveURL(/\/checkout\/confirmation/);
    await expect(page.locator('h1')).toContainText('Order Confirmation');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should allow users to navigate between checkout steps', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    
    // Verify we're on the shipping step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('shipping');
    
    // Fill shipping information
    await page.locator('[data-testid="first-name-input"]').fill('John');
    await page.locator('[data-testid="last-name-input"]').fill('Doe');
    await page.locator('[data-testid="street-input"]').fill('123 Main St');
    await page.locator('[data-testid="city-input"]').fill('Anytown');
    await page.locator('[data-testid="state-input"]').fill('CA');
    await page.locator('[data-testid="zip-code-input"]').fill('12345');
    await page.locator('[data-testid="country-input"]').selectOption('USA');
    await page.locator('[data-testid="phone-input"]').fill('555-123-4567');
    
    // Continue to payment
    await page.locator('button:has-text("Continue to Payment")').click();
    
    // Verify we're on the payment step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('payment');
    
    // Go back to shipping step
    await page.locator('[data-testid="step-shipping"]').click();
    
    // Verify we're back on the shipping step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('shipping');
    
    // Go forward to payment step again
    await page.locator('button:has-text("Continue to Payment")').click();
    
    // Fill payment information
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242 4242 4242 4242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');
    
    // Complete payment
    await page.locator('button:has-text("Complete Payment")').click();
    
    // Verify we're on the review step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('review');
    
    // Go back to payment step
    await page.locator('[data-testid="step-payment"]').click();
    
    // Verify we're back on the payment step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('payment');
  });

  test('should show animations during checkout process', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    
    // Verify fade-in animation on shipping form
    const hasFadeInClass = await page.locator('[data-testid="shipping-form"]')
      .evaluate(el => el.classList.contains('animate-fadeIn'));
    expect(hasFadeInClass).toBeTruthy();
    
    // Fill shipping information
    await page.locator('[data-testid="first-name-input"]').fill('John');
    await page.locator('[data-testid="last-name-input"]').fill('Doe');
    await page.locator('[data-testid="street-input"]').fill('123 Main St');
    await page.locator('[data-testid="city-input"]').fill('Anytown');
    await page.locator('[data-testid="state-input"]').fill('CA');
    await page.locator('[data-testid="zip-code-input"]').fill('12345');
    await page.locator('[data-testid="country-input"]').selectOption('USA');
    await page.locator('[data-testid="phone-input"]').fill('555-123-4567');
    
    // Continue to payment
    await page.locator('button:has-text("Continue to Payment")').click();
    
    // Verify page transition animation
    await page.waitForTimeout(300); // Wait for animation
    
    // Check for animation class on payment form
    const hasPaymentAnimationClass = await page.locator('[data-testid="payment-form"]')
      .evaluate(el => el.classList.contains('animate-fadeIn'));
    expect(hasPaymentAnimationClass).toBeTruthy();
    
    // Verify interactive elements have hover animations
    const initialTransform = await page.locator('button:has-text("Complete Payment")')
      .evaluate(el => window.getComputedStyle(el).transform);
    
    // Hover over button
    await page.locator('button:has-text("Complete Payment")').hover();
    
    // Wait for animation
    await page.waitForTimeout(300);
    
    // Get new transform
    const hoverTransform = await page.locator('button:has-text("Complete Payment")')
      .evaluate(el => window.getComputedStyle(el).transform);
    
    // Verify transform has changed (animation occurred)
    expect(hoverTransform).not.toEqual(initialTransform);
  });
});