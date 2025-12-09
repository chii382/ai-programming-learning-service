'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { CheckCircle, Home } from '@mui/icons-material';

export default function ContactSuccessPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center">
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 6,
              borderRadius: 2,
              boxShadow: 2,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 3,
              }}
            />

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              お問い合わせを受け付けました
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              お問い合わせありがとうございます。
              <br />
              内容を確認次第、ご連絡いたします。
            </Typography>

            <Alert severity="success" sx={{ mb: 4 }}>
              通常、2営業日以内にご返信いたします。
            </Alert>

            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<Home />}
            >
              ホームに戻る
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
