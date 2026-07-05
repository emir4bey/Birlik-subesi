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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/applications/mine")
        .then((r) => r.json())
        .then((d) => setMyApps(d.applications || []));
    }
  }, [status]);

  function openMenu() {
    setMenuOpen(true);
    setMenuClosing(false);
  }

  function closeMenu() {
    setMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 280);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <header
        className="border-b ledger-line sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(11,15,13,0.85)" }}
      >
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal animate-blink inline-block" />
            <span className="font-display text-sm tracking-[0.25em] text-mute uppercase">
              Birlik Subesi
            </span>
          </div>
          <button
            onClick={menuOpen ? closeMenu : openMenu}
            className="w-9 h-9 border ledger-line flex flex-col items-center justify-center gap-1 p-2 transition-all hover:border-signal"
          >
            <span
              className="block w-4 h-px bg-ink transition-all duration-300"
              style={menuOpen ? { transform: "rotate(45deg) translate(2px,2px)" } : {}}
            />
            <span
              className="block w-4 h-px bg-ink transition-all duration-300"
              style={menuOpen ? { opacity: 0 } : {}}
            />
            <span
              className="block w-4 h-px bg-ink transition-all duration-300"
              style={menuOpen ? { transform: "rotate(-45deg) translate(2px,-2px)" } : {}}
            />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={closeMenu}
        />
      )}

      {menuOpen && (
        <div
          className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col border-l ledger-line ${
            menuClosing ? "menu-close-anim" : "menu-open"
          }`}
          style={{
            width: "min(300px,100vw)",
            background: "#12160F",
            padding: "80px 28px 28px",
          }}
        >
          <button
            onClick={closeMenu}
            className="absolute top-5 right-5 w-9 h-9 border ledger-line flex items-center justify-center text-mute hover:border-danger hover:text-danger transition-all text-lg"
          >
            X
          </button>

          <p className="text-[10px] tracking-[0.3em] uppercase text-mute mb-3">
            Navigasyon
          </p>

          <Link href="/" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-display uppercase tracking-wider transition-all hover:border-line hover:bg-olive/5">
            Ana Sayfa
          </Link>
          <Link href="/basvuru/transfer" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-display uppercase tracking-wider transition-all hover:border-line hover:bg-olive/5">
            Transfer Basvurusu
          </Link>
          <Link href="/basvuru/ban-affi" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-display uppercase tracking-wider transition-all hover:border-line hover:bg-olive/5">
            Ban Affi Basvurusu
          </Link>

          {session?.user.isAdmin && (
            <>
              <div className="my-3 h-px bg-line" />
              <Link href="/panel" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-display uppercase tracking-wider transition-all hover:border-line hover:bg-olive/5">
                Yetkili Paneli
              </Link>
            </>
          )}

          <div className="mt-auto">
            {status === "authenticated" ? (
              <div>
                <div className="flex items-center gap-3 mb-4 px-2">
                  {session?.user.avatar && (
                    <img src={session.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{session?.user.username}</p>
                    <p className="text-xs text-mute">Discord ile giris yapildi</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full border ledger-line text-mute text-xs uppercase tracking-wider py-3 hover:border-danger hover:text-danger transition-all font-display"
                >
                  Cikis Yap
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-display uppercase tracking-wider font-semibold transition-all"
                style={{ background: "#5865F2", color: "white" }}
              >
                Discord ile Giris Yap
              </button>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-5xl px-5 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-5 animate-fade-up delay-1">
          <div className="w-8 h-px bg-signal" />
          <p className="font-display text-signal text-xs tracking-[0.35em] uppercase">
            Sevk ve Disiplin Subesi
          </p>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.0] mb-6">
          <span className="block animate-fade-up delay-2">Transfer ve Ban Affi</span>
          <span
            className="block animate-fade-up delay-3"
            style={{ color: "#7C8F5A", textShadow: "0 0 30px rgba(124,143,90,0.3)" }}
          >
            basvurulariniz tek dosyada.
          </span>
        </h1>

        <p className="text-mute max-w-xl text-base leading-relaxed mb-10 animate-fade-up delay-4">
          Discord hesabinizla giris yapin, kimliginiz otomatik dogrulansin.
        </p>

        {status !== "authenticated" ? (
          <button
            onClick={() => signIn("discord")}
            className="btn-glow animate-glow animate-fade-up delay-5 font-display uppercase tracking-wider font-semibold px-8 py-4 text-base border-none"
            style={{ background: "#D98E2B", color: "#0B0F0D" }}
          >
            Discord ile Giris Yap
          </button>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mb-12">
              <Link
                href="/basvuru/transfer"
                className="card-hover group border ledger-line bg-panel px-5 py-6 animate-fade-up delay-5"
              >
                <span className="block text-[10px] tracking-[0.25em] text-mute uppercase mb-2">
                  Dosya 01
                </span>
                <span className="font-display text-2xl font-semibold block mb-2">
                  Transfer Basvurusu
                </span>
                <span className="text-sm text-mute group-hover:text-ink transition-colors">
                  Birlik gecisi talep et
                </span>
              </Link>
              <Link
                href="/basvuru/ban-affi"
                className="card-hover group border ledger-line bg-panel px-5 py-6 animate-fade-up delay-6"
              >
                <span className="block text-[10px] tracking-[0.25em] text-mute uppercase mb-2">
                  Dosya 02
                </span>
                <span className="font-display text-2xl font-semibold block mb-2">
                  Ban Affi Basvurusu
                </span>
                <span className="text-sm text-mute group-hover:text-ink transition-colors">
                  Cezanin gozden gecirilmesini iste
                </span>
              </Link>
            </div>

            {myApps.length > 0 && (
              <div className="max-w-xl animate-fade-up delay-6">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mute">
                    Basvurularim
                  </p>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="space-y-2">
                  {myApps.map((a) => (
                    <Link
                      key={a.id}
                      href={`/basvuru/${a.id}`}
                      className="flex items-center justify-between border ledger-line bg-panel px-4 py-3 hover:border-olivebright hover:translate-x-1 transition-all duration-200"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {a.type === "TRANSFER" ? "Transfer" : "Ban Affi"}
                        </span>
                        <span className="text-xs text-mute ml-2">
                          {new Date(a.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${STATUS_CLASS[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
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
