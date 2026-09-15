"use client";
import { useMemo, useState } from "react";

const defaultBody = `Hi, [Name]. Platform suspensions, copyright violations, or lost videos on YouTube can cost content creators years of work.\n\nI’ve developed an automated backup service specifically designed for content creators.\n\n24/7 Automatic Synchronization: Automatically detects and uploads your new posts/streams in their original resolution.\n\nPrivate and Encrypted Storage: Instant access to your entire video library at any time.\n\nFlexible Configuration: Back up a single channel or all your media files at once.\n\nI’d like to offer you a 7-day free trial so you can test the service with no obligations.\n\nJust reply “YES” and provide the link(s) to your channel(s), and I’ll start setting up the backup today.\n\nSincerely, Stanislav Shulga.`;

export default function NewCampaignForm({ senders }: { senders: {id:string; name:string; fromEmail:string}[] }) {
  const [subject, setSubject] = useState("Automatic Cloud Backup for [Name]’s Channels");
  const [body, setBody] = useState(defaultBody);
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const previewBody = useMemo(() => body.replaceAll("[Name]", name || "Alex"), [body,name]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/campaigns", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(payload) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setResult(data.error || "Failed");
    window.location.href = `/campaigns/${data.id}`;
  }
  return <form onSubmit={create}>
    <div className="grid">
      <div className="card col-8">
        <div className="field"><label>Campaign name</label><input name="name" placeholder="YouTube creators — September" required /></div>
        <div className="field"><label>Sender</label><select name="senderId" required defaultValue=""><option value="" disabled>Select sender</option>{senders.map(s => <option key={s.id} value={s.id}>{s.name} — {s.fromEmail}</option>)}</select></div>
        <div className="field"><label>Subject</label><input name="subject" value={subject} onChange={e=>setSubject(e.target.value)} required /></div>
        <div className="field"><label>Email body</label><textarea name="body" value={body} onChange={e=>setBody(e.target.value)} required /></div>
        <button disabled={loading || !senders.length}>{loading ? "Creating…" : "Create campaign"}</button>
        {result && <div className="notice error">{result}</div>}
      </div>
      <div className="card col-4">
        <h2>Preview</h2>
        <div className="field"><label>Example first name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex" /></div>
        <div className="muted" style={{fontSize:12,marginBottom:4}}>Subject</div><strong>{subject.replaceAll("[Name]", name || "Alex")}</strong>
        <pre className="preview" style={{marginTop:12}}>{previewBody}</pre>
      </div>
    </div>
  </form>;
}
