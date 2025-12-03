'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center">
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ alignSelf: 'flex-start' }}
          >
            ホームに戻る
          </Button>
          <Typography variant="h3" component="h1" textAlign="center" sx={{ fontWeight: 700 }}>
            利用規約
          </Typography>
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
              width: '100%',
            }}
          >
            <Typography variant="body1" color="text.secondary" textAlign="center">
              利用規約のページは現在準備中です。
              <br />
              しばらくお待ちください。
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/"
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            ホームに戻る
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

