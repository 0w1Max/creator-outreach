"use client";
import { useState } from "react";

export default function CampaignActions({ campaignId, status }: { campaignId:string; status:string }) {
  const [msg,setMsg] = useState(""); const [loading,setLoading] = useState(false);
  async function start() { setLoading(true); const r=await fetch(`/api/campaigns/${campaignId}/start`,{method:"POST"}); const d=await r.json(); setLoading(false); setMsg(r.ok?`Queued ${d.queued} emails.`:d.error||"Failed"); if(r.ok) setTimeout(()=>window.location.reload(),600); }
  const disabled = ["QUEUED","RUNNING","COMPLETED"].includes(status);
  return <div style={{margin:"14px 0 18px",display:"flex",gap:10,alignItems:"center"}}><button disabled={disabled||loading} onClick={start}>{loading?"Queueing…":"Start campaign"}</button>{msg&&<span className="muted">{msg}</span>}</div>;
}
