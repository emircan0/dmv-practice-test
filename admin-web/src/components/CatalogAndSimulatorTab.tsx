import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Layers,
  Share2,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Check,
  X,
  HelpCircle,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import type {
  CandidateProfile,
  ExamRule,
  Lesson,
  Question,
} from "../../../src/us/model";
import {
  assembleExam,
  evaluate,
  shuffle,
  validateRelease,
} from "../../../src/us/engine";
import {
  composeRelease,
  type SharedCatalog,
  type Applicability,
} from "../../../src/us/contentAuthoring";
import { STATES } from "../../../src/us/states";
import { getTopicMeta, STATE_HANDBOOKS } from "../presets";

const CATALOG_STORAGE_KEY = "dmv_us_shared_catalog_v1";

export const loadStoredCatalog = (): SharedCatalog => {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.questions) && Array.isArray(parsed.lessons)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { questions: [], lessons: [] };
};

export const saveStoredCatalog = (catalog: SharedCatalog) => {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  } catch {
    // ignore
  }
};

interface CatalogSimulatorProps {
  mode: "catalog" | "simulator";
  selectedState: string;
  selectedProfile: CandidateProfile;
  questions: Question[];
  lessons: Lesson[];
  examRule: ExamRule;
  onUpdateDraft: (questions: Question[], lessons: Lesson[]) => void;
  triggerStatus: (type: "success" | "error", text: string) => void;
}

export const CatalogAndSimulatorTab: React.FC<CatalogSimulatorProps> = ({
  mode,
  selectedState,
  selectedProfile,
  questions,
  lessons,
  examRule,
  onUpdateDraft,
  triggerStatus,
}) => {
  const [catalog, setCatalog] = useState<SharedCatalog>(() => loadStoredCatalog());

  useEffect(() => {
    saveStoredCatalog(catalog);
  }, [catalog]);

  // Simulator States
  const [simMode, setSimMode] = useState<"exam" | "practice" | "daily">("exam");
  const [simQuestions, setSimQuestions] = useState<Question[]>([]);
  const [simAnswers, setSimAnswers] = useState<Record<string, number>>({});
  const [simIndex, setSimIndex] = useState(0);
  const [simFinished, setSimFinished] = useState(false);

  const toggleStateApplicability = (
    kind: "question" | "lesson",
    itemId: string,
    stateCode: string,
    profile: CandidateProfile
  ) => {
    const hb = STATE_HANDBOOKS[stateCode] || STATE_HANDBOOKS.CA;
    const today = new Date().toISOString().slice(0, 10);

    setCatalog((prev) => {
      const listKey = kind === "question" ? "questions" : "lessons";
      const updated = prev[listKey].map((entry: any) => {
        if (entry.content.id !== itemId) return entry;
        const exists = entry.applicability.some(
          (a: Applicability) => a.state === stateCode && a.profile === profile
        );
        const nextApp = exists
          ? entry.applicability.filter(
              (a: Applicability) => !(a.state === stateCode && a.profile === profile)
            )
          : [
              ...entry.applicability,
              {
                state: stateCode,
                profile,
                source: {
                  title: hb.handbookTitle,
                  url: hb.handbookUrl,
                  section: getTopicMeta(entry.content.topic).titleEn,
                  reviewedAt: today,
                },
              },
            ];
        return { ...entry, applicability: nextApp };
      });
      return { ...prev, [listKey]: updated };
    });
  };

  const importDraftToCatalog = () => {
    if (questions.length === 0 && lessons.length === 0) {
      triggerStatus("error", "Taslakta ortak havuza aktarılacak soru veya ders bulunmuyor.");
      return;
    }

    setCatalog((prev) => {
      const nextQuestions = [...prev.questions];
      for (const q of questions) {
        const { source, ...content } = q;
        const idx = nextQuestions.findIndex((item) => item.content.id === q.id);
        const appEntry: Applicability = {
          state: selectedState,
          profile: selectedProfile,
          source: {
            title: source.title || STATE_HANDBOOKS[selectedState]?.handbookTitle || "Driver Handbook",
            url: source.url?.startsWith("https://")
              ? source.url
              : STATE_HANDBOOKS[selectedState]?.handbookUrl || "https://www.dmv.ca.gov/",
            section: source.section || q.topic,
            reviewedAt: source.reviewedAt || new Date().toISOString().slice(0, 10),
          },
        };
        if (idx >= 0) {
          const hasApp = nextQuestions[idx].applicability.some(
            (a) => a.state === selectedState && a.profile === selectedProfile
          );
          nextQuestions[idx] = {
            content,
            applicability: hasApp
              ? nextQuestions[idx].applicability
              : [...nextQuestions[idx].applicability, appEntry],
          };
        } else {
          nextQuestions.push({ content, applicability: [appEntry] });
        }
      }

      const nextLessons = [...prev.lessons];
      for (const l of lessons) {
        const { source, ...content } = l;
        const idx = nextLessons.findIndex((item) => item.content.id === l.id);
        const appEntry: Applicability = {
          state: selectedState,
          profile: selectedProfile,
          source: {
            title: source.title || STATE_HANDBOOKS[selectedState]?.handbookTitle || "Driver Handbook",
            url: source.url?.startsWith("https://")
              ? source.url
              : STATE_HANDBOOKS[selectedState]?.handbookUrl || "https://www.dmv.ca.gov/",
            section: source.section || l.topic,
            reviewedAt: source.reviewedAt || new Date().toISOString().slice(0, 10),
          },
        };
        if (idx >= 0) {
          const hasApp = nextLessons[idx].applicability.some(
            (a) => a.state === selectedState && a.profile === selectedProfile
          );
          nextLessons[idx] = {
            content,
            applicability: hasApp
              ? nextLessons[idx].applicability
              : [...nextLessons[idx].applicability, appEntry],
          };
        } else {
          nextLessons.push({ content, applicability: [appEntry] });
        }
      }

      return { questions: nextQuestions, lessons: nextLessons };
    });

    triggerStatus(
      "success",
      `Mevcut taslaktaki ${questions.length} soru ve ${lessons.length} ders Ortak Katalog havuzuna eklendi/güncellendi.`
    );
  };

  const applyAllPhase1States = (kind: "question" | "lesson", itemId: string) => {
    const phase1 = ["CA", "TX", "FL", "NY"];
    const today = new Date().toISOString().slice(0, 10);

    setCatalog((prev) => {
      const listKey = kind === "question" ? "questions" : "lessons";
      const updated = prev[listKey].map((entry: any) => {
        if (entry.content.id !== itemId) return entry;
        const nextApp = [...entry.applicability];
        for (const st of phase1) {
          if (!nextApp.some((a) => a.state === st && a.profile === selectedProfile)) {
            const hb = STATE_HANDBOOKS[st];
            nextApp.push({
              state: st,
              profile: selectedProfile,
              source: {
                title: hb.handbookTitle,
                url: hb.handbookUrl,
                section: getTopicMeta(entry.content.topic).titleEn,
                reviewedAt: today,
              },
            });
          }
        }
        return { ...entry, applicability: nextApp };
      });
      return { ...prev, [listKey]: updated };
    });
  };

  const composeIntoActiveDraft = () => {
    try {
      const existingQIds = new Set(questions.map((q) => q.id));
      const existingLIds = new Set(lessons.map((l) => l.id));

      const filteredCatalog: SharedCatalog = {
        questions: catalog.questions.filter((q) => !existingQIds.has(q.content.id)),
        lessons: catalog.lessons.filter((l) => !existingLIds.has(l.content.id)),
      };

      const now = new Date().toISOString();
      const composed = composeRelease(
        {
          id: "draft-compose",
          version: "1.0",
          state: selectedState,
          profile: selectedProfile,
          vehicle: "car",
          language: "en",
          publishedAt: now,
          rule: null,
          questions,
          lessons,
        },
        filteredCatalog
      );

      onUpdateDraft(composed.questions, composed.lessons);
      triggerStatus(
        "success",
        `${selectedState} (${selectedProfile}) için ortak katalog birleştirildi: Toplam ${composed.questions.length} soru ve ${composed.lessons.length} ders hazır!`
      );
    } catch (err: any) {
      triggerStatus("error", `Ortak Katalog birleştirme hatası: ${err.message}`);
    }
  };

  const exportCatalogJson = () => {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dmv-shared-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startSimulation = (chosenMode: "exam" | "practice" | "daily") => {
    try {
      if (questions.length === 0) {
        triggerStatus("error", "Simülasyonu başlatmak için önce taslağa soru ekleyin.");
        return;
      }
      let pool: Question[] = [];
      if (chosenMode === "exam") {
        if (!examRule.verifiedAt || examRule.questionCount <= 0) {
          triggerStatus(
            "error",
            "Deneme sınavı simülasyonu için Sınav Kuralları sekmesinden geçerli soru sayısı ve doğrulama tarihi girin (veya Hızlı Pratik modunu seçin)."
          );
          return;
        }
        pool = assembleExam(questions, {
          ...examRule,
          state: selectedState,
          profile: selectedProfile,
        });
      } else {
        pool = shuffle(questions).slice(0, chosenMode === "daily" ? 5 : 10);
      }

      setSimMode(chosenMode);
      setSimQuestions(pool);
      setSimAnswers({});
      setSimIndex(0);
      setSimFinished(false);
    } catch (err: any) {
      triggerStatus(
        "error",
        `Sınav oluşturulamadı (${err.message}). Soru havuzunuzun sınav kuralı ve alt bölüm kotaları için yeterli olduğundan emin olun.`
      );
    }
  };

  if (mode === "catalog") {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 size={19} className="text-blue-400" />
                Ortak İçerik Havuzu &amp; Çoklu Eyalet Dağıtıcı (Shared Catalog)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Bir soruyu veya dersi tek sefer yazın, geçerli olduğu eyaletleri (CA, TX, FL, NY, PA, IL, OH, GA) işaretleyin ve her eyaletin kendi resmi DMV el kitabı kaynağıyla tek tıkla paketleyin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={importDraftToCatalog}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Upload size={14} /> Taslağı Ortak Havuza Kopyala
              </button>
              <button
                onClick={composeIntoActiveDraft}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition"
              >
                <Sparkles size={14} /> {selectedState} ({selectedProfile}) Taslağına Birleştir
              </button>
              <button
                onClick={exportCatalogJson}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download size={14} /> JSON İndir
              </button>
            </div>
          </div>

          {catalog.questions.length === 0 && catalog.lessons.length === 0 ? (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
              <Layers size={32} className="mx-auto text-slate-500 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Ortak Katalog Havuzu Boş</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Mevcut taslağınızdaki soruları ve dersleri &quot;Taslağı Ortak Havuza Kopyala&quot; butonuyla buraya aktarabilir ve diğer eyaletlere (CA, TX, FL, NY...) tek tıkla dağıtabilirsiniz.
              </p>
              <button
                onClick={importDraftToCatalog}
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition"
              >
                Mevcut Taslaktan Havuza Aktar ({questions.length} Soru, {lessons.length} Ders)
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ortak Sorular */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle size={16} className="text-blue-400" />
                    Kanonik Sorular ({catalog.questions.length}) — Aktif Profil: {selectedProfile}
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm("Ortak katalog havuzunu temizlemek istediğinize emin misiniz?")) {
                        setCatalog({ questions: [], lessons: [] });
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Havuzu Temizle
                  </button>
                </div>

                <div className="space-y-3">
                  {catalog.questions.map((item) => {
                    const topicMeta = getTopicMeta(item.content.topic);
                    return (
                      <div
                        key={item.content.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded border ${topicMeta.badgeClass}`}>
                              {topicMeta.titleTr}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">{item.content.id}</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{item.content.prompt}</p>
                          <p className="text-xs text-emerald-400">
                            ✓ Doğru Şık: {item.content.options[item.content.correctIndex]}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {STATES.map((st) => {
                            const active = item.applicability.some(
                              (a) => a.state === st.code && a.profile === selectedProfile
                            );
                            return (
                              <button
                                key={st.code}
                                onClick={() =>
                                  toggleStateApplicability(
                                    "question",
                                    item.content.id,
                                    st.code,
                                    selectedProfile
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                                  active
                                    ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                                    : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                                }`}
                                title={`${st.name} (${selectedProfile}) kapsamını aç/kapat`}
                              >
                                {st.code}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => applyAllPhase1States("question", item.content.id)}
                            className="px-2 py-1.5 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-semibold ml-1"
                            title="Faz 1 (CA, TX, FL, NY) eyaletlerinin tamamını işaretle"
                          >
                            +Faz 1
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ortak Dersler */}
              {catalog.lessons.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <BookOpen size={16} className="text-emerald-400" />
                    Kanonik Ders Notları ({catalog.lessons.length})
                  </h3>
                  <div className="space-y-2.5">
                    {catalog.lessons.map((item) => {
                      const topicMeta = getTopicMeta(item.content.topic);
                      return (
                        <div
                          key={item.content.id}
                          className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] px-2 py-0.5 rounded border ${topicMeta.badgeClass}`}>
                                {topicMeta.titleTr}
                              </span>
                              <span className="text-sm font-bold text-white">{item.content.title}</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{item.content.body}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {STATES.map((st) => {
                              const active = item.applicability.some(
                                (a) => a.state === st.code && a.profile === selectedProfile
                              );
                              return (
                                <button
                                  key={st.code}
                                  onClick={() =>
                                    toggleStateApplicability(
                                      "lesson",
                                      item.content.id,
                                      st.code,
                                      selectedProfile
                                    )
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                                    active
                                      ? "bg-emerald-600 text-white border-emerald-400"
                                      : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                                  }`}
                                >
                                  {st.code}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => applyAllPhase1States("lesson", item.content.id)}
                              className="px-2 py-1.5 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold ml-1"
                            >
                              +Faz 1
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SIMULATOR MODE
  const currentQ = simQuestions[simIndex];
  const evaluation = simFinished
    ? evaluate(simQuestions, simAnswers, simMode === "exam" ? examRule : null)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sol Kolon: Paket Doğrulama & Simülasyon Başlatıcı */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 h-fit">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={19} className="text-emerald-400" />
            Canlı Mobil Sınav Simülatörü &amp; Paket Denetimi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hazırladığınız taslağı yayınlamadan önce gerçek mobil sınav motoruyla (
            <code className="text-blue-300">assembleExam</code> &amp;{" "}
            <code className="text-blue-300">evaluate</code>) test edin.
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => startSimulation("exam")}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-blue-600/20 transition"
          >
            <span className="flex items-center gap-2">
              <Play size={15} /> Resmi Deneme Sınavı Simüle Et ({examRule.questionCount || "?"} Soru)
            </span>
            <span className="font-mono text-[11px] opacity-80">Exam Mode</span>
          </button>

          <button
            onClick={() => startSimulation("practice")}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Play size={15} className="text-emerald-400" /> Hızlı Pratik Simüle Et (Max 10 Soru)
            </span>
            <span className="font-mono text-[11px] text-slate-400">Practice Mode</span>
          </button>

          <button
            onClick={() => startSimulation("daily")}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Play size={15} className="text-amber-400" /> Günlük Görev Simüle Et (5 Soru)
            </span>
            <span className="font-mono text-[11px] text-slate-400">Daily Challenge</span>
          </button>
        </div>

        {/* Konu Kota Kontrolü */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Taslak Havuz &amp; Sınav Kotası Özeti
          </h3>
          <div className="text-xs space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Toplam Taslak Sorusu:</span>
              <span className="font-mono font-bold text-white">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Toplam Ders / İşaret Notu:</span>
              <span className="font-mono font-bold text-white">{lessons.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sınav Kuralı Hedefi:</span>
              <span className="font-mono font-bold text-blue-300">
                {examRule.questionCount > 0
                  ? `${examRule.questionCount} soru (Min ${examRule.minimumCorrect} doğru)`
                  : "Tanımlanmadı"}
              </span>
            </div>
            {examRule.sections.map((sec) => {
              const have = questions.filter((q) => q.topic === sec.topic).length;
              const ok = have >= sec.questionCount;
              return (
                <div key={sec.topic} className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Alt Kota ({sec.topic}):</span>
                  <span className={`font-mono font-bold ${ok ? "text-emerald-400" : "text-red-400"}`}>
                    Havuzda {have} / Gereken {sec.questionCount} (Min {sec.minimumCorrect})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sağ Kolon: İnteraktif Mobil Önizleme Ekranı */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {simQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Play size={36} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Simülasyon Hazır</h3>
            <p className="text-xs max-w-md mx-auto">
              Soldaki butonlardan birine tıklayarak hazırladığınız soruları tıpkı mobil uygulamadaki kullanıcı gibi çözebilir ve geçme/kalma motorunu test edebilirsiniz.
            </p>
          </div>
        ) : simFinished && evaluation ? (
          <div className="space-y-5">
            <div
              className={`p-5 rounded-2xl border ${
                evaluation.passed === true
                  ? "bg-emerald-950/50 border-emerald-700"
                  : evaluation.passed === false
                  ? "bg-red-950/50 border-red-700"
                  : "bg-blue-950/50 border-blue-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">
                  {evaluation.passed === true
                    ? "🎉 SINAV GEÇİLDİ (PASSED)"
                    : evaluation.passed === false
                    ? "❌ SINAV GEÇİLEMEDİ (FAILED)"
                    : "✅ PRATİK TAMAMLANDI"}
                </h3>
                <span className="text-2xl font-mono font-bold text-white">
                  {evaluation.correct}/{evaluation.total} (%{evaluation.percentage})
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Doğru: {evaluation.correct} · Yanlış: {evaluation.wrong} · Boş: {evaluation.unanswered}
              </p>
              {evaluation.sections.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1">
                  <p className="text-xs font-bold text-slate-200">Alt Bölüm Baraj Sonuçları:</p>
                  {evaluation.sections.map((s) => (
                    <div key={s.topic} className="flex justify-between text-xs">
                      <span>{getTopicMeta(s.topic).titleTr}</span>
                      <span
                        className={`font-mono font-bold ${
                          s.correct >= s.required ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {s.correct} doğru / En az {s.required} gerekli{" "}
                        {s.correct >= s.required ? "✓" : "✕"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => startSimulation(simMode)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Yeniden Başlat
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold font-mono">
                  Soru {simIndex + 1} / {simQuestions.length}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border ${getTopicMeta(currentQ.topic).badgeClass}`}>
                  {getTopicMeta(currentQ.topic).titleTr}
                </span>
              </div>
              <button
                onClick={() => setSimFinished(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Oturumu Bitir &amp; Sonucu Gör
              </button>
            </div>

            {currentQ.imageUrl && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-center">
                <img
                  src={currentQ.imageUrl}
                  alt="Question visual"
                  className="max-h-44 object-contain rounded-lg"
                />
              </div>
            )}

            <p className="text-base font-bold text-white leading-relaxed">{currentQ.prompt}</p>

            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const selected = simAnswers[currentQ.id];
                const isSelected = selected === idx;
                const showFeedback = simMode !== "exam" && selected !== undefined;
                const isCorrect = currentQ.correctIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setSimAnswers((prev) => ({
                        ...prev,
                        [currentQ.id]: idx,
                      }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center justify-between transition ${
                      showFeedback
                        ? isCorrect
                          ? "bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold"
                          : isSelected
                          ? "bg-red-950/70 border-red-500 text-red-200"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                        : isSelected
                        ? "bg-blue-950/80 border-blue-500 text-white font-semibold"
                        : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {showFeedback && isCorrect && <Check size={16} className="text-emerald-400" />}
                    {showFeedback && isSelected && !isCorrect && <X size={16} className="text-red-400" />}
                  </button>
                );
              })}
            </div>

            {simMode !== "exam" && simAnswers[currentQ.id] !== undefined && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-200">
                  <strong className="text-blue-400">Açıklama:</strong> {currentQ.explanation}
                </p>
                <p className="text-slate-500">
                  Kaynak: {currentQ.source.title} — {currentQ.source.section}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                disabled={simIndex === 0}
                onClick={() => setSimIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200"
              >
                ← Önceki Soru
              </button>
              {simIndex < simQuestions.length - 1 ? (
                <button
                  onClick={() => setSimIndex((i) => i + 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
                >
                  Sonraki Soru →
                </button>
              ) : (
                <button
                  onClick={() => setSimFinished(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Sınavı Tamamla ✓
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
