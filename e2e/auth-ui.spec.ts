import { test, expect } from '@playwright/test';

test.describe('Google認証機能 - UI確認', () => {
  test.beforeEach(async ({ page }) => {
    // サーバーが起動するまで待機
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1.1 未ログイン時のヘッダー表示', async ({ page }) => {
    // ヘッダーに「ログイン」ボタンが表示されている
    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await expect(loginButton).toBeVisible();
    
    // 「ログイン」ボタンをクリックすると`/auth/signin`に遷移する
    await loginButton.click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('1.2 ログイン画面でのログインボタン表示', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // ページタイトルが「ログイン」になっている
    const heading = page.getByRole('heading', { name: 'ログイン' });
    await expect(heading).toBeVisible();

    // 「Googleでログイン」ボタンが表示されている
    const googleButton = page.getByRole('button', { name: 'Googleでログイン' });
    await expect(googleButton).toBeVisible();

    // 説明文が表示されている
    const description = page.getByText('Googleアカウントで簡単にログインできます');
    await expect(description).toBeVisible();

    // 利用規約とプライバシーポリシーの注意書きが表示されている
    const notice = page.getByText(/利用規約とプライバシーポリシー/);
    await expect(notice).toBeVisible();

    // 「ホームに戻る」ボタンが表示されている
    const homeButton = page.getByRole('button', { name: 'ホームに戻る' });
    await expect(homeButton).toBeVisible();

    // 「ホームに戻る」ボタンをクリックすると`/`に遷移する
    await homeButton.click();
    await expect(page).toHaveURL('/');
  });

  test('8.1 未認証で/dashboardアクセス時、ログイン画面にリダイレクト', async ({ page }) => {
    // ログアウト状態で`/dashboard`に直接アクセスする
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // `/auth/signin`にリダイレクトされる
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // callbackUrlパラメータが含まれている
    const url = page.url();
    expect(url).toContain('callbackUrl');
  });

  test('レスポンシブ表示確認 - デスクトップ', async ({ page }) => {
    // デスクトップサイズで確認
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    const googleButton = page.getByRole('button', { name: 'Googleでログイン' });
    await expect(googleButton).toBeVisible();
  });

  test('レスポンシブ表示確認 - タブレット', async ({ page }) => {
    // タブレットサイズで確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    const googleButton = page.getByRole('button', { name: 'Googleでログイン' });
    await expect(googleButton).toBeVisible();
  });

  test('レスポンシブ表示確認 - スマートフォン', async ({ page }) => {
    // スマートフォンサイズで確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    const googleButton = page.getByRole('button', { name: 'Googleでログイン' });
    await expect(googleButton).toBeVisible();
  });
});


