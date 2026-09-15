import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { decryptSecret } from "./crypto";

export type SendEmailInput = {
  senderId: string;
  to: string;
  subject: string;
  body: string;
  messageKey: string;
};

export async function sendEmail(input: SendEmailInput) {
  const sender = await prisma.senderAccount.findUnique({ where: { id: input.senderId } });
  if (!sender) throw new Error("Sender not found");
  if (sender.status !== "ACTIVE") throw new Error("Sender is not active");

  const transporter = nodemailer.createTransport({
    host: sender.smtpHost,
    port: sender.smtpPort,
    secure: sender.smtpSecure,
    auth: {
      user: sender.username,
      pass: decryptSecret(sender.passwordEnc),
    },
  });

  const result = await transporter.sendMail({
    from: `${sender.name} <${sender.fromEmail}>`,
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  return result;
}
