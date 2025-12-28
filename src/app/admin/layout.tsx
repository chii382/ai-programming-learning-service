'use client';

import React from 'react';
import { Box, Container, Tabs, Tab, useTheme } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { Dashboard, People, ContactMail } from '@mui/icons-material';
import AdminGuard from './AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  // 403エラーページの場合はAdminGuardをスキップ
  const is403Page = pathname === '/admin/403';

  const getTabValue = () => {
    if (pathname === '/admin') return 0;
    if (pathname.startsWith('/admin/users')) return 1;
    if (pathname.startsWith('/admin/contacts')) return 2;
    return 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        router.push('/admin');
        break;
      case 1:
        router.push('/admin/users');
        break;
      case 2:
        router.push('/admin/contacts');
        break;
    }
  };

  const content = (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!is403Page && (
        <Container maxWidth="lg">
          <Tabs
            value={getTabValue()}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3,
            }}
          >
            <Tab
              icon={<Dashboard />}
              iconPosition="start"
              label="ダッシュボード"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<People />}
              iconPosition="start"
              label="ユーザー管理"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<ContactMail />}
              iconPosition="start"
              label="お問い合わせ管理"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Container>
      )}
      {children}
    </Box>
  );

  // 403エラーページの場合はAdminGuardをスキップ
  if (is403Page) {
    return content;
  }

  return <AdminGuard>{content}</AdminGuard>;
}
