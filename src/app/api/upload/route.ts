import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Fotoğraf yükleme ayarlanmamış." }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("image");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Sadece fotoğraf yükleyebilirsiniz." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Fotoğraf 8MB'tan küçük olmalı." }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const imgurRes = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: `Client-ID ${clientId}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64, type: "base64" }),
  });

  if (!imgurRes.ok) return NextResponse.json({ error: "Fotoğraf yüklenemedi." }, { status: 502 });
  const data = await imgurRes.json();
  return NextResponse.json({ url: data?.data?.link });
                                                                            }
