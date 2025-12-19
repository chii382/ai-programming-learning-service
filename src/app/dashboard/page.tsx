'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home } from '@mui/icons-material';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          <Typography>読み込み中...</Typography>
        </Container>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Button
            component={Link}
            href="/"
            startIcon={<Home />}
            sx={{ alignSelf: 'flex-start' }}
          >
            ホームに戻る
          </Button>

          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
            ダッシュボード
          </Typography>

          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4} alignItems="center">
                <Avatar
                  src={user.image || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {!user.image && initials}
                </Avatar>

                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {user.name || 'ユーザー'}
                </Typography>

                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>

                {user.role && (
                  <Typography variant="body2" color="text.secondary">
                    ロール: {user.role === 'admin' ? '管理者' : 'ユーザー'}
                  </Typography>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    ようこそ、{user.name || 'ユーザー'}さん！
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ここでは、あなたのコードレビュー履歴や統計情報を確認できます。
                    <br />
                    機能は今後追加予定です。
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
