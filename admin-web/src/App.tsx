import React, { useState, useEffect } from "react";
import type {
  CandidateProfile,
  ExamRule,
  Lesson,
  Question,
} from "../../src/us/model";
import { assembleExam, validateRelease } from "../../src/us/engine";
import { STATES } from "../../src/us/states";
import {
  supabase,
  isUsingServiceRole,
  getStorageBucket,
} from "./supabase";
import {
  ADMIN_TOPICS,
  buildPresetRule,
  buildStarterLessons,
  buildStarterQuestions,
  getTopicMeta,
  STATE_HANDBOOKS,
} from "./presets";
import { OverviewAndAnalyticsTab } from "./components/OverviewAndAnalyticsTab";
import { LessonsTab } from "./components/LessonsTab";
import { RulesAndReleasesTab } from "./components/RulesAndReleasesTab";
import { CatalogAndSimulatorTab } from "./components/CatalogAndSimulatorTab";
import { LeaderboardAndSettingsTab } from "./components/LeaderboardAndSettingsTab";
import {
  Plus,
  Trash2,
  Upload,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  FileCheck,
  Globe,
  RefreshCw,
  Edit2,
  LayoutDashboard,
  Layers,
  Play,
  Trophy,
  Settings,
  Search,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Image as ImageIcon,
  Shuffle,
  ExternalLink,
} from "lucide-react";

type AdminTab =
  | "overview"
  | "questions"
  | "lessons"
  | "rules"
  | "catalog"
  | "simulator"
  | "import"
  | "published"
  | "leaderboard"
  | "settings";

const DRAFT_STORAGE_KEY = "dmv_us_admin_active_draft_v4";

const emptyRule = (state: string, profile: CandidateProfile): ExamRule => {
  const hb = STATE_HANDBOOKS[state] || STATE_HANDBOOKS.CA;
  return {
    id: `rule-${state.toLowerCase()}-${profile}`,
    version: "1.0",
    state,
    vehicle: "car",
    profile,
    questionCount: 0,
    minimumCorrect: 0,
    durationSeconds: null,
    sections: [],
    verifiedAt: "",
    sourceUrl: hb.examInfoUrl,
  };
};

export default function App() {
  const [selectedState, setSelectedState] = useState("CA");
  const [selectedProfile, setSelectedProfile] =
    useState<CandidateProfile>("general-first");
  const [questions, setQuestions] = useState<Question[]>(() =>
    buildStarterQuestions("CA")
  );
  const [lessons, setLessons] = useState<Lesson[]>(() =>
    buildStarterLessons("CA")
  );
  const [examRule, setExamRule] = useState<ExamRule>(() => ({
    ...buildPresetRule("CA", "general-first"),
    durationSeconds: 1800,
    sections: [{ topic: "road-signs", questionCount: 8, minimumCorrect: 6 }],
  }));
  const [reviewerName, setReviewerName] = useState("Editorial Team");

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [publishedReleases, setPublishedReleases] = useState<any[]>([]);

  // Question Form State
  const hb = STATE_HANDBOOKS[selectedState] || STATE_HANDBOOKS.CA;
  const today = new Date().toISOString().slice(0, 10);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("road-signs");
  const [newPrompt, setNewPrompt] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSourceTitle, setNewSourceTitle] = useState(hb.handbookTitle);
  const [newSourceUrl, setNewSourceUrl] = useState(hb.handbookUrl);
  const [newSourceSection, setNewSourceSection] = useState("Traffic Signs");
  const [newSourceReviewedAt, setNewSourceReviewedAt] = useState(today);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Question List Filters
  const [qSearch, setQSearch] = useState("");
  const [qTopicFilter, setQTopicFilter] = useState("ALL");

  // JSON Import / Export State
  const [jsonInput, setJsonInput] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");

  const triggerStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
  };

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedState) setSelectedState(parsed.selectedState);
        if (parsed.selectedProfile) setSelectedProfile(parsed.selectedProfile);
        if (Array.isArray(parsed.questions)) setQuestions(parsed.questions);
        if (Array.isArray(parsed.lessons)) setLessons(parsed.lessons);
        if (parsed.examRule) setExamRule(parsed.examRule);
        if (parsed.reviewerName) setReviewerName(parsed.reviewerName);
      }
    } catch {
      // ignore
    }
    fetchReleases();
  }, []);

  // Auto-save draft changes
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          selectedState,
          selectedProfile,
          questions,
          lessons,
          examRule,
          reviewerName,
        })
      );
    } catch {
      // ignore
    }
  }, [selectedState, selectedProfile, questions, lessons, examRule, reviewerName]);

  const fetchReleases = async () => {
    try {
      const { data, error } = await supabase
        .from("us_content_releases")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPublishedReleases(data || []);
    } catch (err: any) {
      console.error("Error fetching releases:", err);
    }
  };

  const resetQuestionForm = (stateCode = selectedState) => {
    const meta = STATE_HANDBOOKS[stateCode] || STATE_HANDBOOKS.CA;
    setEditingQuestionId(null);
    setNewPrompt("");
    setNewOptions(meta.defaultOptionsCount === 3 ? ["", "", ""] : ["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewExplanation("");
    setNewImageUrl("");
    setNewSourceTitle(meta.handbookTitle);
    setNewSourceUrl(meta.handbookUrl);
    setNewSourceSection(getTopicMeta(newTopic).titleEn);
    setNewSourceReviewedAt(new Date().toISOString().slice(0, 10));
  };

  const changeScope = (state: string, profile: CandidateProfile) => {
    if (state === selectedState && profile === selectedProfile) return;

    const starterQs = buildStarterQuestions(state);
    const starterLs = buildStarterLessons(state);
    const presetRule = buildPresetRule(state, profile);

    setSelectedState(state);
    setSelectedProfile(profile);
    setQuestions(starterQs);
    setLessons(starterLs);
    setExamRule(presetRule);
    resetQuestionForm(state);
    setJsonInput("");
    triggerStatus(
      "success",
      `${state} (${profile}) hazır sınav paketi yüklendi: ${starterQs.length} soru, ${starterLs.length} ders notu ve resmi sınav kuralı.`
    );
  };

  const loadFullReleaseToDraft = (rel: any) => {
    const targetState = rel.state;
    const targetProfile = rel.profile as CandidateProfile;
    const hbMeta = STATE_HANDBOOKS[targetState] || STATE_HANDBOOKS.CA;

    setSelectedState(targetState);
    setSelectedProfile(targetProfile);
    setQuestions(rel.payload?.questions || []);
    setLessons(rel.payload?.lessons || []);
    setExamRule(
      rel.payload?.rule
        ? { ...rel.payload.rule, state: targetState, profile: targetProfile }
        : emptyRule(targetState, targetProfile)
    );
    if (rel.reviewer) setReviewerName(rel.reviewer);
    setNewSourceTitle(hbMeta.handbookTitle);
    setNewSourceUrl(hbMeta.handbookUrl);
    setActiveTab("questions");
    triggerStatus(
      "success",
      `${targetState} (${targetProfile}) v${rel.version} paketi (${rel.payload?.questions?.length || 0} soru, ${rel.payload?.lessons?.length || 0} ders) taslağa yüklendi.`
    );
  };

  const handleSaveQuestion = () => {
    const trimmedOpts = newOptions.map((o) => o.trim());
    if (!newPrompt.trim() || trimmedOpts.length < 2 || trimmedOpts.some((o) => !o)) {
      alert("Lütfen soru metnini ve tüm seçenekleri eksiksiz doldurun.");
      return;
    }
    if (new Set(trimmedOpts).size !== trimmedOpts.length) {
      alert("Seçeneklerin tamamı birbirinden farklı olmalıdır (Tekrarlayan şık var).");
      return;
    }
    const validSourceUrl = newSourceUrl.trim().startsWith("https://")
      ? newSourceUrl.trim()
      : hb.handbookUrl;

    const questionData: Question = {
      id:
        editingQuestionId ||
        `q-${selectedState.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic: newTopic.trim(),
      prompt: newPrompt.trim(),
      options: trimmedOpts,
      correctIndex: Math.min(newCorrectIndex, trimmedOpts.length - 1),
      explanation:
        newExplanation.trim() ||
        `Correct answer: ${trimmedOpts[Math.min(newCorrectIndex, trimmedOpts.length - 1)]}`,
      source: {
        title: newSourceTitle.trim() || hb.handbookTitle,
        url: validSourceUrl,
        section: newSourceSection.trim() || getTopicMeta(newTopic).titleEn,
        reviewedAt: newSourceReviewedAt || today,
      },
      imageUrl: newImageUrl.trim() ? newImageUrl.trim() : undefined,
    };

    if (editingQuestionId) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestionId ? questionData : q))
      );
      triggerStatus("success", "Soru güncellendi.");
    } else {
      setQuestions((prev) => [...prev, questionData]);
      triggerStatus("success", "Yeni soru taslak havuzuna eklendi.");
    }
    resetQuestionForm();
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setNewTopic(q.topic);
    setNewPrompt(q.prompt);
    setNewOptions([...q.options]);
    setNewCorrectIndex(q.correctIndex);
    setNewExplanation(q.explanation);
    setNewImageUrl(q.imageUrl || "");
    setNewSourceTitle(q.source?.title || hb.handbookTitle);
    setNewSourceUrl(q.source?.url || hb.handbookUrl);
    setNewSourceSection(q.source?.section || getTopicMeta(q.topic).titleEn);
    setNewSourceReviewedAt((q.source?.reviewedAt || today).slice(0, 10));
    setActiveTab("questions");
  };

  const handleDuplicateQuestion = (q: Question) => {
    const copy: Question = {
      ...q,
      id: `${q.id}-copy-${Date.now().toString().slice(-4)}`,
      prompt: `${q.prompt} (Copy)`,
    };
    setQuestions((prev) => [...prev, copy]);
    triggerStatus("success", "Soru kopyalandı.");
  };

  const moveQuestion = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setQuestions(copy);
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const bucket = getStorageBucket();
      const ext = file.name.split(".").pop() || "png";
      const filePath = `${selectedState.toLowerCase()}/q_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setNewImageUrl(data.publicUrl);
      triggerStatus("success", "Görsel Supabase Storage'a yüklendi ve URL eklendi.");
    } catch (err: any) {
      triggerStatus(
        "error",
        `Görsel yüklenemedi (${err.message}). Ayarlar sekmesinden Storage Bucket adını ve Service Role Key'i kontrol edin veya doğrudan https:// görsel URL'si girin.`
      );
    } finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  };

  const loadFullStarterBundle = () => {
    const sampleQs = buildStarterQuestions(selectedState);
    const sampleLs = buildStarterLessons(selectedState);
    const preset = buildPresetRule(selectedState, selectedProfile);

    setQuestions(sampleQs);
    setLessons(sampleLs);
    setExamRule({
      ...preset,
      durationSeconds: preset.durationSeconds ?? 1800,
    });

    triggerStatus(
      "success",
      `${selectedState} için ${sampleQs.length} soru, ${sampleLs.length} ders notu ve doğrulanmış resmi sınav kuralı yüklendi!`
    );
  };

  const normalizeAllSourcesToCurrentState = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        source: {
          title: q.source?.title || hb.handbookTitle,
          url: q.source?.url?.startsWith("https://") ? q.source.url : hb.handbookUrl,
          section: q.source?.section || getTopicMeta(q.topic).titleEn,
          reviewedAt: q.source?.reviewedAt || today,
        },
      }))
    );
    setLessons((prev) =>
      prev.map((l) => ({
        ...l,
        source: {
          title: l.source?.title || hb.handbookTitle,
          url: l.source?.url?.startsWith("https://") ? l.source.url : hb.handbookUrl,
          section: l.source?.section || getTopicMeta(l.topic).titleEn,
          reviewedAt: l.source?.reviewedAt || today,
        },
      }))
    );
    triggerStatus(
      "success",
      `Tüm soruların ve derslerin eksik kaynak URL'leri ${selectedState} (${hb.handbookTitle}) ile tamamlandı.`
    );
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.state || parsed.profile) {
        const release = validateRelease(parsed, selectedState, selectedProfile);
        if (release.rule) assembleExam(release.questions, release.rule);
        setQuestions(release.questions);
        setLessons(release.lessons);
        setExamRule(release.rule ?? emptyRule(selectedState, selectedProfile));
        setJsonInput("");
        setActiveTab("questions");
        triggerStatus(
          "success",
          `Doğrulanmış ${selectedState} (${selectedProfile}) paketi (${release.questions.length} soru, ${release.lessons.length} ders) içe aktarıldı.`
        );
        return;
      }

      const rawQuestions: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.questions)
        ? parsed.questions
        : [];
      const rawLessons: any[] = Array.isArray(parsed.lessons) ? parsed.lessons : [];

      if (rawQuestions.length === 0 && rawLessons.length === 0) {
        alert("JSON formatı hatalı: Bir soru dizisi veya { questions: [...], lessons: [...] } objesi olmalıdır.");
        return;
      }

      const formattedQs: Question[] = rawQuestions.map((q, idx) => ({
        id: q.id || `q-${selectedState.toLowerCase()}-${Date.now()}-${idx}`,
        topic: q.topic || "road-signs",
        prompt: q.prompt || q.question || q.content || "",
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex:
          typeof q.correctIndex === "number" ? q.correctIndex : q.correct_option ?? 0,
        explanation: q.explanation || "See official state driver handbook.",
        source: {
          title: q.source?.title || hb.handbookTitle,
          url: q.source?.url?.startsWith("https://") ? q.source.url : hb.handbookUrl,
          section: q.source?.section || q.topic || "General",
          reviewedAt: q.source?.reviewedAt || today,
        },
        imageUrl: q.imageUrl || q.image_url || undefined,
      }));

      const formattedLs: Lesson[] = rawLessons.map((l, idx) => ({
        id: l.id || `lesson-${selectedState.toLowerCase()}-${Date.now()}-${idx}`,
        topic: l.topic || "road-signs",
        title: l.title || "Study Note",
        body: l.body || l.content || "",
        source: {
          title: l.source?.title || hb.handbookTitle,
          url: l.source?.url?.startsWith("https://") ? l.source.url : hb.handbookUrl,
          section: l.source?.section || l.topic || "General",
          reviewedAt: l.source?.reviewedAt || today,
        },
      }));

      setQuestions((prev) =>
        importMode === "replace" ? formattedQs : [...prev, ...formattedQs]
      );
      if (formattedLs.length > 0) {
        setLessons((prev) =>
          importMode === "replace" ? formattedLs : [...prev, ...formattedLs]
        );
      }
      setJsonInput("");
      setActiveTab("questions");
      triggerStatus(
        "success",
        `${formattedQs.length} soru ve ${formattedLs.length} ders başarıyla içe aktarıldı!`
      );
    } catch (e: any) {
      alert("Geçersiz JSON verisi: " + e.message);
    }
  };

  const handleExportCurrentDraft = () => {
    const now = new Date().toISOString();
    const versionStr = `1.0.${Date.now().toString().slice(-4)}`;
    const ruleData: ExamRule | null = examRule.verifiedAt
      ? {
          ...examRule,
          state: selectedState,
          profile: selectedProfile,
          sourceUrl: examRule.sourceUrl?.startsWith("https://")
            ? examRule.sourceUrl
            : hb.examInfoUrl,
        }
      : null;

    const draftRelease = {
      id: `release-${selectedState.toLowerCase()}-${selectedProfile}`,
      version: versionStr,
      state: selectedState,
      profile: selectedProfile,
      vehicle: "car",
      language: "en",
      publishedAt: now,
      rule: ruleData,
      questions,
      lessons,
    };

    const blob = new Blob([JSON.stringify(draftRelease, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `draft-${selectedState.toLowerCase()}-${selectedProfile}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishRelease = async () => {
    if (questions.length === 0) {
      alert("Yayınlamadan önce en az 1 soru eklemelisiniz.");
      return;
    }

    setIsPublishing(true);
    setStatusMessage(null);

    const versionStr = `1.0.${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const ruleData: ExamRule | null = examRule.verifiedAt
      ? {
          ...examRule,
          state: selectedState,
          profile: selectedProfile,
          sourceUrl: examRule.sourceUrl?.startsWith("https://")
            ? examRule.sourceUrl
            : hb.examInfoUrl,
        }
      : null;

    const payload = {
      rule: ruleData,
      questions,
      lessons,
    };

    try {
      const release = validateRelease(
        {
          ...payload,
          id: "pending",
          version: versionStr,
          state: selectedState,
          profile: selectedProfile,
          vehicle: "car",
          language: "en",
          publishedAt: now,
        },
        selectedState,
        selectedProfile
      );
      if (release.rule) assembleExam(release.questions, release.rule);

      const { error } = await supabase.from("us_content_releases").insert([
        {
          version: versionStr,
          state: selectedState,
          profile: selectedProfile,
          vehicle: "car",
          language: "en",
          status: "published",
          payload,
          reviewer: reviewerName.trim() || "Editorial Team",
          reviewed_at: now,
          published_at: now,
        },
      ]);

      if (error) throw error;

      setStatusMessage({
        type: "success",
        text: `Tebrikler! ${selectedState} (${selectedProfile}) için ${questions.length} soru ve ${lessons.length} ders başarıyla yayınlandı (v${versionStr})!`,
      });
      fetchReleases();
    } catch (err: any) {
      console.error("Publish error:", err);
      const errMsg = err?.message || err?.details || err?.error_description || (typeof err === "object" ? JSON.stringify(err) : String(err)) || "Bilinmeyen hata";
      const hint =
        errMsg.includes("us_content_releases_profile_check")
          ? " 💡 Supabase veritabanınızda 'general-first' profil izni eksik! Ayarlar & Yetki sekmesindeki 3 satırlık SQL kodunu Supabase Dashboard > SQL Editor'e yapıştırıp Run deyin veya üst menüden geçici olarak 'adult-first' seçip yayınlayın."
          : err.message === "invalid_release"
          ? " (Tüm soruların/derslerin https:// kaynak URL'si ve benzersiz ID/şıklara sahip olduğundan emin olun. 'Eksik Kaynakları Düzelt' butonunu kullanabilirsiniz.)"
          : err.message === "insufficient_content"
          ? " (Sınav kuralındaki soru sayısı havuzdaki soru sayısından fazla! Sınav Kuralları sekmesinden 'Havuza Uyarla' butonuna basın.)"
          : !isUsingServiceRole
          ? " (RLS hatası alıyorsanız Ayarlar & Yetki sekmesinden Supabase Service Role Key girin.)"
          : "";
      setStatusMessage({
        type: "error",
        text: "Yayınlama başarısız oldu: " + errMsg + hint,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (qTopicFilter !== "ALL" && q.topic !== qTopicFilter) return false;
    if (!qSearch.trim()) return true;
    const s = qSearch.toLowerCase();
    return (
      q.prompt.toLowerCase().includes(s) ||
      q.explanation.toLowerCase().includes(s) ||
      q.id.toLowerCase().includes(s) ||
      q.topic.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Üst Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            🇺🇸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                DMV Smart Prep
              </h1>
              <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full font-mono">
                US Control Center
              </span>
              <button
                onClick={() => setActiveTab("settings")}
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border transition ${
                  isUsingServiceRole
                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-700/70"
                    : "bg-amber-950/90 text-amber-300 border-amber-700/70 hover:bg-amber-900"
                }`}
                title="Supabase bağlantı ve Service Role yetki ayarlarını aç"
              >
                {isUsingServiceRole ? "✓ Tam Yetki (Service Role)" : "⚠ Salt Okunur (Anon Key)"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              8 Eyalet · Soru, Ders/İşaret, Sınav Kuralı, Ortak Katalog, Simülatör &amp; Canlı Analitik
            </p>
          </div>
        </div>

        {/* Eyalet & Profil Seçici */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 px-2">
            <Globe size={15} className="text-blue-400" />
            <select
              value={selectedState}
              onChange={(e) => changeScope(e.target.value, selectedProfile)}
              className="bg-slate-900 text-white font-semibold text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code}) — Faz {st.phase}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedProfile}
            onChange={(e) =>
              changeScope(selectedState, e.target.value as CandidateProfile)
            }
            className="bg-slate-900 text-white font-semibold text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="general-first">Ortak Çalışma (general-first)</option>
            <option value="adult-first">Adult 18+ (adult-first)</option>
            <option value="teen-first">Under 18 (teen-first)</option>
          </select>

          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="İnceleyen (Reviewer)"
            title="Paketi onaylayan editör / inceleyen adı"
            className="bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 w-32 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Yayınla ve Dışa Aktar Butonları */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrentDraft}
            disabled={questions.length === 0 && lessons.length === 0}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition"
            title="Mevcut taslağı JSON olarak indir"
          >
            <Download size={15} /> Taslak JSON
          </button>

          <button
            onClick={handlePublishRelease}
            disabled={isPublishing || questions.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-blue-600/25"
          >
            {isPublishing ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span>
              Canlıya Yayınla ({questions.length}S · {lessons.length}D)
            </span>
          </button>
        </div>
      </header>

      {/* Bildirim Kutusu */}
      {statusMessage && (
        <div
          className={`px-6 py-3 flex items-center justify-between text-xs font-medium border-b ${
            statusMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
              : "bg-red-950/90 border-red-800 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="opacity-75 hover:opacity-100 ml-4 shrink-0"
          >
            ✕ Kapat
          </button>
        </div>
      )}

      {/* Sekme Navigasyonu */}
      <nav className="border-b border-slate-800 bg-slate-900/60 px-6 flex overflow-x-auto gap-1 text-xs font-semibold">
        {(
          [
            { id: "overview", label: "Genel Bakış & Matris", icon: LayoutDashboard },
            { id: "questions", label: `Sorular (${questions.length})`, icon: HelpCircle },
            { id: "lessons", label: `Ders & İşaretler (${lessons.length})`, icon: BookOpen },
            {
              id: "rules",
              label: `Sınav Kuralları (${examRule.verifiedAt ? "✓" : "Pratik"})`,
              icon: FileCheck,
            },
            { id: "catalog", label: "Ortak Katalog", icon: Layers },
            { id: "simulator", label: "Canlı Simülatör", icon: Play },
            { id: "import", label: "JSON İçe/Dışa Aktar", icon: Upload },
            {
              id: "published",
              label: `Yayındaki Paketler (${publishedReleases.length})`,
              icon: Globe,
            },
            { id: "leaderboard", label: "Sıralama & Profiller", icon: Trophy },
            { id: "settings", label: "Ayarlar & Yetki", icon: Settings },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
                active
                  ? "border-blue-500 text-blue-400 bg-blue-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Ana İçerik */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* 1. GENEL BAKIŞ & MATRİS */}
        {activeTab === "overview" && (
          <OverviewAndAnalyticsTab
            publishedReleases={publishedReleases}
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            onSelectScope={(st, prof) => {
              changeScope(st, prof);
            }}
            onLoadReleaseToDraft={loadFullReleaseToDraft}
            onRefreshReleases={fetchReleases}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 2. SORULAR EDİTÖRÜ & HAVUZU */}
        {activeTab === "questions" && (
          <div className="space-y-5">
            {/* Konu Dağılım Özeti Çubuğu */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setQTopicFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    qTopicFilter === "ALL"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  Tümü ({questions.length})
                </button>
                {ADMIN_TOPICS.map((t) => {
                  const count = questions.filter((q) => q.topic === t.id).length;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setQTopicFilter(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        qTopicFilter === t.id
                          ? "bg-blue-600 text-white border-blue-400"
                          : count > 0
                          ? t.badgeClass
                          : "bg-slate-950 text-slate-500 border-slate-800/80"
                      }`}
                    >
                      {t.titleEn}: <strong>{count}</strong>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={normalizeAllSourcesToCurrentState}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Tüm soruların/derslerin eksik kaynak URL'lerini seçili eyaletin resmi el kitabıyla tamamla"
                >
                  Eksik Kaynakları Düzelt
                </button>
                <button
                  onClick={loadFullStarterBundle}
                  className="text-xs px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles size={13} /> + Tam Sınav Paketini Yükle (50 Soru + 10 Ders + Resmi Kural)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol: Soru Formu */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit sticky top-20 space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {editingQuestionId ? (
                      <Edit2 size={16} className="text-amber-400" />
                    ) : (
                      <Plus size={16} className="text-blue-400" />
                    )}
                    {editingQuestionId ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewOptions((prev) =>
                          prev.length === 3 ? [...prev, ""] : prev.slice(0, 3)
                        );
                        if (newCorrectIndex >= 3) setNewCorrectIndex(0);
                      }}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      {newOptions.length === 3 ? "4 Şık Yap" : "3 Şık Yap (CA)"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Konu / Kategori (Mobil Uygulama Uyumlu)
                  </label>
                  <select
                    value={newTopic}
                    onChange={(e) => {
                      setNewTopic(e.target.value);
                      setNewSourceSection(getTopicMeta(e.target.value).titleEn);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {ADMIN_TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.titleTr} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Soru Metni (Prompt — İngilizce)
                  </label>
                  <textarea
                    rows={3}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="What should you do when approaching a flashing red traffic light?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      Seçenekler (Doğru şıkkı işaretleyin)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const correctVal = newOptions[newCorrectIndex];
                        const copy = [...newOptions].sort(() => Math.random() - 0.5);
                        setNewOptions(copy);
                        setNewCorrectIndex(Math.max(0, copy.indexOf(correctVal)));
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Shuffle size={11} /> Şıkları Karıştır
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrectIndex === idx}
                          onChange={() => setNewCorrectIndex(idx)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400 w-4">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Seçenek ${String.fromCharCode(65 + idx)}`}
                          className={`flex-1 bg-slate-950 border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none ${
                            newCorrectIndex === idx
                              ? "border-emerald-500/80 bg-emerald-950/20"
                              : "border-slate-800"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Açıklama (Explanation — Zorunlu)
                  </label>
                  <textarea
                    rows={2}
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    placeholder="Doğru cevabın el kitabına dayalı açıklaması..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Görsel URL & Dosya Yükleme */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <ImageIcon size={13} /> Görsel URL (Opsiyonel, https://)
                    </label>
                    <label className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                      {uploadingImg ? "Yükleniyor..." : "+ Dosya Yükle (Storage)"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImageFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://.../sign.png"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  {newImageUrl.trim().startsWith("https://") && (
                    <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                      <img
                        src={newImageUrl.trim()}
                        alt="Preview"
                        className="h-14 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImageUrl("")}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Görseli Kaldır
                      </button>
                    </div>
                  )}
                </div>

                {/* Resmi Kaynak (Source) Alanları */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Resmi El Kitabı Kaynağı (Source)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewSourceTitle(hb.handbookTitle);
                        setNewSourceUrl(hb.handbookUrl);
                        setNewSourceSection(getTopicMeta(newTopic).titleEn);
                        setNewSourceReviewedAt(today);
                      }}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      {selectedState} Varsayılanı
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSourceTitle}
                      onChange={(e) => setNewSourceTitle(e.target.value)}
                      placeholder="El Kitabı Adı"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newSourceSection}
                      onChange={(e) => setNewSourceSection(e.target.value)}
                      placeholder="Bölüm / Konu"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                    />
                    <input
                      type="date"
                      value={newSourceReviewedAt}
                      onChange={(e) => setNewSourceReviewedAt(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveQuestion}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
                  >
                    {editingQuestionId ? "Değişiklikleri Kaydet" : "Soruyu Havuza Ekle"}
                  </button>
                  {editingQuestionId && (
                    <button
                      onClick={() => resetQuestionForm()}
                      className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </div>

              {/* Sağ: Soru Listesi */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search size={15} className="text-slate-400" />
                    <input
                      type="text"
                      value={qSearch}
                      onChange={(e) => setQSearch(e.target.value)}
                      placeholder="Soru metni, açıklama veya ID içinde ara..."
                      className="bg-transparent text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                  {questions.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Tüm soru listesini temizlemek istediğinize emin misiniz?"))
                          setQuestions([]);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Tümünü Temizle
                    </button>
                  )}
                </div>

                {filteredQuestions.length === 0 ? (
                  <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <div className="text-4xl mb-3">📝</div>
                    <h4 className="text-white font-semibold mb-1">
                      {questions.length === 0
                        ? "Henüz soru eklenmedi"
                        : "Arama kriterine uygun soru bulunamadı"}
                    </h4>
                    <p className="text-xs max-w-md mx-auto mb-4">
                      Sol taraftaki formu kullanarak manuel soru ekleyebilir veya tek tıkla {selectedState} eyaleti için hazır 50 soru + 10 ders + resmi sınav kuralı paketini yükleyebilirsiniz.
                    </p>
                    {questions.length === 0 && (
                      <button
                        onClick={loadFullStarterBundle}
                        className="bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 px-4 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        {selectedState} Tam Sınav Paketini Yükle (50 Soru + 10 Ders + Kural)
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions.map((q, idx) => {
                      const tMeta = getTopicMeta(q.topic);
                      const hasValidSource = q.source?.url?.startsWith("https://");
                      return (
                        <div
                          key={q.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-blue-950 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-800/50">
                                {idx + 1}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded border font-medium ${tMeta.badgeClass}`}
                              >
                                {tMeta.titleTr}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {q.id}
                              </span>
                              {!hasValidSource && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                  ⚠ Eksik https:// Kaynak URL
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveQuestion(idx, -1)}
                                className="text-slate-400 hover:text-white p-1"
                                title="Yukarı Taşı"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={() => moveQuestion(idx, 1)}
                                className="text-slate-400 hover:text-white p-1"
                                title="Aşağı Taşı"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                onClick={() => handleDuplicateQuestion(q)}
                                className="text-slate-400 hover:text-blue-400 p-1"
                                title="Kopyala"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => handleEditClick(q)}
                                className="text-slate-400 hover:text-amber-400 p-1"
                                title="Düzenle"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Bu soruyu silmek istediğinizden emin misiniz?")) {
                                    setQuestions(questions.filter((item) => item.id !== q.id));
                                  }
                                }}
                                className="text-slate-400 hover:text-red-400 p-1"
                                title="Sil"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {q.imageUrl && (
                            <div className="mb-3 bg-slate-950 border border-slate-800 rounded-lg p-2 inline-block">
                              <img
                                src={q.imageUrl}
                                alt="Question sign"
                                className="h-20 object-contain rounded"
                              />
                            </div>
                          )}

                          <p className="text-sm font-semibold text-white mb-3">{q.prompt}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                                  q.correctIndex === optIdx
                                    ? "bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 font-semibold"
                                    : "bg-slate-950/60 border border-slate-800/80 text-slate-400"
                                }`}
                              >
                                <span className="font-mono opacity-60">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                                {q.correctIndex === optIdx && (
                                  <CheckCircle2
                                    size={14}
                                    className="ml-auto text-emerald-400 shrink-0"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                            <p>
                              <strong className="text-slate-300">Açıklama:</strong> {q.explanation}
                            </p>
                            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>
                                Kaynak: {q.source?.title} — {q.source?.section} ({q.source?.reviewedAt?.slice(0, 10)})
                              </span>
                              {q.source?.url && (
                                <a
                                  href={q.source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink size={10} /> Kaynak URL
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. DERSLER & İŞARET NOTLARI */}
        {activeTab === "lessons" && (
          <LessonsTab
            selectedState={selectedState}
            lessons={lessons}
            setLessons={setLessons}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 4. SINAV KURALLARI */}
        {activeTab === "rules" && (
          <RulesAndReleasesTab
            mode="rules"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            examRule={examRule}
            setExamRule={setExamRule}
            questions={questions}
            lessons={lessons}
            publishedReleases={publishedReleases}
            onRefreshReleases={fetchReleases}
            onLoadFullRelease={loadFullReleaseToDraft}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 5. ORTAK KATALOG */}
        {activeTab === "catalog" && (
          <CatalogAndSimulatorTab
            mode="catalog"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            questions={questions}
            lessons={lessons}
            examRule={examRule}
            onUpdateDraft={(qs, ls) => {
              setQuestions(qs);
              setLessons(ls);
            }}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 6. CANLI SİMÜLATÖR */}
        {activeTab === "simulator" && (
          <CatalogAndSimulatorTab
            mode="simulator"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            questions={questions}
            lessons={lessons}
            examRule={examRule}
            onUpdateDraft={(qs, ls) => {
              setQuestions(qs);
              setLessons(ls);
            }}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 7. TOPLU JSON İÇE / DIŞA AKTAR */}
        {activeTab === "import" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload size={18} className="text-blue-400" />
                  Toplu JSON İçe / Dışa Aktarma Merkezi
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  İster tam <code className="text-blue-300">ContentRelease</code> paketi, ister soru/ders dizisi yapıştırın ya da bilgisayarınızdan <code className="text-blue-300">.json</code> dosyası seçin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as "append" | "replace")}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold"
                >
                  <option value="append">Mevcut Taslağa Ekle (Append)</option>
                  <option value="replace">Mevcut Taslağın Üzerine Yaz (Replace)</option>
                </select>

                <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-semibold cursor-pointer">
                  Dosyadan Seç (.json)
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setJsonInput(String(ev.target?.result || ""));
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              rows={13}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  "questions": [\n    {\n      "topic": "road-signs",\n      "prompt": "What does an octagonal red sign mean?",\n      "options": ["Stop completely", "Yield", "Slow down", "No entry"],\n      "correctIndex": 0,\n      "explanation": "An 8-sided red sign always means STOP."\n    }\n  ],\n  "lessons": []\n}`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleExportCurrentDraft}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <Download size={14} /> Mevcut Taslağı JSON Olarak İndir
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setJsonInput("")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Temizle
                </button>
                <button
                  onClick={handleJsonImport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
                >
                  JSON Verisini İçe Aktar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. YAYINLANMIŞ PAKETLER */}
        {activeTab === "published" && (
          <RulesAndReleasesTab
            mode="published"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            examRule={examRule}
            setExamRule={setExamRule}
            questions={questions}
            lessons={lessons}
            publishedReleases={publishedReleases}
            onRefreshReleases={fetchReleases}
            onLoadFullRelease={loadFullReleaseToDraft}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 9. LİDERLİK TABLOSU & PROFİLLER */}
        {activeTab === "leaderboard" && (
          <LeaderboardAndSettingsTab
            mode="leaderboard"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            triggerStatus={triggerStatus}
          />
        )}

        {/* 10. AYARLAR & SUPABASE YETKİSİ */}
        {activeTab === "settings" && (
          <LeaderboardAndSettingsTab
            mode="settings"
            selectedState={selectedState}
            selectedProfile={selectedProfile}
            triggerStatus={triggerStatus}
          />
        )}
      </main>
    </div>
  );
}
