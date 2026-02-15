import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.sendgrid.net",
  port: parseInt(process.env.SMTP_PORT ?? "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";

export async function sendEmail(to: string, subject: string, body: string, isHtml = false) {
  return transporter.sendMail({
    from: FROM,
    to,
    subject,
    [isHtml ? "html" : "text"]: body,
  });
}

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST || (process.env.SMTP_USER && process.env.SMTP_PASS));
}
