"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BanAffiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/apply/ban-affi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, proofUrl }),
    });
    setLoading(false);
    if (res.ok) { const data = await res.json(); router.push(`/basvuru/${data.application.id}`); }
    else { const data = await res.json(); setError(data.error || "Bir hata oluştu."); }
  }

  if (status === "loading") return null;
  if (status !== "authenticated") return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-mute mb-4">Başvuru için Discord ile giriş yapmalısınız.</p>
        <button onClick={() => signIn("discord")} className="bg-olive hover:bg-olivebright text-base px-5 py-2.5 font-medium transition">Discord ile Giriş Yap</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-xs text-mute hover:text-ink transition">← Ana sayfa</Link>
        <p className="font-display text-signal text-xs tracking-[0.3em] uppercase mt-6 mb-2">Dosya 02</p>
        <h1 className="font-display text-3xl font-semibold mb-8">Ban Affı Başvurusu</h1>
        <div className="flex items-center gap-3 mb-8 border ledger-line bg-panel px-4 py-3">
          {session?.user.avatar && <img src={session.user.avatar} alt="" className="w-9 h-9 rounded-full" />}
          <div>
            <p className="text-sm font-medium">{session?.user.username}</p>
            <p className="text-xs text-mute">Discord hesabınızla doğrulandı</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-mute mb-2">Affedilme sebebiniz</label>
            <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={5} placeholder="Neden ban affedilmelisiniz, neyi düzelttiniz?" className="w-full bg-panel border ledger-line px-4 py-3 text-sm focus:border-signal outline-none transition" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-mute mb-2">Kanıt / referans linki</label>
            <input required type="url" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://" className="w-full bg-panel border ledger-line px-4 py-3 text-sm focus:border-signal outline-none transition" />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-signal hover:brightness-110 disabled:opacity-50 text-base font-display uppercase tracking-wider font-semibold px-5 py-3 transition">
            {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}
