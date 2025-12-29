'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { AccountCircle } from '@mui/icons-material';

export default function Header() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ callbackUrl: '/' });
  };

  const user = session?.user;
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ py: 1, justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}
            >
              コードレビューサービス
            </Typography>
            <Typography
              variant="h5"
              component="span"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.02em',
                ml: 0.5,
              }}
            >
              Reviewly
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session?.user ? (
            <>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={user?.image || undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {!user?.image && initials}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {user?.name || 'ユーザー'}
                </Typography>
              </Box>
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{ color: 'text.primary' }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={Link} href="/dashboard" onClick={handleClose}>
                  ダッシュボード
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem component={Link} href="/admin" onClick={handleClose}>
                    管理画面
                  </MenuItem>
                )}
                <MenuItem onClick={handleSignOut}>ログアウト</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={Link}
              href="/auth/signin"
              variant="contained"
              size="small"
            >
              ログイン
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}



