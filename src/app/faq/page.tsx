'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack, ExpandMore, HelpOutline } from '@mui/icons-material';

const faqs = [
  {
    question: 'このサービスは何をしてくれますか？',
    answer: 'コードを第三者視点でレビューし、改善点を具体的に提示します。',
  },
  {
    question: '無料でも品質は落ちませんか？',
    answer: '簡易ですが、有料と同じ基準で指摘します。',
  },
  {
    question: '有料プランとの違いは何ですか？',
    answer: '指摘の深さ・範囲・具体性が大きく異なります。',
  },
  {
    question: 'どんな人に向いていますか？',
    answer: '学習者、実務エンジニア、チーム利用まで対応しています。',
  },
  {
    question: '初心者でも利用できますか？',
    answer: 'はい。前提知識に応じて説明レベルを調整します。',
  },
  {
    question: 'どんな言語に対応していますか？',
    answer:
      '現在は、学習者の多い Web系言語を中心に対応しています。JavaScript、TypeScript、HTML、CSS、Python に対応しており、今後は SQL、React（JSX/TSX）、Node.js などの拡張も予定しています。',
  },
  {
    question: '修正コードも提示してもらえますか？',
    answer: 'プランによりサンプル修正コードを提示します。',
  },
  {
    question: '契約期間の縛りはありますか？',
    answer: 'ありません。いつでも解約可能です。',
  },
  {
    question: 'プラン変更はできますか？',
    answer: 'いつでも上位・下位プランへ変更できます。',
  },
  {
    question: '他サービスとの違いは何ですか？',
    answer: '理由まで説明する"理解できるレビュー"です。',
  },
];

export default function FAQPage() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
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
              icon={<HelpOutline sx={{ fontSize: 40 }} />}
              label="よくある質問"
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
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 600 }}>
              サービスに関するよくある質問と回答をご覧いただけます。
              <br />
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </Typography>
          </Stack>

          {/* FAQアコーディオン */}
          <Box sx={{ width: '100%' }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: expanded === `panel${index}` ? 4 : 1,
                  border: expanded === `panel${index}` ? `2px solid ${theme.palette.secondary.main}` : 'none',
                  transition: 'all 0.3s ease',
                  '&:before': {
                    display: 'none',
                  },
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMore
                      sx={{
                        color: expanded === `panel${index}` ? theme.palette.secondary.main : 'text.secondary',
                        transition: 'transform 0.3s ease',
                        transform: expanded === `panel${index}` ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  }
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(76, 175, 80, 0.02)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      color: expanded === `panel${index}` ? theme.palette.secondary.main : 'text.primary',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 0,
                    bgcolor: expanded === `panel${index}` ? 'rgba(76, 175, 80, 0.02)' : 'transparent',
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* CTAセクション */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 3,
              boxShadow: 2,
              textAlign: 'center',
              mt: 4,
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              まだご不明な点がございますか？
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              お気軽にお問い合わせください。迅速に対応いたします。
            </Typography>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                },
              }}
            >
              お問い合わせ
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
