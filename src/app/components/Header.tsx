'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export default function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ py: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            コードレビューサービス
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}





