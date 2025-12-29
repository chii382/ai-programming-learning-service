import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from './components/ThemeProvider';
import SessionProvider from './components/SessionProvider';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'コードレビューサービス　Reviewly - プログラミング学習を加速させる',
  description: 'AIがあなたのコードをレビュー。24時間いつでも、どこでも。Claude AIが的確なフィードバックを提供します。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <SessionProvider>
            <ThemeProvider>
              <Header />
              {children}
            </ThemeProvider>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

