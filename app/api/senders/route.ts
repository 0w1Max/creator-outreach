import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import { encryptSecret } from "@/lib/crypto";
import { senderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = senderSchema.parse(body);
    const workspace = await getDefaultWorkspace();
    const sender = await prisma.senderAccount.create({ data: {
      workspaceId: workspace.id,
      name: data.name,
      fromEmail: data.fromEmail,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpSecure: data.smtpSecure,
      username: data.username,
      passwordEnc: encryptSecret(data.password),
      dailyLimit: data.dailyLimit,
    }});
    return NextResponse.json({ id: sender.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid sender" }, { status:400 });
  }
}
