"use client";

import Image from "next/image";
import {
  Check,
  ChevronRight,
  ClipboardList,
  Eye,
  Flame,
  Home,
  Lock,
  LogOut,
  Phone,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Shuffle,
  Trash2,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import type { Draw, DrawMode, PublicTeam, Team } from "@/lib/types";

type View = "home" | "register" | "teams" | "draw" | "admin";

type TeamForm = {
  name: string;
  captain: string;
  phone: string;
  slogan: string;
  players: string[];
};

const emptyForm: TeamForm = {
  name: "",
  captain: "",
  phone: "",
  slogan: "",
  players: ["", ""],
};

const navItems: Array<{ view: View; label: string; icon: ReactNode }> = [
  { view: "home", label: "Ana Sayfa", icon: <Home size={19} /> },
  { view: "register", label: "Kayıt", icon: <Plus size={19} /> },
  { view: "teams", label: "Takımlar", icon: <Users size={19} /> },
  { view: "draw", label: "Kura", icon: <Trophy size={19} /> },
  { view: "admin", label: "Yönetim", icon: <Lock size={19} /> },
];

export default function TournamentApp() {
  const [view, setView] = useState<View>("home");
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [adminTeams, setAdminTeams] = useState<Team[]>([]);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const approvedCount = teams.length;
  const pendingCount = adminTeams.filter((team) => team.status === "pending").length;

  const refreshPublic = async () => {
    const [teamsResponse, drawResponse] = await Promise.all([
      fetch("/api/teams", { cache: "no-store" }),
      fetch("/api/draw", { cache: "no-store" }),
    ]);

    const teamsJson = await teamsResponse.json();
    const drawJson = await drawResponse.json();

    if (!teamsResponse.ok) {
      throw new Error(teamsJson.error ?? "Takımlar alınamadı.");
    }

    if (!drawResponse.ok) {
      throw new Error(drawJson.error ?? "Kura alınamadı.");
    }

    setTeams(teamsJson.teams ?? []);
    setDraw(drawJson.draw ?? null);
  };

  const refreshAdmin = async () => {
    const response = await fetch("/api/admin/teams", { cache: "no-store" });

    if (response.status === 401) {
      setAdmin(false);
      setAdminTeams([]);
      return;
    }

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error ?? "Yönetim verisi alınamadı.");
    }

    setAdminTeams(json.teams ?? []);
  };

  const refreshAll = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
      const sessionJson = await sessionResponse.json();

      setAdmin(Boolean(sessionJson.admin));
      await refreshPublic();

      if (sessionJson.admin) {
        await refreshAdmin();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bir şey ters gitti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
    // Initial load only; refreshAll intentionally owns the first data sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdminChanged = async (isAdmin: boolean) => {
    setAdmin(isAdmin);

    if (isAdmin) {
      await refreshAdmin();
    } else {
      setAdminTeams([]);
    }
  };

  return (
    <div className="min-h-screen pb-28 text-club-ink">
      <Header
        admin={admin}
        pendingCount={pendingCount}
        onAdminClick={() => setView("admin")}
      />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 sm:px-6">
        {message && (
          <Notice tone="warning" onClose={() => setMessage(null)}>
            {message}
          </Notice>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {view === "home" && (
              <HomeView
                teams={teams}
                draw={draw}
                setView={setView}
              />
            )}
            {view === "register" && (
              <RegisterView
                onSubmitted={async () => {
                  setMessage("Başvurun alındı. Yönetici onaylayınca takım listesinde görünecek.");
                  await refreshPublic();
                  setView("teams");
                }}
              />
            )}
            {view === "teams" && (
              <TeamsView
                teams={teams}
                admin={admin}
                adminTeams={adminTeams}
                refreshAdmin={refreshAdmin}
                refreshPublic={refreshPublic}
                setView={setView}
              />
            )}
            {view === "draw" && (
              <DrawView
                admin={admin}
                approvedCount={approvedCount}
                draw={draw}
                refreshDraw={refreshPublic}
                setView={setView}
              />
            )}
            {view === "admin" && (
              <AdminView
                admin={admin}
                pendingCount={pendingCount}
                onAdminChanged={handleAdminChanged}
                refreshAll={refreshAll}
              />
            )}
          </>
        )}
      </main>

      <BottomNav active={view} setView={setView} admin={admin} />
    </div>
  );
}

function Header({
  admin,
  pendingCount,
  onAdminClick,
}: {
  admin: boolean;
  pendingCount: number;
  onAdminClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-club-line bg-club-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-club-line bg-white p-1">
            <Image
              src="/bogazkoy-logo.png"
              alt="Boğazköy Spor Kulübü logosu"
              width={72}
              height={82}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-[20px] text-club-dark">
              BOĞAZKÖY SPOR KULÜBÜ
            </div>
            <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-club-muted">
              Bahar Şenliği Voleybol
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdminClick}
          className="relative inline-flex h-10 items-center gap-1.5 rounded-md border border-club-line bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-club-muted"
          title="Yönetici paneli"
        >
          {admin ? <ShieldCheck size={15} className="text-club-red" /> : <Lock size={14} />}
          <span className="hidden sm:inline">{admin ? "Yönetici" : "Giriş"}</span>
          {pendingCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-club-red px-1 text-[10px] text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function HomeView({
  teams,
  draw,
  setView,
}: {
  teams: PublicTeam[];
  draw: Draw | null;
  setView: (view: View) => void;
}) {
  return (
    <div className="rise space-y-4">
      <section className="overflow-hidden rounded-lg bg-club-red text-white shadow-poster">
        <div className="chevron-band h-2" />
        <div className="poster-stripes relative px-5 py-6 sm:px-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1.5">
                <Image
                  src="/bogazkoy-logo.png"
                  alt="Boğazköy Spor Kulübü logosu"
                  width={128}
                  height={146}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                  Kuruluş 2017
                </div>
                <div className="font-display text-2xl leading-none">
                  VOLEYBOL TURNUVASI
                </div>
              </div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
              <Flame size={12} />
              Kayıt Açık
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-1 font-display text-[17px] tracking-[0.18em] opacity-85">
              3. GELENEKSEL
            </p>
            <h1 className="font-display text-[48px] leading-[0.95] sm:text-[68px]">
              BOĞAZKÖY<br />BAHAR ŞENLİĞİ
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/90">
              Takımını oluştur, başvurunu gönder, onaylanan ekipleri gör. Kura çekildiğinde
              gruplar veya eleme ağacı herkesin ekranına düşer.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("register")}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-club-dark"
            >
              Takım Kaydı
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("draw")}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/35 px-5 text-sm font-bold uppercase tracking-[0.12em] text-white"
            >
              Kuraya Bak
              <Trophy size={16} />
            </button>
          </div>
        </div>
        <div className="chevron-band h-2" />
      </section>

      <div className="grid grid-cols-3 gap-2">
        <Stat value={teams.length} label="Onaylı Takım" />
        <Stat value={draw ? "Hazır" : "Bekliyor"} label="Kura" />
        <Stat value="2026" label="Şenlik" strong />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <QuickAction
          title="Takımları Gör"
          text="Onaylanan takımlar ve oyuncu listeleri."
          icon={<Users size={22} />}
          onClick={() => setView("teams")}
        />
        <QuickAction
          title="Kura & Fikstür"
          text="Son çekilen grup veya eleme eşleşmeleri."
          icon={<ClipboardList size={22} />}
          onClick={() => setView("draw")}
        />
      </div>

      <RulesSection />
    </div>
  );
}

function RulesSection() {
  const rules = [
    "Her takım minimum 2 adet kadın oyuncu bulundurmak zorundadır.",
    "Oyunlar 3 set olacaktır. 25 sayı setler, uzatma seti 15 sayı olacaktır.",
    "Sahada 6 as oyuncu olacaktır.",
    "Takımların topu karşı sahaya göndermeden önce en fazla 3 kez topa dokunma hakkı vardır. Blok teması buna dahil değildir.",
    "Aynı oyuncu topa üst üste iki kez vuramaz. Top tutulamaz veya taşınamaz, sadece vurulmalıdır.",
    "Servis hakkı kazanan takımda oyuncular saat yönünde bir pozisyon döner.",
    "Oyun sırasında fileye temas etmek yasaktır.",
  ];

  return (
    <section className="rounded-lg border border-club-line bg-white p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-club-soft text-club-red">
          <ClipboardList size={21} />
        </span>
        <div>
          <h2 className="font-display text-[26px] leading-none text-club-dark">
            Turnuva Kuralları
          </h2>
          <p className="mt-1 text-xs text-club-muted">
            Maçlar başlamadan önce tüm takımlar için geçerlidir.
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {rules.map((rule, index) => (
          <li key={rule} className="flex gap-3 rounded-md bg-club-cream px-3 py-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-club-red font-display text-base leading-none text-white">
              {index + 1}
            </span>
            <span className="text-sm leading-5 text-club-ink">{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RegisterView({ onSubmitted }: { onSubmitted: () => Promise<void> }) {
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedPlayers = form.players.filter((player) => player.trim()).length;
  const canSubmit = form.name.trim() && form.captain.trim() && form.phone.trim() && completedPlayers >= 2;

  const updatePlayer = (index: number, value: string) => {
    const players = [...form.players];
    players[index] = value;
    setForm({ ...form, players });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Başvuru kaydedilemedi.");
      }

      setForm(emptyForm);
      await onSubmitted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Başvuru kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rise space-y-4">
      <SectionHeader
        title="Takım Kaydı"
        subtitle="Başvuru yönetici onayına düşer; onaydan sonra herkes takımını görebilir."
      />

      {error && <Notice tone="warning">{error}</Notice>}

      <Field label="Takım Adı">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="h-12 w-full rounded-md border border-club-line bg-white px-4 text-[15px]"
          placeholder="Örn. Çınar Gençleri"
          maxLength={100}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kaptan Ad Soyad">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-club-muted" size={16} />
            <input
              value={form.captain}
              onChange={(event) => setForm({ ...form, captain: event.target.value })}
              className="h-12 w-full rounded-md border border-club-line bg-white pl-10 pr-4 text-[15px]"
              placeholder="Ad soyad"
              maxLength={100}
            />
          </div>
        </Field>
        <Field label="Kaptan Telefon">
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-club-muted" size={16} />
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="h-12 w-full rounded-md border border-club-line bg-white pl-10 pr-4 text-[15px]"
              placeholder="05XX XXX XX XX"
              maxLength={40}
            />
          </div>
        </Field>
      </div>

      <Field label="Slogan veya Not">
        <textarea
          value={form.slogan}
          onChange={(event) => setForm({ ...form, slogan: event.target.value })}
          className="min-h-24 w-full resize-none rounded-md border border-club-line bg-white px-4 py-3 text-[15px]"
          placeholder="Opsiyonel"
          maxLength={180}
        />
      </Field>

      <Field label={`Oyuncu Listesi · ${completedPlayers} kişi`}>
        <div className="space-y-2">
          {form.players.map((player, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-club-red font-display text-lg text-white">
                {index + 1}
              </span>
              <input
                value={player}
                onChange={(event) => updatePlayer(index, event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-md border border-club-line bg-white px-3 text-[14px]"
                placeholder="Oyuncu adı"
                maxLength={80}
              />
              {form.players.length > 2 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, players: form.players.filter((_, i) => i !== index) })}
                  className="grid h-10 w-10 place-items-center rounded-md border border-club-line text-club-red"
                  title="Oyuncuyu sil"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setForm({ ...form, players: [...form.players, ""] })}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-club-line bg-white text-xs font-bold uppercase tracking-[0.12em] text-club-red"
          >
            <Plus size={15} />
            Oyuncu Ekle
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="flex h-12 w-full items-center justify-center rounded-md bg-club-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_2px_0_#7a1a1c] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
      </button>
    </form>
  );
}

function TeamsView({
  teams,
  admin,
  adminTeams,
  refreshAdmin,
  refreshPublic,
  setView,
}: {
  teams: PublicTeam[];
  admin: boolean;
  adminTeams: Team[];
  refreshAdmin: () => Promise<void>;
  refreshPublic: () => Promise<void>;
  setView: (view: View) => void;
}) {
  const visibleTeams = admin ? adminTeams : teams;

  const updateStatus = async (id: string, status: Team["status"]) => {
    const response = await fetch(`/api/admin/teams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return;
    }

    await Promise.all([refreshAdmin(), refreshPublic()]);
  };

  const deleteTeam = async (id: string) => {
    const response = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });

    if (!response.ok) {
      return;
    }

    await Promise.all([refreshAdmin(), refreshPublic()]);
  };

  return (
    <div className="rise space-y-4">
      <SectionHeader
        title="Kayıtlı Takımlar"
        subtitle={
          admin
            ? `${adminTeams.length} başvuru görüntüleniyor. Telefon bilgisi sadece yöneticiye açık.`
            : `${teams.length} onaylı takım listeleniyor.`
        }
      />

      {visibleTeams.length === 0 ? (
        <EmptyState
          title="Henüz takım yok"
          text="İlk başvuruyu almak için kayıt ekranını aç."
          action="Takım Kaydı"
          onAction={() => setView("register")}
        />
      ) : (
        <div className="space-y-3">
          {visibleTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              admin={admin}
              onApprove={() => updateStatus(team.id, "approved")}
              onReject={() => updateStatus(team.id, "rejected")}
              onDelete={() => deleteTeam(team.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DrawView({
  admin,
  approvedCount,
  draw,
  refreshDraw,
  setView,
}: {
  admin: boolean;
  approvedCount: number;
  draw: Draw | null;
  refreshDraw: () => Promise<void>;
  setView: (view: View) => void;
}) {
  const [mode, setMode] = useState<DrawMode>("groups");
  const [groupCount, setGroupCount] = useState(2);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawLabel = draw?.type === "groups" ? "Grup Kurası" : draw?.type === "knockout" ? "Eleme Ağacı" : "Kura";

  const runDraw = async () => {
    setDrawing(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, groupCount }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Kura çekilemedi.");
      }

      await refreshDraw();
    } catch (drawError) {
      setError(drawError instanceof Error ? drawError.message : "Kura çekilemedi.");
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="rise space-y-4">
      <SectionHeader
        title="Kura & Fikstür"
        subtitle={draw ? `${drawLabel} sonucu herkes tarafından görülebilir.` : "Kura çekilince sonuç burada yayınlanır."}
      />

      {error && <Notice tone="warning">{error}</Notice>}

      {admin ? (
        <section className="rounded-lg border border-club-red/25 bg-club-soft p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-club-red">
                Yönetici Kurası
              </div>
              <div className="text-sm text-club-muted">
                {approvedCount} onaylı takım kura havuzunda.
              </div>
            </div>
            <Shuffle className="shrink-0 text-club-red" size={24} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ModeButton active={mode === "groups"} onClick={() => setMode("groups")}>
              Gruplar
            </ModeButton>
            <ModeButton active={mode === "knockout"} onClick={() => setMode("knockout")}>
              Eleme
            </ModeButton>
          </div>

          {mode === "groups" && (
            <div className="mt-3">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-club-dark">
                Grup Sayısı
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setGroupCount(count)}
                    className={`h-10 rounded-md border font-display text-xl ${
                      groupCount === count
                        ? "border-club-red bg-club-red text-white"
                        : "border-club-line bg-white text-club-muted"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={runDraw}
            disabled={drawing || approvedCount < 2}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-club-red text-sm font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RefreshCcw size={16} />
            {drawing ? "Çekiliyor..." : draw ? "Tekrar Kura Çek" : "Kurayı Çek"}
          </button>
        </section>
      ) : (
        !draw && (
          <EmptyState
            title="Kura henüz çekilmedi"
            text="Yönetici kura çektiğinde gruplar veya eleme ağacı burada görünecek."
            action="Takımları Gör"
            onAction={() => setView("teams")}
          />
        )
      )}

      {draw?.result.type === "groups" && <Groups groups={draw.result.groups} />}
      {draw?.result.type === "knockout" && <Bracket bracket={draw.result.bracket} />}
    </div>
  );
}

function AdminView({
  admin,
  pendingCount,
  onAdminChanged,
  refreshAll,
}: {
  admin: boolean;
  pendingCount: number;
  onAdminChanged: (admin: boolean) => Promise<void>;
  refreshAll: () => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Giriş yapılamadı.");
      }

      setPassword("");
      await onAdminChanged(true);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    await onAdminChanged(false);
    setBusy(false);
  };

  return (
    <div className="rise space-y-4">
      <SectionHeader
        title="Yönetim"
        subtitle="Takım onayları, telefon bilgileri ve kura yetkisi bu ekranda."
      />

      {admin ? (
        <section className="rounded-lg border border-club-line bg-white p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-club-soft text-club-red">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="font-display text-2xl leading-none text-club-dark">YÖNETİCİ AÇIK</div>
              <div className="text-sm text-club-muted">
                {pendingCount > 0 ? `${pendingCount} takım onay bekliyor.` : "Bekleyen başvuru yok."}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={refreshAll}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-club-line text-sm font-bold text-club-dark"
            >
              <RefreshCcw size={16} />
              Yenile
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={busy}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-club-red text-sm font-bold text-white disabled:opacity-50"
            >
              <LogOut size={16} />
              Çıkış
            </button>
          </div>
        </section>
      ) : (
        <form onSubmit={login} className="rounded-lg border border-club-line bg-white p-4">
          {error && <Notice tone="warning">{error}</Notice>}
          <Field label="Yönetici Şifresi">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-md border border-club-line bg-white px-4 text-[15px]"
              placeholder="ADMIN_PASSWORD"
            />
          </Field>
          <button
            type="submit"
            disabled={!password || busy}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-club-red text-sm font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          >
            <Lock size={16} />
            {busy ? "Kontrol Ediliyor..." : "Yönetici Girişi"}
          </button>
        </form>
      )}
    </div>
  );
}

function TeamCard({
  team,
  admin,
  onApprove,
  onReject,
  onDelete,
}: {
  team: PublicTeam | Team;
  admin: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const phone = "phone" in team ? team.phone : undefined;
  const status = "status" in team ? team.status : "approved";

  const statusStyle = useMemo(() => {
    if (status === "approved") return "bg-club-green text-white";
    if (status === "rejected") return "bg-club-ink text-white";
    return "bg-club-soft text-club-red";
  }, [status]);

  return (
    <section className="overflow-hidden rounded-lg border border-club-line bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-club-red font-display text-2xl text-white">
          {team.name.slice(0, 1).toLocaleUpperCase("tr-TR")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[22px] leading-none text-club-dark">
            {team.name.toLocaleUpperCase("tr-TR")}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-club-muted">
            <User size={12} />
            {team.captain}
            <span>·</span>
            {team.players.length} oyuncu
          </span>
        </span>
        {admin && (
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyle}`}>
            {status === "approved" ? "Onaylı" : status === "rejected" ? "Red" : "Bekliyor"}
          </span>
        )}
        <ChevronRight
          size={18}
          className={`shrink-0 text-club-muted transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-dashed border-club-line px-4 pb-4 pt-3">
          {team.slogan && (
            <div className="rounded-md border-l-4 border-club-red bg-club-cream p-3 text-sm italic text-club-dark">
              &ldquo;{team.slogan}&rdquo;
            </div>
          )}
          {admin && phone && (
            <div className="flex items-center gap-2 text-sm text-club-muted">
              <Phone size={14} />
              {phone}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {team.players.map((player, index) => (
              <span
                key={`${player}-${index}`}
                className="rounded-full bg-club-soft px-3 py-1 text-xs font-semibold text-club-dark"
              >
                {player}
              </span>
            ))}
          </div>
          {admin && (
            <div className="grid grid-cols-3 gap-2">
              <IconAction label="Onayla" icon={<Check size={15} />} onClick={onApprove} />
              <IconAction label="Reddet" icon={<X size={15} />} onClick={onReject} />
              <IconAction label="Sil" icon={<Trash2 size={15} />} onClick={onDelete} danger />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Groups({ groups }: { groups: Array<{ name: string; teams: PublicTeam[] }> }) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <section key={group.name} className="pop overflow-hidden rounded-lg border border-club-line bg-white">
          <div className="flex items-center gap-3 bg-club-dark p-4 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-white font-display text-2xl text-club-dark">
              {group.name}
            </span>
            <div>
              <div className="font-display text-2xl leading-none">GRUP {group.name}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                {group.teams.length} takım
              </div>
            </div>
          </div>
          <div className="space-y-2 p-3">
            {group.teams.map((team, index) => (
              <div key={team.id} className="flex items-center gap-3 rounded-md bg-club-cream px-3 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-club-red font-display text-lg text-white">
                  {index + 1}
                </span>
                <span className="font-semibold text-club-dark">{team.name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Bracket({
  bracket,
}: {
  bracket: Array<{ team1: PublicTeam | null; team2: PublicTeam | null }>;
}) {
  return (
    <div className="space-y-3">
      {bracket.map((match, index) => (
        <section key={index} className="pop rounded-lg border border-club-line bg-white p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-club-muted">
            Maç {index + 1}
          </div>
          <MatchSide team={match.team1} />
          <div className="my-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-club-line" />
            <span className="font-display text-lg text-club-red">VS</span>
            <span className="h-px flex-1 bg-club-line" />
          </div>
          <MatchSide team={match.team2} />
        </section>
      ))}
    </div>
  );
}

function MatchSide({ team }: { team: PublicTeam | null }) {
  if (!team) {
    return (
      <div className="rounded-md bg-club-cream px-3 py-2.5 text-sm italic text-club-muted">
        BAY · rakipsiz tura çıkar
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-club-soft px-3 py-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-club-red font-display text-lg text-white">
        {team.name.slice(0, 1).toLocaleUpperCase("tr-TR")}
      </span>
      <span className="font-display text-xl leading-none text-club-dark">
        {team.name.toLocaleUpperCase("tr-TR")}
      </span>
    </div>
  );
}

function BottomNav({
  active,
  setView,
  admin,
}: {
  active: View;
  setView: (view: View) => void;
  admin: boolean;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-club-line bg-club-paper/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 px-1 py-2">
        {navItems.map((item) => {
          const isActive = active === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-md px-1 py-1 ${
                isActive ? "text-club-red" : "text-club-muted"
              }`}
              title={item.label}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-md ${isActive ? "bg-club-soft" : ""}`}>
                {item.view === "admin" && admin ? <ShieldCheck size={19} /> : item.icon}
              </span>
              <span className="w-full truncate text-[9px] font-bold uppercase tracking-[0.08em] sm:text-[10px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Stat({ value, label, strong }: { value: string | number; label: string; strong?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${strong ? "border-club-red bg-club-red text-white" : "border-club-line bg-white"}`}>
      <div className={`font-display text-2xl leading-none sm:text-3xl ${strong ? "text-white" : "text-club-dark"}`}>
        {value}
      </div>
      <div className={`mt-1 text-[9px] font-bold uppercase tracking-[0.14em] ${strong ? "text-white/85" : "text-club-muted"}`}>
        {label}
      </div>
    </div>
  );
}

function QuickAction({
  title,
  text,
  icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-club-line bg-white p-4 text-left"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-club-soft text-club-red">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[22px] leading-none text-club-dark">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-club-muted">{text}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-club-muted" />
    </button>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="h-8 w-1 rounded-full bg-club-red" />
        <h2 className="font-display text-[36px] leading-none text-club-dark">{title}</h2>
      </div>
      {subtitle && <p className="mt-2 pl-3 text-sm leading-5 text-club-muted">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-club-dark">
        {label}
      </span>
      {children}
    </label>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-md border font-display text-xl ${
        active ? "border-club-dark bg-club-dark text-white" : "border-club-line bg-white text-club-muted"
      }`}
    >
      {children}
    </button>
  );
}

function IconAction({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-1 rounded-md border text-xs font-bold ${
        danger
          ? "border-club-red/40 text-club-red"
          : "border-club-line text-club-dark"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-lg border border-dashed border-club-line bg-club-cream p-7 text-center">
      <Eye className="mx-auto mb-3 text-club-red" size={24} />
      <h3 className="font-display text-2xl text-club-dark">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-club-muted">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-club-red px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
      >
        {action}
      </button>
    </section>
  );
}

function Notice({
  children,
  tone,
  onClose,
}: {
  children: ReactNode;
  tone: "warning" | "ok";
  onClose?: () => void;
}) {
  return (
    <div
      className={`mb-4 flex items-start gap-2 rounded-md border p-3 text-sm ${
        tone === "ok"
          ? "border-club-green/30 bg-green-50 text-club-green"
          : "border-club-red/25 bg-club-soft text-club-dark"
      }`}
    >
      {tone === "ok" ? <Check size={16} className="mt-0.5 shrink-0" /> : <Flame size={16} className="mt-0.5 shrink-0 text-club-red" />}
      <span className="min-w-0 flex-1">{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 text-club-muted" title="Kapat">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[45vh] place-items-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-club-line border-t-club-red" />
        <div className="font-display text-2xl text-club-dark">YÜKLENİYOR</div>
      </div>
    </div>
  );
}
