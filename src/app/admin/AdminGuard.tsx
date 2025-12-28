'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CircularProgress, Box } from '@mui/material';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // ローディング中は何もしない
    if (status === 'loading') return;

    // 既にリダイレクト中の場合は何もしない
    if (isRedirecting) return;

    // デバッグ用ログ
    console.log('AdminGuard - セッション確認:', {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      pathname,
    });

    // セッションがない場合、ログイン画面にリダイレクト
    if (!session?.user) {
      console.log('AdminGuard - セッションなし、ログイン画面にリダイレクト');
      setIsRedirecting(true);
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    // 管理者権限がない場合、403エラーページにリダイレクト
    if (session.user.role !== 'admin') {
      console.log('AdminGuard - 管理者権限なし:', {
        email: session.user.email,
        role: session.user.role,
        expectedRole: 'admin',
      });
      // 既に403ページにいる場合はリダイレクトしない
      if (pathname === '/admin/403') {
        return;
      }
      setIsRedirecting(true);
      router.push('/admin/403');
      return;
    }

    console.log('AdminGuard - 管理者権限確認OK:', {
      email: session.user.email,
      role: session.user.role,
    });
  }, [session, status, router, pathname, isRedirecting]);

  // ローディング中
  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // セッションがない場合、または管理者権限がない場合
  if (!session?.user || session.user.role !== 'admin') {
    // リダイレクト中の場合はローディング表示
    if (isRedirecting) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    // それ以外の場合は何も表示しない（リダイレクト処理中）
    return null;
  }

  return <>{children}</>;
}

