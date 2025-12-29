'use client';

import React, { Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

function SignUpContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ alignSelf: 'flex-start' }}
          >
            ホームに戻る
          </Button>

          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4} alignItems="center">
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  アカウント登録
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Googleアカウントで簡単に新規登録できます
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleSignUp}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    backgroundColor: '#4285F4',
                    '&:hover': {
                      backgroundColor: '#357AE8',
                    },
                  }}
                >
                  Googleで登録
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  既にアカウントをお持ちの方は{' '}
                  <Link href="/auth/signin" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    ログイン
                  </Link>
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  登録することで、利用規約とプライバシーポリシーに同意したものとみなされます
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="sm">
          <Typography>読み込み中...</Typography>
        </Container>
      </Box>
    }>
      <SignUpContent />
    </Suspense>
  );
}

