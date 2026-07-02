import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const applications = await prisma.application.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const rejectedCounts = await prisma.application.groupBy({
    by: ["userId"],
    where: { status: "REDDEDILDI" },
    _count: { userId: true },
  });

  const rejectedMap: Record<string, number> = {};
  for (const r of rejectedCounts) rejectedMap[r.userId] = r._count.userId;

  return NextResponse.json({ applications, rejectedMap });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const { id, status, reviewNote } = await req.json();
  const validStatuses = ["BEKLEMEDE", "INCELENIYOR", "KABUL_EDILDI", "REDDEDILDI"];
  if (!id || !validStatuses.includes(status)) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  const application = await prisma.application.update({
    where: { id },
    data: { status, reviewNote, reviewedAt: ["KABUL_EDILDI", "REDDEDILDI"].includes(status) ? new Date() : null },
  });

  return NextResponse.json({ ok: true, application });
}
