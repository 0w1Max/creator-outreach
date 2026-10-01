import "./globals.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="header">
            <div><strong>Creator Outreach</strong><div className="muted" style={{fontSize:12}}>Outbound MVP</div></div>
            <nav className="nav">
              <Link href="/">Dashboard</Link>
              <Link href="/leads">Leads</Link>
              <Link href="/senders">Senders</Link>
              <Link href="/campaigns">Campaigns</Link>
            </nav>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
