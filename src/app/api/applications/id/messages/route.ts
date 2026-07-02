import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const isOwner = app.userId === session.user.id;
  if (!isOwner && !session.user.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const { content } = await req.json();
  if (!content || !content.trim()) return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });

  if (app.status === "BEKLEMEDE" && session.user.isAdmin) {
    await prisma.application.update({ where: { id: app.id }, data: { status: "INCELENIYOR" } });
  }

  const message = await prisma.message.create({
    data: { applicationId: app.id, senderId: session.user.id, content: content.trim() },
    include: { sender: true },
  });

  return NextResponse.json({ ok: true, message });
}
