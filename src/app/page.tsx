
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppStatus, STATUS_LABEL, STATUS_CLASS } from "@/lib/status";

type MyApp = {
  id: string;
  type: "TRANSFER" | "BAN_AFFI";
  status: AppStatus;
  createdAt: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [myApps, setMyApps] = useState<MyApp[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/applications/mine")
        .then((r) => r.json())
        .then((d) => setMyApps(d.applications || []));
    }
  }, [status]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <header className="border-b ledger-line">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
          <span className="font-display text-sm tracking-[0.25em] text-mute uppercase">Birlik Şubesi</span>
          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              {session.user.avatar && <img src={session.user.avatar} alt="" className="w-7 h-7 rounded-full border ledger-line" />}
              <span className="text-sm text-ink/80">{session.user.username}</span>
              {session.user.isAdmin && (
                <Link href="/panel" className="text-xs uppercase tracking-wider text-signal border border-signal/40 px-2 py-1 hover:bg-signal/10 transition">Panel</Link>
              )}
              <button onClick={() => signOut()} className="text-xs text-mute hover:text-ink transition">Çıkış</button>
            </div>
          ) : (
