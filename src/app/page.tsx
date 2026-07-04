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
          <span className="font-display text-sm tracking-[0.25em] text-mute uppercase">Birlik Subesi</span>
          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              {session.user.avatar && <img src={session.user.avatar} alt="" className="w-7 h-7 rounded-full border ledger-line" />}
              <span className="text-sm text-ink/80">{session.user.username}</span>
              {session.user.isAdmin && <Link href="/panel" className="text-xs uppercase tracking-wider text-signal border border-signal/40 px-2 py-1 hover:bg-signal/10 transition">Panel</Link>}
              <button onClick={() => signOut()} className="text-xs text-mute hover:text-ink transition">Cikis</button>
            </div>
          ) : (
            <button onClick={() => signIn("discord")} className="text-xs uppercase tracking-wider bg-olive hover:bg-olivebright text-base px-3 py-2 transition font-medium">Discord ile Giris</button>
          )}
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 pt-20 pb-16">
        <p className="font-display text-signal text-xs tracking-[0.3em] uppercase mb-4">Sevk ve Disiplin Subesi</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] mb-6">
          Transfer ve Ban Affi
          <br />
          <span className="text-olivebright">basvurulariniz tek dosyada.</span>
        </h1>
        <p className="text-mute max-w-xl text-base leading-relaxed mb-10">
          Discord hesabinizla giris yapin, kimliginiz otomatik dogrulansin.
        </p>
        {status !== "authenticated" ? (
          <button onClick={() => signIn("discord")} className="font-display uppercase tracking-wider bg-signal hover:brightness-110 text-base px-6 py-3 font-semibold transition">
            Discord ile Giris Yap
          </button>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mb-12">
            <Link href="/basvuru/transfer" className="group border ledger-line bg-panel px-5 py-5 hover:border-olivebright transition">
              <span className="block text-[10px] tracking-[0.25em] text-mute uppercase mb-2">Dosya 01</span>
              <span className="font-display text-xl font-semibold block mb-1">Transfer Basvurusu</span>
              <span className="text-sm text-mute group-hover:text-ink transition">Birlik gecisi talep et</span>
            </Link>
            <Link href="/basvuru/ban-affi" className="group border ledger-line bg-panel px-5 py-5 hover:border-signal transition">
              <span className="block text-[10px] tracking-[0.25em] text-mute uppercase mb-2">Dosya 02</span>
              <span className="font-display text-xl font-semibold block mb-1">Ban Affi Basvurusu</span>
              <span className="text-sm text-mute group-hover:text-ink transition">Cezanin gozden gecirilmesini iste</span>
            </Link>
          </div>
        )}
      </section>
      <footer className="border-t ledger-line">
        <div className="mx-auto max-w-5xl px-5 py-6 text-xs text-mute flex justify-between">
          <span>Tum basvurular Ordu Yonetimi tarafindan incelenir.</span>
          <span>Birlik Subesi</span>
        </div>
      </footer>
    </main>
  );
}
