import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error:"CSV file is required" }, { status:400 });
    const text = await file.text();
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string,string>[];
    const workspace = await getDefaultWorkspace();
    let imported = 0, skipped = 0;
    for (const row of records) {
      const email = (row.email || row.Email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) { skipped++; continue; }
      const existing = await prisma.lead.findUnique({ where: { workspaceId_email: { workspaceId: workspace.id, email } } });
      if (existing) { skipped++; continue; }
      await prisma.lead.create({ data: {
        workspaceId: workspace.id,
        email,
        name: (row.name || row.Name || "").trim() || null,
        channelName: (row.channelName || row.channel_name || row.ChannelName || "").trim() || null,
        channelUrl: (row.channelUrl || row.channel_url || row.ChannelUrl || "").trim() || null,
        company: (row.company || row.Company || "").trim() || null,
      }});
      imported++;
    }
    return NextResponse.json({ imported, skipped });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status:500 });
  }
}
