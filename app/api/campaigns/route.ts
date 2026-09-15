import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import { campaignSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const data = campaignSchema.parse(await request.json());
    const workspace = await getDefaultWorkspace();
    const sender = await prisma.senderAccount.findFirst({ where:{ id:data.senderId, workspaceId:workspace.id, status:"ACTIVE" } });
    if (!sender) return NextResponse.json({ error:"Sender is not active or does not belong to workspace" }, { status:400 });
    const campaign = await prisma.campaign.create({ data:{ workspaceId:workspace.id, senderId:sender.id, name:data.name, subject:data.subject, body:data.body } });
    return NextResponse.json({ id: campaign.id });
  } catch (error) {
    return NextResponse.json({ error:error instanceof Error ? error.message : "Invalid campaign" }, { status:400 });
  }
}
