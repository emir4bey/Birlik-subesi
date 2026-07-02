import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { user: true, messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  });

  if (!app) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const isOwner = app.userId === session.user.id;
  if (!isOwner && !session.user.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  let rejectedCount = 0;
  if (session.user.isAdmin) {
    rejectedCount = await prisma.application.count({ where: { userId: app.userId, status: "REDDEDILDI" } });
  }

  return NextResponse.json({ application: app, rejectedCount });
}
