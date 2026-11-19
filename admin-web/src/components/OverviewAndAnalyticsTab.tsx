import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FileCheck,
  Globe,
  HelpCircle,
  Layers,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import { supabase, isUsingServiceRole } from "../supabase";
import { STATES } from "../../../src/us/states";
import { assembleExam, validateRelease } from "../../../src/us/engine";
import type { CandidateProfile } from "../../../src/us/model";
import { ADMIN_TOPICS, PROFILE_LABELS, STATE_HANDBOOKS } from "../presets";

interface OverviewProps {
  publishedReleases: any[];
  selectedState: string;
  selectedProfile: CandidateProfile;
  onSelectScope: (state: string, profile: CandidateProfile) => void;
  onLoadReleaseToDraft: (releaseRow: any) => void;
  onRefreshReleases: () => void;
  triggerStatus: (type: "success" | "error", text: string) => void;
}

export const OverviewAndAnalyticsTab: React.FC<OverviewProps> = ({
  publishedReleases,
  selectedState,
  selectedProfile,
  onSelectScope,
  onLoadReleaseToDraft,
  onRefreshReleases,
  triggerStatus,
}) => {
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [profilesList, setProfilesList] = useState<any[]>([]);
  const [attemptsList, setAttemptsList] = useState<any[]>([]);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(30);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const sinceIso = new Date(Date.now() - daysFilter * 86400 * 1000).toISOString();
      const [profilesRes, attemptsRes] = await Promise.all([
        supabase.from("us_profiles").select("*").limit(500),
        supabase
          .from("us_attempts")
          .select("*")
          .gte("completed_at", sinceIso)
          .order("completed_at", { ascending: false })
          .limit(1000),
      ]);

      if (profilesRes.error && !profilesRes.error.message.includes("policy")) {
        console.warn("us_profiles warning:", profilesRes.error.message);
      }
      if (attemptsRes.error && !attemptsRes.error.message.includes("policy")) {
        console.warn("us_attempts warning:", attemptsRes.error.message);
      }

      setProfilesList(profilesRes.data || []);
      setAttemptsList(attemptsRes.data || []);
    } catch (err: any) {
      setAnalyticsError(err.message || "Analitik verileri okunamadı");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [daysFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Latest published release per state+profile
  const latestReleaseMap = new Map<string, any>();
  for (const row of publishedReleases) {
    if (row.status !== "published") continue;
    const key = `${row.state}:${row.profile}`;
    if (!latestReleaseMap.has(key)) {
      latestReleaseMap.set(key, row);
    }
  }

  const checkReleaseStatus = (row: any | undefined) => {
    if (!row) {
      return {
        status: "empty" as const,
        questionsCount: 0,
        lessonsCount: 0,
        hasRule: false,
        examValid: false,
        version: null,
      };
    }
    const questionsCount = Array.isArray(row.payload?.questions)
      ? row.payload.questions.length
      : 0;
    const lessonsCount = Array.isArray(row.payload?.lessons)
      ? row.payload.lessons.length
      : 0;
    const hasRule = !!row.payload?.rule;
    let examValid = false;
    try {
      const validated = validateRelease(
        {
          ...row.payload,
          id: row.id,
          version: row.version,
          state: row.state,
          profile: row.profile,
          vehicle: row.vehicle,
          language: row.language,
          publishedAt: row.published_at,
        },
        row.state,
        row.profile
      );
      if (validated.rule) {
        assembleExam(validated.questions, validated.rule);
        examValid = true;
      }
    } catch {
      examValid = false;
    }

    return {
      status:
        questionsCount > 0 && lessonsCount > 0 && examValid
          ? ("ready" as const)
          : questionsCount > 0
          ? ("practice-only" as const)
          : ("empty" as const),
      questionsCount,
      lessonsCount,
      hasRule,
      examValid,
      version: row.version,
      row,
    };
  };

  // Global stats across active releases
  const activeReleases = Array.from(latestReleaseMap.values());
  const totalPublishedQuestions = activeReleases.reduce(
    (sum, r) => sum + (r.payload?.questions?.length || 0),
    0
  );
  const totalPublishedLessons = activeReleases.reduce(
    (sum, r) => sum + (r.payload?.lessons?.length || 0),
    0
  );
  const readyStatesCount = STATES.filter(
    (st) => checkReleaseStatus(latestReleaseMap.get(`${st.code}:general-first`)).questionsCount > 0
  ).length;

  // Attempt analytics
  const totalSessions = attemptsList.length;
  const totalAnswered = attemptsList.reduce((acc, a) => acc + (a.answered || 0), 0);
  const totalCorrect = attemptsList.reduce((acc, a) => acc + (a.correct || 0), 0);
  const avgAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const stateStats = STATES.map((st) => {
    const stAttempts = attemptsList.filter((a) => a.state === st.code);
    const stCorrect = stAttempts.reduce((acc, a) => acc + (a.correct || 0), 0);
    const stTotal = stAttempts.reduce((acc, a) => acc + (a.total || 0), 0);
    return {
      code: st.code,
      name: st.name,
      phase: st.phase,
      sessions: stAttempts.length,
      accuracy: stTotal > 0 ? Math.round((stCorrect / stTotal) * 100) : 0,
    };
  });

  const modeCounts = ["practice", "exam", "daily", "mistakes", "favorites"].map((m) => {
    const count = attemptsList.filter((a) => a.mode === m).length;
    return {
      mode: m,
      count,
      share: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Üst KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe size={20} />
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              8 Hedef Eyalet
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Açık Eyalet (General-First)</p>
          <p className="text-2xl font-bold text-white mt-1">
            {readyStatesCount} / {STATES.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeReleases.length} aktif paket ({publishedReleases.length} toplam sürüm)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen size={20} />
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Canlı Havuz
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Yayındaki Soru & Ders</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalPublishedQuestions} Soru · {totalPublishedLessons} Ders
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {ADMIN_TOPICS.length} standart DMV konu başlığı
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity size={20} />
            </span>
            <div className="flex items-center gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysFilter(d as 7 | 30 | 90)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition ${
                    daysFilter === d
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {d}G
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Çözülen Oturum ({daysFilter} Gün)</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalSessions} Oturum
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalAnswered} cevaplanan soru · Ort. Başarı: %{avgAccuracy}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users size={20} />
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                isUsingServiceRole
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-amber-950 text-amber-300 border-amber-800"
              }`}
            >
              {isUsingServiceRole ? "Service Role Aktif" : "Anon Key Modu"}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Senkronize Profiller</p>
          <p className="text-2xl font-bold text-white mt-1">{profilesList.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Sıralamaya açık (Opt-in): {profilesList.filter((p) => p.show_ranking).length} kullanıcı
          </p>
        </div>
      </div>

      {/* 8 Eyalet Hazırlık ve Kapsam Matrisi */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={19} className="text-blue-400" />
              8 Hedef Eyalet Yayın & Hazırlık Matrisi (Canlı Supabase Durumu)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mobil uygulamada bir eyaletin açılması için <strong>Ortak Çalışma (general-first)</strong> paketinde soru yayınlanmış olmalıdır. Tam hazırlık için sorular + dersler + doğrulanmış sınav kuralı gerekir.
            </p>
          </div>
          <button
            onClick={() => {
              onRefreshReleases();
              loadAnalytics();
              triggerStatus("success", "Eyalet matrisi ve canlı veriler yenilendi.");
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw size={14} className={analyticsLoading ? "animate-spin" : ""} />
            Durumu Yenile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATES.map((st) => {
            const hb = STATE_HANDBOOKS[st.code];
            const genStatus = checkReleaseStatus(latestReleaseMap.get(`${st.code}:general-first`));
            const adultStatus = checkReleaseStatus(latestReleaseMap.get(`${st.code}:adult-first`));
            const teenStatus = checkReleaseStatus(latestReleaseMap.get(`${st.code}:teen-first`));
            const isSelected = selectedState === st.code;

            return (
              <div
                key={st.code}
                className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-950/25 border-blue-500/70 shadow-lg shadow-blue-950/30"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center border ${
                          st.phase === 1
                            ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {st.code}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {st.name}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              st.phase === 1
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            Faz {st.phase}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">{hb?.agency}</p>
                      </div>
                    </div>

                    {genStatus.status === "ready" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/70 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Tam Hazır
                      </span>
                    ) : genStatus.status === "practice-only" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/70 font-semibold">
                        Pratik Açık
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                        Hazırlanıyor
                      </span>
                    )}
                  </div>

                  {/* 3 Profil Satırı */}
                  <div className="space-y-1.5 mb-3">
                    {(
                      [
                        { profile: "general-first" as CandidateProfile, label: "Ortak (General)", data: genStatus },
                        { profile: "adult-first" as CandidateProfile, label: "Adult (18+)", data: adultStatus },
                        { profile: "teen-first" as CandidateProfile, label: "Teen (<18)", data: teenStatus },
                      ] as const
                    ).map((item) => (
                      <div
                        key={item.profile}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center justify-between ${
                          selectedState === st.code && selectedProfile === item.profile
                            ? "bg-blue-950/60 border-blue-600/60 text-white"
                            : "bg-slate-900/70 border-slate-800/80 text-slate-300"
                        }`}
                      >
                        <button
                          onClick={() => onSelectScope(st.code, item.profile)}
                          className="font-medium hover:text-blue-300 text-left flex-1"
                        >
                          {item.label}
                        </button>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={item.data.questionsCount > 0 ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                            {item.data.questionsCount}S
                          </span>
                          <span className={item.data.lessonsCount > 0 ? "text-blue-400 font-semibold" : "text-slate-500"}>
                            {item.data.lessonsCount}D
                          </span>
                          <span
                            title={item.data.examValid ? "Sınav kuralı ve soru havuzu doğrulandı" : "Doğrulanmış sınav kuralı yok"}
                            className={`px-1.5 py-0.2 rounded ${
                              item.data.examValid
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {item.data.examValid ? "Sınav ✓" : "Sınav -"}
                          </span>
                          {item.data.row && (
                            <button
                              onClick={() => onLoadReleaseToDraft(item.data.row)}
                              className="text-blue-400 hover:text-blue-200 underline ml-1"
                              title="Bu paketi düzenlemek için taslağa yükle"
                            >
                              Yükle
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                  <a
                    href={hb?.handbookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-400 flex items-center gap-1 truncate"
                  >
                    <ExternalLink size={11} /> Resmi El Kitabı
                  </a>
                  <button
                    onClick={() => onSelectScope(st.code, "general-first")}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition shrink-0"
                  >
                    {isSelected ? "Seçili Eyalet" : "Eyaleti Seç"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alt İki Kolon: Eyalet & Mod İstatistikleri + Son Çözülen Oturumlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <BarChart2 size={17} className="text-purple-400" />
              Çalışma Modu Dağılımı ({daysFilter} Gün)
            </h3>
            <div className="space-y-2.5">
              {modeCounts.map((m) => (
                <div key={m.mode} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-slate-300 font-medium">{m.mode}</span>
                    <span className="text-slate-400 font-mono">
                      {m.count} oturum (%{m.share})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.max(m.share, m.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp size={17} className="text-emerald-400" />
              Eyalet Bazlı Çözüm & Başarı ({daysFilter} Gün)
            </h3>
            <div className="space-y-2">
              {stateStats.map((st) => (
                <div
                  key={st.code}
                  className="flex items-center justify-between text-xs bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 w-6">{st.code}</span>
                    <span className="text-slate-200">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{st.sessions} oturum</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        st.accuracy >= 80
                          ? "bg-emerald-950 text-emerald-300"
                          : st.sessions > 0
                          ? "bg-amber-950 text-amber-300"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      %{st.accuracy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={17} className="text-blue-400" />
                Son Tamamlanan Kullanıcı Oturumları (us_attempts)
              </h3>
              <p className="text-xs text-slate-400">
                {isUsingServiceRole
                  ? "Service Role aktif: Tüm kullanıcıların senkronize ettiği oturumlar listeleniyor."
                  : "Not: Anon Key modunda RLS nedeniyle yalnızca yetkili veriler görünür. Tüm kullanıcıları görmek için Ayarlar sekmesinden Service Role Key girin."}
              </p>
            </div>
          </div>

          {analyticsError && (
            <div className="p-3 mb-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{analyticsError}</span>
            </div>
          )}

          {attemptsList.length === 0 ? (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-10 text-center text-slate-400 text-xs">
              Henüz görüntülenebilen tamamlanmış oturum kaydı yok.
              {!isUsingServiceRole && (
                <span className="block mt-1 text-amber-400">
                  Tüm kullanıcıların oturumlarını incelemek için sağ üstteki &quot;Ayarlar &amp; Yetki&quot; sekmesinden Service Role Key ekleyebilirsiniz.
                </span>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800 sticky top-0 bg-slate-900">
                  <tr>
                    <th className="py-2 px-2">Eyalet / Profil</th>
                    <th className="py-2 px-2">Mod</th>
                    <th className="py-2 px-2">Skor</th>
                    <th className="py-2 px-2">Kullanıcı</th>
                    <th className="py-2 px-2">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {attemptsList.slice(0, 40).map((att) => {
                    const pct = att.total > 0 ? Math.round((att.correct / att.total) * 100) : 0;
                    const prof = profilesList.find((p) => p.user_id === att.user_id);
                    return (
                      <tr key={`${att.user_id}-${att.session_id}`} className="hover:bg-slate-950/50">
                        <td className="py-2.5 px-2">
                          <span className="font-bold text-blue-400 mr-1.5">{att.state}</span>
                          <span className="text-slate-400">{att.profile}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 capitalize">
                            {att.mode}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono">
                          <span className={pct >= 80 ? "text-emerald-400 font-bold" : "text-amber-300 font-bold"}>
                            {att.correct}/{att.total} (%{pct})
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-300">
                          {prof?.nickname || (att.user_id ? `${att.user_id.slice(0, 8)}…` : "Anonim")}
                        </td>
                        <td className="py-2.5 px-2 text-slate-400">
                          {new Date(att.completed_at).toLocaleString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
