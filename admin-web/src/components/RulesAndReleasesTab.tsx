import React, { useState } from "react";
import {
  FileCheck,
  BookOpen,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Archive,
  ExternalLink,
  Upload,
} from "lucide-react";
import type {
  CandidateProfile,
  ExamRule,
  Lesson,
  Question,
} from "../../../src/us/model";
import { assembleExam } from "../../../src/us/engine";
import { STATES } from "../../../src/us/states";
import { supabase } from "../supabase";
import {
  ADMIN_TOPICS,
  buildPresetRule,
  getTopicMeta,
  STATE_HANDBOOKS,
} from "../presets";

interface RulesAndReleasesProps {
  mode: "rules" | "published";
  selectedState: string;
  selectedProfile: CandidateProfile;
  examRule: ExamRule;
  setExamRule: React.Dispatch<React.SetStateAction<ExamRule>>;
  questions: Question[];
  lessons: Lesson[];
  publishedReleases: any[];
  onRefreshReleases: () => void;
  onLoadFullRelease: (rel: any) => void;
  triggerStatus: (type: "success" | "error", text: string) => void;
}

export const RulesAndReleasesTab: React.FC<RulesAndReleasesProps> = ({
  mode,
  selectedState,
  selectedProfile,
  examRule,
  setExamRule,
  questions,
  publishedReleases,
  onRefreshReleases,
  onLoadFullRelease,
  triggerStatus,
}) => {
  const [filterState, setFilterState] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const hb = STATE_HANDBOOKS[selectedState] || STATE_HANDBOOKS.CA;

  const addSectionQuota = () => {
    const usedTopics = new Set(examRule.sections.map((s) => s.topic));
    const available = ADMIN_TOPICS.find((t) => !usedTopics.has(t.id))?.id || "road-signs";
    setExamRule({
      ...examRule,
      sections: [
        ...examRule.sections,
        { topic: available, questionCount: 4, minimumCorrect: 2 },
      ],
    });
  };

  const updateSectionQuota = (
    idx: number,
    patch: Partial<{ topic: string; questionCount: number; minimumCorrect: number }>
  ) => {
    const next = examRule.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setExamRule({ ...examRule, sections: next });
  };

  const removeSectionQuota = (idx: number) => {
    setExamRule({
      ...examRule,
      sections: examRule.sections.filter((_, i) => i !== idx),
    });
  };

  const applyOfficialPreset = () => {
    const preset = buildPresetRule(selectedState, selectedProfile);
    setExamRule(preset);
    triggerStatus(
      "success",
      `${selectedState} (${hb.agency}) varsayılan sınav kuralı ve kaynak URL'si dolduruldu.`
    );
  };

  const fitRuleToCurrentPool = () => {
    if (questions.length === 0) {
      triggerStatus("error", "Havuzda henüz soru yok. Önce soru ekleyin.");
      return;
    }
    const count = questions.length;
    const minCorrect = Math.max(1, Math.ceil(count * 0.8));
    const today = new Date().toISOString().slice(0, 10);
    setExamRule({
      ...examRule,
      state: selectedState,
      profile: selectedProfile,
      questionCount: count,
      minimumCorrect: minCorrect,
      verifiedAt: examRule.verifiedAt || today,
      sourceUrl: examRule.sourceUrl?.startsWith("https://")
        ? examRule.sourceUrl
        : hb.examInfoUrl,
      sections: [],
    });
    triggerStatus(
      "success",
      `Sınav kuralı mevcut ${count} soruluk havuza göre (${minCorrect}/${count} - %80 barajlı) uyarlandı!`
    );
  };

  const handleWithdrawRelease = async (rel: any) => {
    if (
      !confirm(
        `${rel.state} (${rel.profile}) v${rel.version} paketini yayından çekmek (withdrawn) istediğinize emin misiniz?`
      )
    )
      return;
    setWithdrawingId(rel.id);
    try {
      const { error } = await supabase
        .from("us_content_releases")
        .update({ status: "withdrawn" })
        .eq("id", rel.id);
      if (error) throw error;
      triggerStatus("success", `v${rel.version} paketi yayından çekildi (withdrawn).`);
      onRefreshReleases();
    } catch (err: any) {
      triggerStatus(
        "error",
        `Paketi yayından çekme başarısız: ${err.message}. (Ayarlar sekmesinden Service Role Key girdiğinizden emin olun.)`
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const exportReleaseJson = (rel: any) => {
    const fullRelease = {
      id: rel.id,
      version: rel.version,
      state: rel.state,
      profile: rel.profile,
      vehicle: rel.vehicle,
      language: rel.language,
      publishedAt: rel.published_at,
      rule: rel.payload?.rule ?? null,
      questions: rel.payload?.questions ?? [],
      lessons: rel.payload?.lessons ?? [],
    };
    const blob = new Blob([JSON.stringify(fullRelease, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `release-${rel.state.toLowerCase()}-${rel.profile}-v${rel.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (mode === "rules") {
    let assemblyStatus: { ok: boolean; message: string } = {
      ok: false,
      message: "Kural doğrulama tarihi boş (Yalnızca pratik modu yayınlanır).",
    };
    if (examRule.verifiedAt) {
      try {
        assembleExam(questions, {
          ...examRule,
          state: selectedState,
          profile: selectedProfile,
        });
        assemblyStatus = {
          ok: true,
          message: `Sınav motoru doğrulandı! ${questions.length} soruluk havuzdan ${examRule.questionCount} soruluk resmi sınav sorunsuz oluşturulabiliyor.`,
        };
      } catch (e: any) {
        assemblyStatus = {
          ok: false,
          message: `Sınav oluşturulamıyor (${e.message}): Havuzda ${questions.length} soru var, ancak kural ${examRule.questionCount} soru (veya alt bölüm kotası) istiyor.`,
        };
      }
    }

    const passPercentage =
      examRule.questionCount > 0
        ? Math.round((examRule.minimumCorrect / examRule.questionCount) * 100)
        : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck size={19} className="text-blue-400" />
                {selectedState} ({hb.name}) Sınav Kuralları &amp; Alt Bölüm Barajları ({selectedProfile})
              </h2>
              <p className="text-xs text-slate-400 mt-1">{hb.notesTr}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={applyOfficialPreset}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles size={14} /> {selectedState} Resmi Şablonunu Doldur
              </button>
              <button
                onClick={fitRuleToCurrentPool}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Mevcut soru sayısına göre sınav kuralını otomatik ayarla (Pilot test için ideal)"
              >
                Havuza Uyarla ({questions.length} Soru)
              </button>
            </div>
          </div>

          {/* Canlı Doğrulama Durumu */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              assemblyStatus.ok
                ? "bg-emerald-950/40 border-emerald-700/70 text-emerald-200"
                : "bg-amber-950/40 border-amber-700/70 text-amber-200"
            }`}
          >
            {assemblyStatus.ok ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            )}
            <span>{assemblyStatus.message}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kural Doğrulama Tarihi (Boşsa yalnızca pratik yayınlanır)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={examRule.verifiedAt ? examRule.verifiedAt.slice(0, 10) : ""}
                  onChange={(e) =>
                    setExamRule({ ...examRule, verifiedAt: e.target.value })
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                {examRule.verifiedAt && (
                  <button
                    onClick={() => setExamRule({ ...examRule, verifiedAt: "" })}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    Sadece Pratik Yap
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resmi Kural Kaynak URL (https:// zorunlu)
              </label>
              <input
                type="text"
                value={examRule.sourceUrl}
                onChange={(e) =>
                  setExamRule({ ...examRule, sourceUrl: e.target.value })
                }
                placeholder={hb.examInfoUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Toplam Sınav Sorusu (questionCount)
              </label>
              <input
                type="number"
                min={1}
                value={examRule.questionCount}
                onChange={(e) =>
                  setExamRule({
                    ...examRule,
                    questionCount: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500">
                Mevcut taslak havuzunda {questions.length} soru var.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Geçmek İçin Gereken Doğru Sayısı (minimumCorrect)
              </label>
              <input
                type="number"
                min={1}
                value={examRule.minimumCorrect}
                onChange={(e) =>
                  setExamRule({
                    ...examRule,
                    minimumCorrect: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-emerald-400 font-mono">
                Geçme Eşiği: %{passPercentage} ({examRule.minimumCorrect} / {examRule.questionCount})
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sınav Süresi (Saniye — Resmi süre sınırı yoksa boş bırakın)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={examRule.durationSeconds ?? ""}
                  onChange={(e) =>
                    setExamRule({
                      ...examRule,
                      durationSeconds:
                        e.target.value === "" ? null : Math.max(60, Number(e.target.value)),
                    })
                  }
                  placeholder="Süresiz (null)"
                  className="w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                {[
                  { label: "Süresiz", val: null },
                  { label: "20 Dk", val: 1200 },
                  { label: "30 Dk", val: 1800 },
                  { label: "45 Dk", val: 2700 },
                  { label: "60 Dk", val: 3600 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setExamRule({ ...examRule, durationSeconds: preset.val })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      examRule.durationSeconds === preset.val
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alt Bölüm Barajları (Sections) */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Alt Bölüm Soru Kotaları &amp; Barajları (sections)
                </h3>
                <p className="text-xs text-slate-400">
                  Örn: New York&apos;ta <code className="text-blue-300">road-signs</code> konusundan 4 soru sorulması ve en az 2 doğru yapılması zorunludur.
                </p>
              </div>
              <button
                type="button"
                onClick={addSectionQuota}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={14} /> Alt Bölüm Kotası Ekle
              </button>
            </div>

            {examRule.sections.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                Alt bölüm kotası tanımlanmadı. Sınav soruları tüm konu havuzundan rastgele seçilir.
              </div>
            ) : (
              <div className="space-y-2.5">
                {examRule.sections.map((sec, idx) => {
                  const poolCount = questions.filter((q) => q.topic === sec.topic).length;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                    >
                      <div className="md:col-span-5">
                        <label className="block text-[11px] text-slate-400 mb-1">Konu (Topic)</label>
                        <select
                          value={sec.topic}
                          onChange={(e) => updateSectionQuota(idx, { topic: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold"
                        >
                          {ADMIN_TOPICS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.titleTr} ({t.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Sorulacak Soru (Havuzda: {poolCount})
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={sec.questionCount}
                          onChange={(e) =>
                            updateSectionQuota(idx, {
                              questionCount: Math.max(1, Number(e.target.value)),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Min. Doğru Barajı
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={sec.questionCount}
                          value={sec.minimumCorrect}
                          onChange={(e) =>
                            updateSectionQuota(idx, {
                              minimumCorrect: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end pt-4">
                        <button
                          onClick={() => removeSectionQuota(idx)}
                          className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400"
                          title="Kotayı Kaldır"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PUBLISHED RELEASES MODE
  const filteredReleases = publishedReleases.filter((r) => {
    if (filterState !== "ALL" && r.state !== filterState) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-6xl mx-auto shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={19} className="text-blue-400" />
            Supabase Veritabanında Yayınlanmış Paketler ({filteredReleases.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Yayınlanan paketler değiştirilemez (immutable). Güncelleme yapmak için paketi taslağa yükleyip düzenledikten sonra yeni sürüm olarak yayınlayın veya eski paketi yayından çekin (<code className="text-amber-300">withdrawn</code>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold"
          >
            <option value="ALL">Tüm Eyaletler</option>
            {STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="published">Yayında (published)</option>
            <option value="withdrawn">Geri Çekildi (withdrawn)</option>
          </select>

          <button
            onClick={onRefreshReleases}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw size={13} /> Yenile
          </button>
        </div>
      </div>

      {filteredReleases.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-sm bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
          Seçilen filtreye uygun yayınlanmış paket bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReleases.map((rel) => {
            const qCount = rel.payload?.questions?.length || 0;
            const lCount = rel.payload?.lessons?.length || 0;
            const rule = rel.payload?.rule;
            return (
              <div
                key={rel.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-md">
                      {rel.state}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {rel.profile === "general-first"
                        ? "Ortak Çalışma (general-first)"
                        : rel.profile === "adult-first"
                        ? "Adult 18+ (adult-first)"
                        : "Teen <18 (teen-first)"}
                    </span>
                    <span className="text-xs font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                      v{rel.version}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        rel.status === "published"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-red-950 text-red-300 border-red-800"
                      }`}
                    >
                      {rel.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong>{qCount}</strong> soru · <strong>{lCount}</strong> ders notu ·{" "}
                    {rule
                      ? `Sınav: ${rule.questionCount} soruda min ${rule.minimumCorrect} doğru`
                      : "Sadece Pratik (Sınav kuralı yok)"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    İnceleyen: {rel.reviewer || "Admin"} · Yayınlanma:{" "}
                    {new Date(rel.published_at).toLocaleString("tr-TR")} · ID:{" "}
                    <span className="font-mono">{rel.id}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onLoadFullRelease(rel)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Upload size={13} /> Taslağa Yükle (Soru+Ders+Kural)
                  </button>

                  <button
                    onClick={() => exportReleaseJson(rel)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Download size={13} /> JSON İndir
                  </button>

                  {rel.status === "published" && (
                    <button
                      disabled={withdrawingId === rel.id}
                      onClick={() => handleWithdrawRelease(rel)}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/70 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Archive size={13} /> Yayından Çek
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
