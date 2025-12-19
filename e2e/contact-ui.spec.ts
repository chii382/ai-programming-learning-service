import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

test.describe('contact ui checklist', () => {
  test('1.画面表示: 基本要素/ホーム遷移/レスポンシブ(要素表示) ', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ホームに戻る' })).toBeVisible();

    await expect(page.getByLabel('名前')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('件名')).toBeVisible();
    await expect(page.getByLabel('本文')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();

    // ホームに戻る（クリック）
    await page.getByRole('link', { name: 'ホームに戻る' }).click();
    await expect(page).toHaveURL(/\/$/);

    // レスポンシブ: 各サイズで主要要素が表示される（見た目崩れは画像で確認）
    const outDir = path.join(process.cwd(), 'test-results', 'contact-viewports');
    ensureDir(outDir);

    const viewports = [
      { name: 'desktop-1280', width: 1280, height: 800 },
      { name: 'tablet-768', width: 768, height: 900 },
      { name: 'mobile-375', width: 375, height: 800 },
    ];

    for (const v of viewports) {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto('/contact');
      await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
      await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
      await page.screenshot({ path: path.join(outDir, `${v.name}.png`), fullPage: true });
    }
  });

  test('4.送信成功: 送信中表示/無効化/成功遷移/完了画面/ホーム遷移', async ({ page }) => {
    // メール送信・DB保存で時間が掛かりメールも飛ぶため、UI確認はAPIをモック
    await page.route('**/api/contact', async (route) => {
      const request = route.request();
      const body = request.postDataJSON?.() as any;
      // 最低限の入力が来ていること
      if (!body?.name || !body?.email || !body?.subject || !body?.message) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: '入力内容に誤りがあります' }),
        });
      }
      // 少し待って送信中UIを見せる
      await new Promise((r) => setTimeout(r, 500));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'お問い合わせを受け付けました', storedTo: 'mock' }),
      });
    });

    await page.goto('/contact');

    await page.getByLabel('名前').fill('太郎');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('件名').fill('件名');
    await page.getByLabel('本文').fill('本文');

    const submitButton = page.getByRole('button', { name: '送信する' });
    await submitButton.click();

    // 送信中表示と無効化
    await expect(page.getByRole('button', { name: '送信中...' })).toBeVisible();
    await expect(page.getByRole('button', { name: '送信中...' })).toBeDisabled();
    await expect(page.getByLabel('名前')).toBeDisabled();
    await expect(page.getByLabel('メールアドレス')).toBeDisabled();
    await expect(page.getByLabel('件名')).toBeDisabled();
    await expect(page.getByLabel('本文')).toBeDisabled();

    // 成功画面へ
    await expect(page).toHaveURL(/\/contact\/success$/);
    await expect(page.getByRole('heading', { name: 'お問い合わせを受け付けました' })).toBeVisible();

    // 完了画面のホームに戻る
    await page.getByRole('link', { name: 'ホームに戻る' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});




