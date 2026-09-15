import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function Dashboard() {
  const workspace = await getDefaultWorkspace();
  const [leads, senders, campaigns, sent] = await Promise.all([
    prisma.lead.count({ where: { workspaceId: workspace.id } }),
    prisma.senderAccount.count({ where: { workspaceId: workspace.id, status: "ACTIVE" } }),
    prisma.campaign.count({ where: { workspaceId: workspace.id } }),
    prisma.emailMessage.count({ where: { status: "SENT", campaign: { workspaceId: workspace.id } } }),
  ]);

  return <>
    <h1>Outbound dashboard</h1>
    <p>Import your blogger list, connect a sender, create a campaign and launch it.</p>
    <div className="grid" style={{marginTop:18}}>
      <div className="card col-4"><div className="muted">Leads</div><strong style={{fontSize:28}}>{leads}</strong></div>
      <div className="card col-4"><div className="muted">Active senders</div><strong style={{fontSize:28}}>{senders}</strong></div>
      <div className="card col-4"><div className="muted">Sent emails</div><strong style={{fontSize:28}}>{sent}</strong></div>
      <div className="card col-12">
        <h2>Start here</h2>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Link href="/leads"><button>Import leads</button></Link>
          <Link href="/senders"><button className="secondary">Add sender</button></Link>
          <Link href="/campaigns/new"><button className="secondary">Create campaign</button></Link>
        </div>
      </div>
    </div>
  </>;
}
