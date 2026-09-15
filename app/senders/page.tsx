import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import SenderForm from "./sender-form";

export default async function SendersPage() {
  const workspace = await getDefaultWorkspace();
  const senders = await prisma.senderAccount.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } });
  return <>
    <h1>Senders</h1>
    <p>For Gmail, use an app password with SMTP. OAuth connectors can be added next without changing campaigns.</p>
    <SenderForm />
    <div className="card" style={{marginTop:16}}>
      <table className="table"><thead><tr><th>Name</th><th>From</th><th>SMTP</th><th>Daily limit</th><th>Status</th></tr></thead>
      <tbody>{senders.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.fromEmail}</td><td>{s.smtpHost}:{s.smtpPort}</td><td>{s.dailyLimit}</td><td><span className="badge">{s.status}</span></td></tr>)}</tbody></table>
    </div>
  </>;
}
