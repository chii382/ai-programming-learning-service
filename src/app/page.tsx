'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  TrendingUp,
  PersonAdd,
  Code,
  SmartToy,
  ArrowUpward,
} from '@mui/icons-material';
import Link from 'next/link';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h1" component="h1" sx={{ fontWeight: 700 }}>
              AIがあなたのコードをレビュー
            </Typography>
            <Typography variant="h5" sx={{ maxWidth: 800, opacity: 0.95 }}>
              24時間いつでも、どこでも。プログラミング学習を加速させる、次世代のコードレビューサービス
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, opacity: 0.9 }}>
              独学でも安心。Claude AIが的確なフィードバックを提供します
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  px: 4,
                  py: 1.5,
                }}
                component={Link}
                href="/auth/signup"
              >
                無料で始める
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  px: 4,
                  py: 1.5,
                }}
                component={Link}
                href="#how-it-works"
              >
                使い方を見る
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* サービス特徴セクション */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            サービス特徴
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <AccessTime
                      sx={{
                        fontSize: 64,
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                  <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                    24時間いつでもレビュー
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    深夜や早朝でも、AIが即座にコードレビューを提供。あなたの学習ペースに合わせて、いつでもフィードバックが得られます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: 64,
                        color: theme.palette.secondary.main,
                      }}
                    />
                  </Box>
                  <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                    的確なフィードバック
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Claude Haiku 4.5が、エラー修正からコード品質向上まで、実践的なアドバイスを提供します。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <TrendingUp
                      sx={{
                        fontSize: 64,
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                  <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                    学習進捗の可視化
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    あなたのコード品質の推移を可視化。成長を実感しながら、効率的にスキルアップできます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 使い方ステップセクション */}
      <Box
        id="how-it-works"
        sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            使い方
          </Typography>
          {isMobile ? (
            <Stack spacing={4}>
              {[
                {
                  step: 1,
                  icon: <PersonAdd sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'アカウント登録',
                  description:
                    'メールアドレスまたはGoogleアカウントで簡単登録。無料プランで月5回までレビューを受けられます。',
                },
                {
                  step: 2,
                  icon: <Code sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'コードを投稿',
                  description:
                    'コードエディタに直接入力するか、ファイルをアップロード。対応言語は自動検出されます。',
                },
                {
                  step: 3,
                  icon: <SmartToy sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'AIレビューを受ける',
                  description:
                    'Claude AIがコードを解析し、エラー修正や改善提案を提供。数秒でレビュー結果が返ってきます。',
                },
                {
                  step: 4,
                  icon: <ArrowUpward sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
                  title: 'コードを改善',
                  description:
                    'フィードバックを参考にコードを改善。レビュー履歴で成長の軌跡を確認できます。',
                },
              ].map((item) => (
                <Card key={item.step} sx={{ p: 3 }}>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <Grid container spacing={4}>
              {[
                {
                  step: 1,
                  icon: <PersonAdd sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'アカウント登録',
                  description:
                    'メールアドレスまたはGoogleアカウントで簡単登録。無料プランで月5回までレビューを受けられます。',
                },
                {
                  step: 2,
                  icon: <Code sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'コードを投稿',
                  description:
                    'コードエディタに直接入力するか、ファイルをアップロード。対応言語は自動検出されます。',
                },
                {
                  step: 3,
                  icon: <SmartToy sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
                  title: 'AIレビューを受ける',
                  description:
                    'Claude AIがコードを解析し、エラー修正や改善提案を提供。数秒でレビュー結果が返ってきます。',
                },
                {
                  step: 4,
                  icon: <ArrowUpward sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
                  title: 'コードを改善',
                  description:
                    'フィードバックを参考にコードを改善。レビュー履歴で成長の軌跡を確認できます。',
                },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.step}>
                  <Card sx={{ height: '100%', p: 3 }}>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.light,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h6" component="h3">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* CTAセクション */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 10 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              今すぐ始めて、コードレビューでスキルアップ
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95 }}>
              無料プランで月5回まで利用可能
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              クレジットカード不要。今すぐ無料で始められます。
            </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
                component={Link}
                href="/auth/signup"
              >
                無料で始める
              </Button>
          </Stack>
        </Container>
      </Box>

      {/* フッター */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}>
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
                    fontSize: '1.5rem',
                    letterSpacing: '-0.02em',
                    ml: 0.5,
                  }}
                >
                  Reviewly
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                プログラミング学習を加速させる、次世代のコードレビューサービス
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      サービス
                    </Typography>
                    <Link href="#how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                        使い方
                      </Typography>
                    </Link>
                    <Link href="/pricing" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                        料金プラン
                      </Typography>
                    </Link>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      サポート
                    </Typography>
                    <Link href="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                        よくある質問
                      </Typography>
                    </Link>
                    <Link href="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                        お問い合わせ
                      </Typography>
                    </Link>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              © 2024 コードレビューサービス　Reviewly. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

