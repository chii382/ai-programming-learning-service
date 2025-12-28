import { test, expect } from '@playwright/test';

test.describe('contact required validation', () => {
  test('all empty -> required errors shown and not submitted', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page.getByText('名前を入力してください')).toBeVisible();
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('件名を入力してください')).toBeVisible();
    await expect(page.getByText('本文を入力してください')).toBeVisible();

    // 成功画面には遷移しない
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('missing name shows name required', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('件名').fill('件名');
    await page.getByLabel('本文').fill('本文');

    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('名前を入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('missing email shows email required', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('名前').fill('太郎');
    await page.getByLabel('件名').fill('件名');
    await page.getByLabel('本文').fill('本文');

    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('missing subject shows subject required', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('名前').fill('太郎');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('本文').fill('本文');

    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('件名を入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('missing message shows message required', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('名前').fill('太郎');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('件名').fill('件名');

    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('本文を入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('error clears after typing', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: '送信する' }).click();
    await expect(page.getByText('名前を入力してください')).toBeVisible();

    await page.getByLabel('名前').fill('太郎');

    // 入力後、名前エラーは消える
    await expect(page.getByText('名前を入力してください')).toBeHidden();
  });
});






