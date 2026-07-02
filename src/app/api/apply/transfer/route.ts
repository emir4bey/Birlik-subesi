import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const body = await req.json();
  const { reason, proofUrl } = body;
  if (!reason || !proofUrl) return NextResponse.json({ error: "Sebep ve kanıt zorunludur." }, { status: 400 });

  const application = await prisma.application.create({
    data: { type: "TRANSFER", reason, proofUrl, userId: session.user.id },
  });

  return NextResponse.json({ ok: true, application });
}
