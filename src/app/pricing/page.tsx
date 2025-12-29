'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack, CheckCircle, AttachMoney } from '@mui/icons-material';

const plans = [
  {
    name: '無料プラン',
    description: '体験用・入口',
    catchphrase: 'まずは"直される体験"を、無料で。',
    price: 0,
    priceLabel: '¥0',
    period: '/月',
    buttonText: '無料で始める',
    buttonVariant: 'outlined' as const,
    features: [
      '単一ファイルの簡易レビュー',
      '静的解析ベースの指摘',
      'コーディング規約チェック',
      '改善ポイントの要点提示',
      '月5回まで利用可能',
    ],
    tag: null,
    highlighted: false,
  },
  {
    name: 'ライトプラン',
    description: '学習・個人向け',
    catchphrase: '独学の限界を、レビューで超える。',
    price: 980,
    priceLabel: '¥980',
    period: '/月',
    buttonText: '今すぐ始める',
    buttonVariant: 'outlined' as const,
    features: [
      '単一ファイル詳細レビュー',
      '可読性・命名の改善提案',
      '軽微なロジック不備指摘',
      'ベストプラクティス共有',
      'コメント形式で返却',
    ],
    tag: null,
    highlighted: false,
  },
  {
    name: 'スタンダードプラン',
    description: '実務向け・主力',
    catchphrase: 'そのコード、プロはこう直す。',
    price: 1980,
    priceLabel: '¥1,980',
    period: '/月',
    buttonText: '今すぐ始める',
    buttonVariant: 'contained' as const,
    features: [
      '複数ファイルのコードレビュー',
      '設計観点での改善指摘',
      'パフォーマンス改善提案',
      'セキュリティ初期チェック',
      'サンプルコード提示',
    ],
    tag: 'おすすめ',
    highlighted: true,
  },
  {
    name: 'プロフェッショナルプラン',
    description: 'チーム・企業向け',
    catchphrase: 'チームの品質を、仕組みで上げる。',
    price: 3980,
    priceLabel: '¥3,980',
    period: '/月',
    buttonText: 'チームで始める',
    buttonVariant: 'outlined' as const,
    features: [
      'リポジトリ単位レビュー',
      'アーキテクチャ評価',
      '技術的負債の可視化',
      'チーム改善ガイド作成',
    ],
    tag: 'チーム向け',
    highlighted: false,
  },
];

export default function PricingPage() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ alignSelf: 'flex-start' }}
          >
            ホームに戻る
          </Button>

          {/* ヘッダーセクション */}
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Chip
              icon={<AttachMoney sx={{ fontSize: 40 }} />}
              label="料金プラン"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                color: theme.palette.secondary.main,
                fontWeight: 600,
                fontSize: '2.25rem',
                py: 3,
                px: 3,
                height: 'auto',
              }}
            />
            <Typography variant="h4" component="h2" textAlign="center" sx={{ fontWeight: 600, mt: 2, maxWidth: 800 }}>
              その不安、レビューで解消しませんか？
              <br />
              今のコードを、今すぐプロの目でチェック
            </Typography>
          </Stack>

          {/* プランカード */}
          <Grid container spacing={4}>
            {plans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={plan.name}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.highlighted ? `2px solid ${theme.palette.secondary.main}` : 'none',
                    boxShadow: plan.highlighted ? 4 : 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {plan.tag && (
                    <Chip
                      label={plan.tag}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 16,
                        bgcolor: plan.highlighted
                          ? theme.palette.secondary.main
                          : 'rgba(76, 175, 80, 0.1)',
                        color: plan.highlighted ? 'white' : theme.palette.secondary.main,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 3,
                        color: plan.highlighted ? theme.palette.secondary.main : 'text.primary',
                        fontSize: '1rem',
                      }}
                    >
                      {plan.catchphrase}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color: plan.highlighted ? theme.palette.secondary.main : 'text.primary',
                        }}
                      >
                        {plan.priceLabel}
                      </Typography>
                      <Typography variant="h6" component="span" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href="/auth/signup"
                      variant={plan.buttonVariant}
                      fullWidth
                      size="large"
                      sx={[
                        { mb: 3 },
                        plan.highlighted && {
                          background: 'linear-gradient(90deg, #4caf50 0%, #ff9800 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #45a049 0%, #f57c00 100%)',
                          },
                        },
                        !plan.highlighted && plan.buttonVariant === 'outlined' && {
                          borderColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            borderColor: theme.palette.secondary.dark,
                            bgcolor: 'rgba(76, 175, 80, 0.04)',
                          },
                        },
                      ]}
                    >
                      {plan.buttonText}
                    </Button>
                    <List sx={{ flexGrow: 1 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* フッター */}
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
            すべてのプランはいつでもキャンセル可能です。年間プランは
            <Box component="span" sx={{ color: '#ff9800', fontWeight: 600 }}>
              20%オフ
            </Box>
            でご利用いただけます。
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

