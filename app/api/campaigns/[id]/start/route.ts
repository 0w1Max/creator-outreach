import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function POST(_request: Request, { params }: { params: Promise<{id:string}> }) {
  try {
    const {id}=await params; const workspace=await getDefaultWorkspace();
    const campaign=await prisma.campaign.findFirst({where:{id,workspaceId:workspace.id},include:{sender:true}});
    if(!campaign) return NextResponse.json({error:"Campaign not found"},{status:404});
    if(campaign.status!=="DRAFT") return NextResponse.json({error:`Campaign is already ${campaign.status}`},{status:400});
    const leads=await prisma.lead.findMany({where:{workspaceId:workspace.id,status:"ACTIVE"},orderBy:{createdAt:"asc"}});
    if(!leads.length) return NextResponse.json({error:"No active leads"},{status:400});
    const suppressed = await prisma.suppressionEntry.findMany({where:{workspaceId:workspace.id},select:{email:true}});
    const suppressedSet=new Set(suppressed.map(x=>x.email));
    const recipients=leads.filter(l=>!suppressedSet.has(l.email));
    if (!recipients.length) return NextResponse.json({error:"All active leads are suppressed"},{status:400});
    const created=[];
    for(const lead of recipients){
      const r=await prisma.campaignRecipient.upsert({where:{campaignId_leadId:{campaignId:id,leadId:lead.id}},create:{campaignId:id,leadId:lead.id,status:"QUEUED",queuedAt:new Date()},update:{status:"QUEUED",lastError:null,queuedAt:new Date()}});
      created.push(r);
    }
    await prisma.campaign.update({where:{id},data:{status:"QUEUED",startedAt:new Date()}});
    for(const r of created){ await emailQueue.add("send",{recipientId:r.id}, {jobId:r.id}); }
    return NextResponse.json({queued:created.length});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Failed to start"},{status:500});}
}
