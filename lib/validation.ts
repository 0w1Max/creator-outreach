import { z } from "zod";

export const senderSchema = z.object({
  name: z.string().min(1).max(120),
  fromEmail: z.email(),
  smtpHost: z.string().min(1),
  smtpPort: z.coerce.number().int().min(1).max(65535).default(587),
  smtpSecure: z.boolean().default(false),
  username: z.string().min(1),
  password: z.string().min(1),
  dailyLimit: z.coerce.number().int().min(1).max(10000).default(100),
});

export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  senderId: z.string().min(1),
  subject: z.string().min(1).max(998),
  body: z.string().min(1),
});
