import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import NewCampaignForm from "./new-form";

export default async function NewCampaignPage() {
  const workspace = await getDefaultWorkspace();
  const [senders, leadCount] = await Promise.all([
    prisma.senderAccount.findMany({ where:{ workspaceId: workspace.id, status:"ACTIVE" }, orderBy:{createdAt:"asc"} }),
    prisma.lead.count({ where:{ workspaceId: workspace.id, status:"ACTIVE" } }),
  ]);
  return <><h1>New campaign</h1><p>{leadCount} active leads are available.</p><NewCampaignForm senders={senders.map(s => ({id:s.id,name:s.name,fromEmail:s.fromEmail}))} /></>;
}
