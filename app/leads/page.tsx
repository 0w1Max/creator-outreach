import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import LeadImport from "./lead-import";

export default async function LeadsPage() {
  const workspace = await getDefaultWorkspace();
  const leads = await prisma.lead.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" }, take: 500 });

  return <>
    <h1>Leads</h1>
    <p>CSV columns supported: email, name, channelName, channelUrl, company.</p>
    <LeadImport />
    <div className="card" style={{marginTop:16}}>
      <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Channel</th><th>Status</th></tr></thead>
      <tbody>{leads.map(l => <tr key={l.id}><td>{l.name || "—"}</td><td>{l.email}</td><td>{l.channelName || "—"}</td><td><span className="badge">{l.status}</span></td></tr>)}</tbody></table>
    </div>
  </>;
}
