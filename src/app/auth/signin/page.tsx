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

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleGoogleSignIn = () => {
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
                  ログイン
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Googleアカウントで簡単にログインできます
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleSignIn}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    backgroundColor: '#4285F4',
                    '&:hover': {
                      backgroundColor: '#357AE8',
                    },
                  }}
                >
                  Googleでログイン
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="sm">
          <Typography>読み込み中...</Typography>
        </Container>
      </Box>
    }>
      <SignInContent />
    </Suspense>
  );
}
