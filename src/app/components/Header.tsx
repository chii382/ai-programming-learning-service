'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import Link from 'next/link';

export default function Header() {
  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          sx={{ 
            py: 1,
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 56, sm: 64 },
          }}
          disableGutters
        >
          <Link 
            href="/" 
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label="ホームに戻る"
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                cursor: 'pointer',
                fontSize: { xs: '1rem', sm: '1.25rem' },
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              コードレビューサービス
            </Typography>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
