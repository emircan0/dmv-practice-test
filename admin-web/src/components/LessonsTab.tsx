import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Lesson } from "../../../src/us/model";
import {
  ADMIN_TOPICS,
  buildStarterLessons,
  getTopicMeta,
  STATE_HANDBOOKS,
} from "../presets";

interface LessonsTabProps {
  selectedState: string;
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  triggerStatus: (type: "success" | "error", text: string) => void;
}

export const LessonsTab: React.FC<LessonsTabProps> = ({
  selectedState,
  lessons,
  setLessons,
  triggerStatus,
}) => {
  const hb = STATE_HANDBOOKS[selectedState] || STATE_HANDBOOKS.CA;
  const today = new Date().toISOString().slice(0, 10);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [topic, setTopic] = useState("road-signs");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceTitle, setSourceTitle] = useState(hb.handbookTitle);
  const [sourceUrl, setSourceUrl] = useState(hb.handbookUrl);
  const [sourceSection, setSourceSection] = useState("Traffic Signs");
  const [sourceReviewedAt, setSourceReviewedAt] = useState(today);

  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("ALL");

  const resetForm = (stateCode = selectedState) => {
    const meta = STATE_HANDBOOKS[stateCode] || STATE_HANDBOOKS.CA;
    setEditingId(null);
    setTopic("road-signs");
    setTitle("");
    setBody("");
    setSourceTitle(meta.handbookTitle);
    setSourceUrl(meta.handbookUrl);
    setSourceSection("Traffic Signs");
    setSourceReviewedAt(new Date().toISOString().slice(0, 10));
  };

  const handleSaveLesson = () => {
    if (!title.trim() || !body.trim()) {
      triggerStatus("error", "Lütfen ders başlığını ve ders içeriğini doldurun.");
      return;
    }
    if (!sourceUrl.trim().startsWith("https://")) {
      triggerStatus("error", "Kaynak URL'si 'https://' ile başlamalıdır.");
      return;
    }

    const lessonObj: Lesson = {
      id:
        editingId ||
        `lesson-${selectedState.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic: topic.trim(),
      title: title.trim(),
      body: body.trim(),
      source: {
        title: sourceTitle.trim() || hb.handbookTitle,
        url: sourceUrl.trim(),
        section: sourceSection.trim() || getTopicMeta(topic).titleEn,
        reviewedAt: sourceReviewedAt || today,
      },
    };

    if (editingId) {
      setLessons((prev) => prev.map((l) => (l.id === editingId ? lessonObj : l)));
      triggerStatus("success", "Ders notu güncellendi.");
    } else {
      setLessons((prev) => [...prev, lessonObj]);
      triggerStatus("success", "Yeni ders notu eklendi.");
    }
    resetForm();
  };

  const handleEdit = (l: Lesson) => {
    setEditingId(l.id);
    setTopic(l.topic);
    setTitle(l.title);
    setBody(l.body);
    setSourceTitle(l.source.title);
    setSourceUrl(l.source.url);
    setSourceSection(l.source.section);
    setSourceReviewedAt(l.source.reviewedAt.slice(0, 10));
  };

  const handleDuplicate = (l: Lesson) => {
    const copy: Lesson = {
      ...l,
      id: `${l.id}-copy-${Date.now().toString().slice(-4)}`,
      title: `${l.title} (Copy)`,
    };
    setLessons((prev) => [...prev, copy]);
    triggerStatus("success", "Ders notu kopyalandı.");
  };

  const moveLesson = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= lessons.length) return;
    const copy = [...lessons];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setLessons(copy);
  };

  const loadSampleLessons = () => {
    const samples = buildStarterLessons(selectedState);
    const existingIds = new Set(lessons.map((l) => l.id));
    const toAdd = samples.filter((s) => !existingIds.has(s.id));
    setLessons([...lessons, ...toAdd]);
    triggerStatus(
      "success",
      `${selectedState} için ${toAdd.length} adet resmi el kitabı referanslı ders/işaret notu eklendi.`
    );
  };

  const filteredLessons = lessons.filter((l) => {
    if (topicFilter !== "ALL" && l.topic !== topicFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.body.toLowerCase().includes(q) ||
      l.topic.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sol: Ders Formu */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit sticky top-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {editingId ? (
              <Edit2 size={17} className="text-amber-400" />
            ) : (
              <Plus size={17} className="text-emerald-400" />
            )}
            {editingId ? "Ders Notunu Düzenle" : "Yeni Ders / İşaret Notu Ekle"}
          </h2>
          <button
            onClick={loadSampleLessons}
            className="text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
          >
            <Sparkles size={12} /> +5 Hazır Ders Yükle
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Burada eklediğiniz dersler mobil uygulamadaki <strong>Learn</strong> ve <strong>Study Notes (/notes)</strong> ekranlarında görünür.
        </p>

        <div className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Konu Başlığı (Topic ID)
            </label>
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setSourceSection(getTopicMeta(e.target.value).titleEn);
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
              Ders / Not Başlığı (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Standard Road Sign Shapes & Colors"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Ders İçeriği (Body)
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="İngilizce ders özetini, maddeleri ve ipuçlarını buraya yazın..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Resmi Kaynak Bilgisi */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Resmi El Kitabı Kaynağı (Zorunlu)
              </span>
              <button
                type="button"
                onClick={() => {
                  setSourceTitle(hb.handbookTitle);
                  setSourceUrl(hb.handbookUrl);
                  setSourceSection(getTopicMeta(topic).titleEn);
                  setSourceReviewedAt(today);
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                {selectedState} Varsayılanını Doldur
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Kaynak Adı</label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">El Kitabı Bölümü</label>
                <input
                  type="text"
                  value={sourceSection}
                  onChange={(e) => setSourceSection(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-400 mb-0.5">Resmi Kaynak URL (https://)</label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">İnceleme Tarihi</label>
                <input
                  type="date"
                  value={sourceReviewedAt}
                  onChange={(e) => setSourceReviewedAt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSaveLesson}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              {editingId ? "Ders Değişikliklerini Kaydet" : "Ders Notunu Listeye Ekle"}
            </button>
            {editingId && (
              <button
                onClick={() => resetForm()}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition"
              >
                İptal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sağ: Ders Listesi */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders başlığı veya içerikte ara..."
              className="bg-transparent text-xs text-white focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">Tüm Konular ({lessons.length})</option>
              {ADMIN_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titleTr} ({lessons.filter((l) => l.topic === t.id).length})
                </option>
              ))}
            </select>

            {lessons.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Tüm ders notlarını temizlemek istediğinize emin misiniz?")) {
                    setLessons([]);
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <BookOpen size={36} className="mx-auto text-slate-600 mb-3" />
            <h4 className="text-white font-semibold mb-1">Henüz ders veya işaret notu yok</h4>
            <p className="text-xs max-w-md mx-auto mb-4">
              iOS yayın kontrolünün (<code className="text-blue-300">release:check:ios</code>) geçmesi ve kullanıcıların konu özetlerine çalışabilmesi için her eyalet paketinde en az 1 ders notu bulunmalıdır.
            </p>
            <button
              onClick={loadSampleLessons}
              className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              {selectedState} İçin 5 Temel Ders Notunu Yükle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map((l, idx) => {
              const tMeta = getTopicMeta(l.topic);
              return (
                <div
                  key={l.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-800/60">
                        {idx + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${tMeta.badgeClass}`}>
                        {tMeta.titleTr}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{l.id}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveLesson(idx, -1)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Yukarı Taşı"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveLesson(idx, 1)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Aşağı Taşı"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(l)}
                        className="p-1 text-slate-400 hover:text-blue-400"
                        title="Kopyala"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(l)}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="Düzenle"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Bu ders notunu silmek istediğinize emin misiniz?")) {
                            setLessons((prev) => prev.filter((item) => item.id !== l.id));
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white">{l.title}</h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-950/60 p-3 rounded-lg border border-slate-800/70">
                    {l.body}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                    <span>
                      📚 <strong>Kaynak:</strong> {l.source.title} · {l.source.section} (İnceleme: {l.source.reviewedAt.slice(0, 10)})
                    </span>
                    <a
                      href={l.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={11} /> Kaynak Bağlantısı
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
