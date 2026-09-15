import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  await prisma.$queryRaw`SELECT 1`;
  const pong = await redis.ping();
  return NextResponse.json({ ok:true, postgres:true, redis:pong === "PONG" });
}
