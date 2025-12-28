'use client';

import React from 'react';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Home, Lock } from '@mui/icons-material';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Lock sx={{ fontSize: 80, color: 'error.main' }} />
            </Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              403 Forbidden
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              アクセス権限がありません
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              このページは管理者専用です。管理者権限を持つアカウントでログインしてください。
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              component={Link}
              href="/"
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
