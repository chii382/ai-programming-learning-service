import nodemailer from 'nodemailer';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!smtpUser || !smtpPassword) {
    throw new Error('SMTP_USER and SMTP_PASSWORD environment variables must be set');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  };

  await transporter.sendMail(mailOptions);
};

export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

  const emailSubject = `[お問い合わせ] ${subject}`;
  const emailText = `
お問い合わせがありました。

【送信者情報】
名前: ${name}
メールアドレス: ${email}

【件名】
${subject}

【本文】
${message}

---
このメールは自動送信されています。
`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">お問い合わせがありました</h2>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">【送信者情報】</h3>
        <p><strong>名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">【件名】</h3>
        <p>${subject}</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">【本文】</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">このメールは自動送信されています。</p>
    </div>
  `;

  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) {
    throw new Error('SMTP_USER environment variable must be set');
  }

  await sendEmail({
    from: `"コードレビューサービス　Reviewly" <${smtpUser}>`,
    to: adminEmail,
    subject: emailSubject,
    text: emailText,
    html: emailHtml,
  });
};
