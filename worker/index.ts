import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/templates";

const worker = new Worker("email-send", async (job) => {
  const recipientId = String(job.data.recipientId);
  const recipient = await prisma.campaignRecipient.findUnique({ where:{id:recipientId}, include:{campaign:{include:{sender:true}},lead:true} });
  if (!recipient) throw new Error("Recipient not found");
  if (recipient.status === "SENT" || recipient.status === "SKIPPED") return;

  const suppressed = await prisma.suppressionEntry.findUnique({ where:{workspaceId_email:{workspaceId:recipient.campaign.workspaceId,email:recipient.lead.email}} });
  if (suppressed) {
    await prisma.campaignRecipient.update({where:{id:recipientId},data:{status:"SKIPPED",lastError:"Suppressed"}});
    return;
  }

  const body=renderTemplate(recipient.campaign.body,recipient.lead);
  const subject=renderTemplate(recipient.campaign.subject,recipient.lead);
  const messageKey=`${recipient.campaign.id}:${recipient.lead.id}`;
  await prisma.campaignRecipient.update({where:{id:recipientId},data:{status:"SENDING",attempts:{increment:1}}});
  await prisma.emailMessage.upsert({where:{messageKey},create:{messageKey,campaignId:recipient.campaign.id,leadId:recipient.lead.id,senderId:recipient.campaign.senderId,fromEmail:recipient.campaign.sender.fromEmail,toEmail:recipient.lead.email,subject,body,status:"SENDING"},update:{status:"SENDING",error:null}});
  try {
    const result=await sendEmail({senderId:recipient.campaign.senderId,to:recipient.lead.email,subject,body,messageKey});
    await prisma.$transaction([
      prisma.emailMessage.update({where:{messageKey},data:{status:"SENT",providerId:result.messageId,sentAt:new Date()}}),
      prisma.campaignRecipient.update({where:{id:recipientId},data:{status:"SENT",sentAt:new Date(),lastError:null}}),
    ]);
  } catch(error) {
    const message=error instanceof Error?error.message:"Unknown send error";
    await prisma.emailMessage.update({where:{messageKey},data:{status:"FAILED",error:message}}).catch(()=>undefined);
    await prisma.campaignRecipient.update({where:{id:recipientId},data:{status:"FAILED",lastError:message}}).catch(()=>undefined);
    throw error;
  }
}, { connection: redis, concurrency: 3, limiter: { max: 3, duration: 1000 } });

worker.on("completed", async () => {
  const running=await prisma.campaign.findMany({where:{status:{in:["QUEUED","RUNNING"]}},select:{id:true}});
  for(const c of running){
    const remaining=await prisma.campaignRecipient.count({where:{campaignId:c.id,status:{in:["PENDING","QUEUED","SENDING"]}}});
    if(remaining===0) await prisma.campaign.update({where:{id:c.id},data:{status:"COMPLETED",completedAt:new Date()}});
    else await prisma.campaign.update({where:{id:c.id},data:{status:"RUNNING"}}).catch(()=>undefined);
  }
});

console.log("Email worker started");
