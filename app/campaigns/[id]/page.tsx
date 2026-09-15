import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import CampaignActions from "./campaign-actions";

export default async function CampaignPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params; const workspace = await getDefaultWorkspace();
  const campaign = await prisma.campaign.findFirst({ where:{ id, workspaceId:workspace.id }, include:{sender:true, recipients:{include:{lead:true},orderBy:{id:"asc"}}} });
  if (!campaign) notFound();
  const counts = campaign.recipients.reduce<Record<string,number>>((a,r)=>{a[r.status]=(a[r.status]||0)+1; return a;},{});
  return <>
    <h1>{campaign.name}</h1>
    <p>{campaign.sender.fromEmail} · {campaign.status}</p>
    <CampaignActions campaignId={campaign.id} status={campaign.status} />
    <div className="grid">
      <div className="card col-8"><h2>Email</h2><strong>{campaign.subject}</strong><pre className="preview" style={{marginTop:12}}>{campaign.body}</pre></div>
      <div className="card col-4"><h2>Recipients</h2>{Object.entries(counts).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span>{k}</span><strong>{v}</strong></div>)}</div>
    </div>
    <div className="card" style={{marginTop:16}}><h2>Delivery log</h2><table className="table"><thead><tr><th>Lead</th><th>Email</th><th>Status</th><th>Error</th></tr></thead><tbody>{campaign.recipients.map(r=><tr key={r.id}><td>{r.lead.name || "—"}</td><td>{r.lead.email}</td><td><span className="badge">{r.status}</span></td><td>{r.lastError || ""}</td></tr>)}</tbody></table></div>
  </>;
}
