"use client";
import { useState } from "react";

export default function LeadImport() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setLoading(true); setResult("");
    const form = new FormData(); form.append("file", file);
    const res = await fetch("/api/leads/import", { method:"POST", body:form });
    const data = await res.json();
    setLoading(false);
    setResult(res.ok ? `Imported ${data.imported}, skipped ${data.skipped}.` : data.error || "Import failed");
    if (res.ok) window.location.reload();
  }

  return <div className="card">
    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <input type="file" accept=".csv,text/csv" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button disabled={!file || loading} onClick={upload}>{loading ? "Importing…" : "Import CSV"}</button>
    </div>
    {result && <div className="notice" style={{marginBottom:0}}>{result}</div>}
  </div>;
}
