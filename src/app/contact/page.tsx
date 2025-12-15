'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack, Send } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    } else if (formData.name.length > 100) {
      newErrors.name = '名前は100文字以内で入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    } else if (formData.email.length > 255) {
      newErrors.email = 'メールアドレスは255文字以内で入力してください';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '件名を入力してください';
    } else if (formData.subject.length > 200) {
      newErrors.subject = '件名は200文字以内で入力してください';
    }

    if (!formData.message.trim()) {
      newErrors.message = '本文を入力してください';
    } else if (formData.message.length > 5000) {
      newErrors.message = '本文は5000文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && typeof data === 'object' && 'fieldErrors' in data && data.fieldErrors) {
          setErrors(data.fieldErrors as FormErrors);
          setSubmitError('');
          return;
        }
        throw new Error(data.error || '送信に失敗しました');
      }

      // 送信成功時は送信完了画面にリダイレクト
      router.push('/contact/success');
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : '送信に失敗しました。しばらくしてから再度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ alignSelf: 'flex-start' }}
          >
            ホームに戻る
          </Button>

          <Typography variant="h3" component="h1" textAlign="center" sx={{ fontWeight: 700 }}>
            お問い合わせ
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Stack spacing={3}>
              {submitError && (
                <Alert severity="error">{submitError}</Alert>
              )}

              <TextField
                label="名前"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
                disabled={isSubmitting}
              />

              <TextField
                label="メールアドレス"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
                disabled={isSubmitting}
              />

              <TextField
                label="件名"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                required
                fullWidth
                disabled={isSubmitting}
              />

              <TextField
                label="本文"
                name="message"
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                required
                fullWidth
                multiline
                rows={8}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
