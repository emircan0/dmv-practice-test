import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  RefreshCw,
  Users,
  Database,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import {
  supabase,
  activeSupabaseUrl,
  getCustomSupabaseUrl,
  getServiceRoleKey,
  getStorageBucket,
  setAdminCredentials,
  clearAdminCredentials,
  isUsingServiceRole,
} from "../supabase";
import { STATES } from "../../../src/us/states";
import type { CandidateProfile } from "../../../src/us/model";

interface LeaderboardSettingsProps {
  mode: "leaderboard" | "settings";
  selectedState: string;
  selectedProfile: CandidateProfile;
  triggerStatus: (type: "success" | "error", text: string) => void;
}

export const LeaderboardAndSettingsTab: React.FC<LeaderboardSettingsProps> = ({
  mode,
  selectedState,
  selectedProfile,
  triggerStatus,
}) => {
  // Leaderboard state
  const [lbState, setLbState] = useState(selectedState);
  const [lbProfile, setLbProfile] = useState<CandidateProfile>(selectedProfile);
  const [lbMetric, setLbMetric] = useState<"success" | "activity">("success");
  const [lbMonthOffset, setLbMonthOffset] = useState<0 | 1>(0);
  const [lbRows, setLbRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  // Settings state
  const [urlInput, setUrlInput] = useState(() => getCustomSupabaseUrl() || activeSupabaseUrl);
  const [keyInput, setKeyInput] = useState(() => getServiceRoleKey());
  const [bucketInput, setBucketInput] = useState(() => getStorageBucket());
  const [showKey, setShowKey] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlMigration = `-- general-first profilini veritabanına ekleme (202611040001_us_general_study.sql):
alter table public.us_content_releases
  drop constraint if exists us_content_releases_profile_check;

alter table public.us_content_releases
  add constraint us_content_releases_profile_check
  check (profile in ('general-first', 'adult-first', 'teen-first'));`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResults, setDiagResults] = useState<
    { label: string; ok: boolean; detail: string }[]
  >([]);

  useEffect(() => {
    setLbState(selectedState);
    setLbProfile(selectedProfile);
  }, [selectedState, selectedProfile]);

  const loadLeaderboardAndProfiles = useCallback(async () => {
    if (mode !== "leaderboard") return;
    setLbLoading(true);
    try {
      const [rpcRes, profRes, attRes] = await Promise.all([
        supabase.rpc("us_leaderboard", {
          p_state: lbState,
          p_profile: lbProfile,
          p_metric: lbMetric,
          p_month_offset: lbMonthOffset,
        }),
        supabase.from("us_profiles").select("*").limit(200),
        supabase
          .from("us_attempts")
          .select("*")
          .eq("state", lbState)
          .eq("profile", lbProfile)
          .limit(500),
      ]);

      setProfiles(profRes.data || []);

      if (!rpcRes.error && Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
        setLbRows(rpcRes.data);
      } else if (Array.isArray(attRes.data) && attRes.data.length > 0) {
        // Fallback computation when viewing via Service Role without auth.uid() session
        const pMap = new Map((profRes.data || []).map((p: any) => [p.user_id, p]));
        const agg = new Map<
          string,
          { user_id: string; nickname: string; correct: number; total: number; answered: number; count: number }
        >();
        for (const a of attRes.data) {
          const prof = pMap.get(a.user_id);
          if (!prof?.show_ranking) continue;
          const prev = agg.get(a.user_id) || {
            user_id: a.user_id,
            nickname: prof.nickname || "Driver",
            correct: 0,
            total: 0,
            answered: 0,
            count: 0,
          };
          prev.correct += a.correct || 0;
          prev.total += a.total || 0;
          prev.answered += a.answered || 0;
          prev.count += 1;
          agg.set(a.user_id, prev);
        }
        const computed = Array.from(agg.values())
          .map((item) => ({
            user_id: item.user_id,
            nickname: item.nickname,
            average_score: item.total > 0 ? Math.round((item.correct / item.total) * 1000) / 10 : 0,
            total_solved: item.answered,
            exams_completed: item.count,
          }))
          .sort((a, b) =>
            lbMetric === "success"
              ? b.average_score - a.average_score
              : b.total_solved - a.total_solved
          );
        setLbRows(computed);
      } else {
        setLbRows([]);
      }
    } catch (err: any) {
      console.error("Leaderboard load error:", err);
    } finally {
      setLbLoading(false);
    }
  }, [mode, lbState, lbProfile, lbMetric, lbMonthOffset]);

  useEffect(() => {
    loadLeaderboardAndProfiles();
  }, [loadLeaderboardAndProfiles]);

  const toggleProfileRanking = async (userId: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from("us_profiles")
        .update({ show_ranking: !currentVal })
        .eq("user_id", userId);
      if (error) throw error;
      triggerStatus("success", "Kullanıcı sıralama görünürlüğü güncellendi.");
      loadLeaderboardAndProfiles();
    } catch (err: any) {
      triggerStatus("error", `Güncellenemedi: ${err.message}`);
    }
  };

  const runDiagnostics = async () => {
    setDiagLoading(true);
    const checks: { label: string; ok: boolean; detail: string }[] = [];

    const formatErr = (err: any) =>
      err?.message || err?.details || err?.hint || (typeof err === "object" ? JSON.stringify(err) : String(err)) || "Bilinmeyen hata";

    try {
      const relRes = await supabase.from("us_content_releases").select("id,state,profile,status").limit(5);
      checks.push({
        label: "us_content_releases Tablosu Okuma",
        ok: !relRes.error,
        detail: relRes.error ? formatErr(relRes.error) : `Erişim başarılı (${relRes.data?.length || 0} örnek kayıt okundu)`,
      });
    } catch (e: any) {
      checks.push({ label: "us_content_releases Tablosu Okuma", ok: false, detail: formatErr(e) });
    }

    try {
      const profRes = await supabase.from("us_profiles").select("user_id").limit(5);
      checks.push({
        label: "us_profiles Tablosu (Kullanıcı Profilleri)",
        ok: !profRes.error,
        detail: profRes.error ? formatErr(profRes.error) : `Tablo mevcut ve erişilebilir (${profRes.data?.length || 0} kayıt okundu)`,
      });
    } catch (e: any) {
      checks.push({ label: "us_profiles Tablosu", ok: false, detail: formatErr(e) });
    }

    try {
      const attRes = await supabase.from("us_attempts").select("session_id").limit(5);
      checks.push({
        label: "us_attempts Tablosu (Sınav/Pratik Sonuçları)",
        ok: !attRes.error,
        detail: attRes.error ? formatErr(attRes.error) : `Tablo mevcut ve erişilebilir (${attRes.data?.length || 0} kayıt okundu)`,
      });
    } catch (e: any) {
      checks.push({ label: "us_attempts Tablosu", ok: false, detail: formatErr(e) });
    }

    checks.push({
      label: "Yönetici Yazma Yetkisi (Service Role Key)",
      ok: isUsingServiceRole,
      detail: isUsingServiceRole
        ? "Service Role Key tanımlı: Yeni paket yayınlama ve paket geri çekme (withdrawn) işlemleri tam yetkiyle çalışır."
        : "Anon Key kullanılıyor: RLS kuralları gereği canlı veritabanına yeni paket yazmak için Service Role Key girmeniz önerilir.",
    });

    setDiagResults(checks);
    setDiagLoading(false);
  };

  useEffect(() => {
    if (mode === "settings") {
      runDiagnostics();
    }
  }, [mode]);

  if (mode === "leaderboard") {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy size={19} className="text-amber-400" />
                Eyalet &amp; Profil Bazlı Canlı Liderlik Tablosu
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mobil uygulamadaki Rankings sekmesinin verilerini eyalet, profil, metrik ve ay bazında kontrol edin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={lbState}
                onChange={(e) => setLbState(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
              >
                {STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>

              <select
                value={lbProfile}
                onChange={(e) => setLbProfile(e.target.value as CandidateProfile)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
              >
                <option value="general-first">Ortak Çalışma (general-first)</option>
                <option value="adult-first">Adult 18+ (adult-first)</option>
                <option value="teen-first">Teen &lt;18 (teen-first)</option>
              </select>

              <select
                value={lbMetric}
                onChange={(e) => setLbMetric(e.target.value as "success" | "activity")}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
              >
                <option value="success">Başarı Oranı (Accuracy)</option>
                <option value="activity">Çözülen Soru (Activity)</option>
              </select>

              <select
                value={lbMonthOffset}
                onChange={(e) => setLbMonthOffset(Number(e.target.value) as 0 | 1)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
              >
                <option value={0}>Bu Ay (UTC)</option>
                <option value={1}>Geçen Ay (UTC)</option>
              </select>

              <button
                onClick={loadLeaderboardAndProfiles}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <RefreshCw size={13} className={lbLoading ? "animate-spin" : ""} /> Yenile
              </button>
            </div>
          </div>

          {lbRows.length === 0 ? (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-10 text-center text-xs text-slate-400">
              {lbState} ({lbProfile}) için seçilen dönemde sıralamaya katılan (opt-in) kullanıcı skoru bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Sıra</th>
                    <th className="py-2.5 px-3">Takma Ad (Nickname)</th>
                    <th className="py-2.5 px-3">Ortalama Başarı</th>
                    <th className="py-2.5 px-3">Çözülen Soru</th>
                    <th className="py-2.5 px-3">Tamamlanan Oturum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {lbRows.map((row, idx) => (
                    <tr key={row.user_id || idx} className="hover:bg-slate-950/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{row.nickname}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        %{row.average_score}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-300">{row.total_solved}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{row.exams_completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Kayıtlı Kullanıcı Profilleri Yönetimi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Users size={17} className="text-blue-400" />
            Kullanıcı Profilleri &amp; Sıralama Moderasyonu (us_profiles)
          </h3>
          {profiles.length === 0 ? (
            <p className="text-xs text-slate-400">
              Görüntülenebilen kullanıcı profili bulunmuyor (Tüm profilleri görmek ve moderasyon yapmak için Service Role Key kullanın).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Kullanıcı ID</th>
                    <th className="py-2 px-3">Nickname</th>
                    <th className="py-2 px-3">Sıralamada Görünür (Opt-in)</th>
                    <th className="py-2 px-3">Avatar Gizli</th>
                    <th className="py-2 px-3">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {profiles.map((p) => (
                    <tr key={p.user_id} className="hover:bg-slate-950/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{p.user_id}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{p.nickname || "(Boş)"}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.show_ranking
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {p.show_ranking ? "Açık" : "Gizli"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{p.hide_avatar ? "Evet" : "Hayır"}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => toggleProfileRanking(p.user_id, p.show_ranking)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold transition"
                        >
                          {p.show_ranking ? "Sıralamadan Gizle" : "Sıralamaya Aç"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SETTINGS MODE
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database size={19} className="text-blue-400" />
              Supabase Bağlantı &amp; Yönetici Yetkisi (Service Role) Ayarları
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              US veritabanında <code className="text-blue-300">us_content_releases</code> tablosu RLS (Row Level Security) ile korunur: Anon/Publishable anahtar yalnızca yayınlanmış paketleri okuyabilir. Yeni paket yayınlamak, mevcut paketi yayından çekmek (<code className="text-amber-300">withdrawn</code>) ve tüm kullanıcı analizlerini görmek için <strong>Service Role Key</strong> girebilirsiniz. Bu anahtar yalnızca tarayıcınızın yerel hafızasında (<code className="text-slate-300">localStorage</code>) tutulur.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
              isUsingServiceRole
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-amber-950 text-amber-300 border-amber-700"
            }`}
          >
            {isUsingServiceRole ? "Tam Yetki (Service Role)" : "Salt Okunur (Anon Key)"}
          </span>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              US Supabase Project URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supabase Service Role Key (Yayınlama, Paket Çekme ve Tam Analitik İçin)
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... veya sb_secret_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
               Görsel Yükleme Storage Bucket Adı (Soru Görselleri İçin)
            </label>
            <input
              type="text"
              value={bucketInput}
              onChange={(e) => setBucketInput(e.target.value)}
              placeholder="dmv-media"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {isUsingServiceRole && (
              <button
                onClick={clearAdminCredentials}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/70 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 size={14} /> Kayıtlı Anahtarı Temizle
              </button>
            )}
            <button
              onClick={() => setAdminCredentials(urlInput, keyInput, bucketInput)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition"
            >
              <Save size={14} /> Ayarları Kaydet ve Yeniden Bağlan
            </button>
          </div>
        </div>
      </div>

      {/* Şema & Profil Güncelleme (SQL Migration) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database size={17} className="text-blue-400" />
              Veritabanı Şema Desteği: <code className="text-blue-300 font-mono text-xs">general-first</code> Profili
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Eğer paket yayınlarken <span className="text-amber-300 font-mono">violates check constraint &quot;us_content_releases_profile_check&quot;</span> hatası alırsanız, Supabase projenizin SQL Editor sayfasında aşağıdaki 3 satırlık SQL kodunu çalıştırın.
            </p>
          </div>
          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition shrink-0"
          >
            {copiedSql ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            {copiedSql ? "SQL Kopyalandı!" : "SQL Kodunu Kopyala"}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {sqlMigration}
          </pre>
        </div>
        <p className="text-[11px] text-slate-400">
          📍 <strong>Nasıl Uygulanır?</strong> Supabase Dashboard &gt; Projeniz &gt; Sol menüden <strong>SQL Editor</strong> &gt; <strong>New Query</strong> &gt; Kodu yapıştırın ve <strong>Run</strong> butonuna basın.
        </p>
      </div>

      {/* Canlı Veritabanı ve Şema Tanılama */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound size={17} className="text-emerald-400" />
            Veritabanı Tablo &amp; Yetki Tanılama (Diagnostics)
          </h3>
          <button
            onClick={runDiagnostics}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw size={13} className={diagLoading ? "animate-spin" : ""} /> Testi Çalıştır
          </button>
        </div>

        <div className="space-y-2.5">
          {diagResults.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                item.ok
                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                  : "bg-amber-950/40 border-amber-800/70 text-amber-200"
              }`}
            >
              {item.ok ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{item.label}</p>
                <p className="text-slate-300 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Şema & Profil Güncelleme (SQL Migration) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database size={17} className="text-blue-400" />
              Veritabanı Şema Desteği: <code className="text-blue-300 font-mono text-xs">general-first</code> Profili
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Eğer paket yayınlarken <span className="text-amber-300 font-mono">violates check constraint &quot;us_content_releases_profile_check&quot;</span> hatası alırsanız, Supabase projenizin SQL Editor sayfasında aşağıdaki 3 satırlık SQL kodunu çalıştırın.
            </p>
          </div>
          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition shrink-0"
          >
            {copiedSql ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            {copiedSql ? "SQL Kopyalandı!" : "SQL Kodunu Kopyala"}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {sqlMigration}
          </pre>
        </div>
        <p className="text-[11px] text-slate-400">
          📍 <strong>Nasıl Uygulanır?</strong> Supabase Dashboard &gt; Projeniz &gt; Sol menüden <strong>SQL Editor</strong> &gt; <strong>New Query</strong> &gt; Kodu yapıştırın ve <strong>Run</strong> butonuna basın.
        </p>
      </div>
    </div>
  );
};
