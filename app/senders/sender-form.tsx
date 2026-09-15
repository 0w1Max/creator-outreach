"use client";
import { useState } from "react";

export default function SenderForm() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMsg("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/senders", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({...payload, smtpPort:Number(payload.smtpPort), dailyLimit:Number(payload.dailyLimit), smtpSecure: payload.smtpSecure === "on"}) });
    const data = await res.json(); setLoading(false); setMsg(res.ok ? "Sender saved." : data.error || "Failed");
    if (res.ok) window.location.reload();
  }
  return <form className="card" onSubmit={submit}>
    <div className="grid">
      <div className="col-6"><div className="field"><label>Display name</label><input name="name" placeholder="Stanislav" required /></div></div>
      <div className="col-6"><div className="field"><label>From email</label><input name="fromEmail" type="email" placeholder="you@example.com" required /></div></div>
      <div className="col-8"><div className="field"><label>SMTP host</label><input name="smtpHost" placeholder="smtp.gmail.com" required /></div></div>
      <div className="col-4"><div className="field"><label>SMTP port</label><input name="smtpPort" type="number" defaultValue="587" required /></div></div>
      <div className="col-6"><div className="field"><label>Username</label><input name="username" type="text" required /></div></div>
      <div className="col-6"><div className="field"><label>Password / app password</label><input name="password" type="password" required /></div></div>
      <div className="col-6"><div className="field"><label>Daily limit</label><input name="dailyLimit" type="number" defaultValue="100" min="1" max="10000" required /></div></div>
      <div className="col-6" style={{display:"flex",alignItems:"end",paddingBottom:14}}><label style={{display:"flex",gap:8,alignItems:"center",margin:0}}><input name="smtpSecure" type="checkbox" style={{width:16}} /> TLS/SSL (usually port 465)</label></div>
    </div>
    <button disabled={loading}>{loading ? "Saving…" : "Save sender"}</button>
    {msg && <div className="notice">{msg}</div>}
  </form>;
}
