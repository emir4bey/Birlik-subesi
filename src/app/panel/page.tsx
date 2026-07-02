"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppStatus, STATUS_LABEL, STATUS_CLASS } from "@/lib/status";

type Application = {
  id: string;
  type: "TRANSFER" | "BAN_AFFI";
  reason: string;
  status: AppStatus;
  createdAt: string;
  userId: string;
  user: { username: string; avatar: string | null };
};

export default function PanelPage() {
  const { data: session, status } = useSession();
  const [apps, setApps] = useState<Application[]>([]);
  const [rejectedMap, setRejectedMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "TRANSFER" | "BAN_AFFI">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppStatus>("ALL");

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetch("/api/admin/applications").then((r) => r.json()).then((d) => {
        setApps(d.applications || []);
        setRejectedMap(d.rejectedMap || {});
        setLoading(false);
      });
    }
  }, [session]);

  if (status === "loading") return null;
  if (status !== "authenticated") return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <button onClick={() => signIn("discord")} className="bg-olive hover:bg-olivebright text-base px-5 py-2.5 font-medium transition">Discord ile Giriş Yap</button>
    </main>
  );
  if (!session.user.isAdmin) return (
    <main className="min-h-screen flex items-center justify-center px-5 text-center">
      <div>
        <p className="font-display text-xl font-semibold mb-2">Yetkiniz yok.</p>
        <p className="text-mute text-sm mb-6">Bu sayfa yalnızca Ordu Yönetimi rolüne sahip kişilere açıktır.</p>
        <Link href="/" className="text-signal text-sm">← Ana sayfaya dön</Link>
      </div>
    </main>
  );

  const filtered = apps.filter((a) => (typeFilter === "ALL" || a.type === typeFilter) && (statusFilter === "ALL" || a.status === statusFilter));

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-display text-signal text-xs tracking-[0.3em] uppercase mb-1">Ordu Yönetimi</p>
            <h1 className="font-display text-3xl font-semibold">Başvuru Paneli</h1>
          </div>
          <Link href="/" className="text-xs text-mute hover:text-ink transition">← Ana sayfa</Link>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["ALL", "TRANSFER", "BAN_AFFI"] as const).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)} className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition ${typeFilter === f ? "border-signal text-signal" : "ledger-line text-mute hover:text-ink"}`}>
              {f === "ALL" ? "Tümü" : f === "TRANSFER" ? "Transfer" : "Ban Affı"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setStatusFilter("ALL")} className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition ${statusFilter === "ALL" ? "border-ink text-ink" : "ledger-line text-mute hover:text-ink"}`}>Tüm Durumlar</button>
          {(["BEKLEMEDE", "INCELENIYOR", "KABUL_EDILDI", "REDDEDILDI"] as AppStatus[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition ${statusFilter === s ? STATUS_CLASS[s] : "ledger-line text-mute hover:text-ink"}`}>{STATUS_LABEL[s]}</button>
          ))}
        </div>
        {loading ? <p className="text-mute text-sm">Yükleniyor...</p> : filtered.length === 0 ? <p className="text-mute text-sm">Başvuru yok.</p> : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const rejections = rejectedMap[a.userId] || 0;
              return (
                <Link key={a.id} href={`/basvuru/${a.id}`} className="block border ledger-line bg-panel px-5 py-4 hover:border-olivebright transition">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {a.user.avatar && <img src={a.user.avatar} alt="" className="w-8 h-8 rounded-full" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{a.user.username}</p>
                          {rejections > 0 && <span className="text-[10px] text-danger border border-danger/50 px-1.5 py-0.5">{rejections}x red</span>}
                        </div>
                        <p className="text-xs text-mute">{a.type === "TRANSFER" ? "Transfer" : "Ban Affı"} · {new Date(a.createdAt).toLocaleString("tr-TR")}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${STATUS_CLASS[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                  </div>
                  <p className="text-sm mt-3 leading-relaxed text-ink/80 line-clamp-2">{a.reason}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
          }
