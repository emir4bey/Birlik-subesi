"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppStatus, STATUS_LABEL, STATUS_CLASS } from "@/lib/status";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { username: string; avatar: string | null };
};

type ApplicationDetail = {
  id: string;
  type: "TRANSFER" | "BAN_AFFI";
  reason: string;
  proofUrl: string;
  status: AppStatus;
  createdAt: string;
  userId: string;
  user: { username: string; avatar: string | null };
  messages: Message[];
};

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/applications/${id}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
      setRejectedCount(data.rejectedCount || 0);
    } else {
      const data = await res.json();
      setError(data.error || "Bulunamadı.");
    }
  }, [id]);

  useEffect(() => { if (status === "authenticated") load(); }, [status, load]);
  useEffect(() => {
    if (status !== "authenticated") return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status, load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [app?.messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch(`/api/applications/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setSending(false);
    if (res.ok) { setDraft(""); load(); }
  }

  async function changeStatus(newStatus: AppStatus) {
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    load();
  }

  if (status === "loading") return null;
  if (status !== "authenticated") return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <button onClick={() => signIn("discord")} className="bg-olive hover:bg-olivebright text-base px-5 py-2.5 font-medium transition">Discord ile Giriş Yap</button>
    </main>
  );
  if (error) return (
    <main className="min-h-screen flex items-center justify-center px-5 text-center">
      <div><p className="text-danger mb-4">{error}</p><Link href="/" className="text-signal text-sm">← Ana sayfaya dön</Link></div>
    </main>
  );
  if (!app) return null;

  const isAdmin = session.user.isAdmin;

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href={isAdmin ? "/panel" : "/"} className="text-xs text-mute hover:text-ink transition">← {isAdmin ? "Panele dön" : "Ana sayfa"}</Link>
        <div className="border ledger-line bg-panel px-5 py-5 mt-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="font-display text-signal text-xs tracking-[0.3em] uppercase mb-1">{app.type === "TRANSFER" ? "Transfer Başvurusu" : "Ban Affı Başvurusu"}</p>
              <div className="flex items-center gap-2">
                {app.user.avatar && <img src={app.user.avatar} alt="" className="w-7 h-7 rounded-full" />}
                <span className="text-sm font-medium">{app.user.username}</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border h-fit ${STATUS_CLASS[app.status]}`}>{STATUS_LABEL[app.status]}</span>
          </div>
          <p className="text-sm mt-4 leading-relaxed text-ink/90">{app.reason}</p>
          <a href={app.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-signal underline mt-2 inline-block">Kanıt linki</a>
          {app.proofUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
            <img src={app.proofUrl} alt="Kanıt" className="mt-3 max-h-64 object-contain border ledger-line" />
          )}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t ledger-line">
              <p className="text-xs text-mute mb-3">Bu oyuncunun toplam <span className="text-danger font-semibold">{rejectedCount}</span> kez reddedilmiş başvurusu var.</p>
              <div className="flex gap-2 flex-wrap">
                {(["BEKLEMEDE", "INCELENIYOR", "KABUL_EDILDI", "REDDEDILDI"] as AppStatus[]).map((s) => (
                  <button key={s} onClick={() => changeStatus(s)} disabled={app.status === s} className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition disabled:opacity-40 ${STATUS_CLASS[s]} hover:bg-white/5`}>{STATUS_LABEL[s]}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border ledger-line bg-panel">
          <div className="px-5 py-3 border-b ledger-line">
            <p className="text-xs uppercase tracking-wider text-mute">Yetkili ile Sohbet</p>
          </div>
          <div className="px-5 py-4 max-h-[50vh] overflow-y-auto space-y-3">
            {app.messages.length === 0 ? (
              <p className="text-sm text-mute text-center py-6">{isAdmin ? "Oyuncuya yazarak başlayabilirsiniz." : "Yetkili size yazınca burada görünecek."}</p>
            ) : (
              app.messages.map((m) => {
                const mine = m.senderId === session.user.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 text-sm ${mine ? "bg-olive/30 border border-olivebright/40" : "bg-base border ledger-line"}`}>
                      {!mine && <p className="text-[10px] uppercase tracking-wider text-mute mb-1">{m.sender.username}</p>}
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="px-4 py-3 border-t ledger-line flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 bg-base border ledger-line px-3 py-2 text-sm focus:border-signal outline-none transition" />
            <button type="submit" disabled={sending || !draft.trim()} className="text-xs uppercase tracking-wider bg-signal hover:brightness-110 disabled:opacity-40 px-4 py-2 font-semibold transition">Gönder</button>
          </form>
        </div>
      </div>
    </main>
  );
      }
