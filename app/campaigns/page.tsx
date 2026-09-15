import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function CampaignsPage() {
  const workspace = await getDefaultWorkspace();
  const campaigns = await prisma.campaign.findMany({ where: { workspaceId: workspace.id }, include: { sender: true, _count: { select:{recipients:true} } }, orderBy:{createdAt:"desc"} });
  return <>
    <div className="header"><div><h1>Campaigns</h1><p style={{margin:0}}>One-step outbound campaigns for the MVP.</p></div><Link href="/campaigns/new"><button>New campaign</button></Link></div>
    <div className="card"><table className="table"><thead><tr><th>Name</th><th>Sender</th><th>Recipients</th><th>Status</th></tr></thead><tbody>
      {campaigns.map(c => <tr key={c.id}><td><Link href={`/campaigns/${c.id}`}><strong>{c.name}</strong></Link></td><td>{c.sender.fromEmail}</td><td>{c._count.recipients}</td><td><span className="badge">{c.status}</span></td></tr>)}
    </tbody></table></div>
  </>;
}
