import type { CandidateProfile, ExamRule, Lesson, Question } from "../../src/us/model";
import caGeneralFirst from "../../data/releases/ca-general-first.json";
import txGeneralFirst from "../../data/releases/tx-general-first.json";
import flGeneralFirst from "../../data/releases/fl-general-first.json";
import nyGeneralFirst from "../../data/releases/ny-general-first.json";

export interface TopicPreset {
  id: string;
  titleTr: string;
  titleEn: string;
  color: string;
  badgeClass: string;
  description: string;
}

export const ADMIN_TOPICS: TopicPreset[] = [
  {
    id: "road-signs",
    titleTr: "Yol İşaretleri (Road Signs)",
    titleEn: "Road Signs",
    color: "#0066FF",
    badgeClass: "bg-blue-950/80 text-blue-300 border-blue-700/60",
    description: "Dur, yol ver, uyarı, düzenleyici ve kılavuz levhalar (Sınav işaret kotası anahtarı: road-signs)",
  },
  {
    id: "signals-markings",
    titleTr: "Trafik Işıkları & Çizgiler (Signals & Markings)",
    titleEn: "Traffic Signals & Lane Markings",
    color: "#FF195C",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-700/60",
    description: "Trafik lambaları, oklar, sarı/beyaz şerit çizgileri ve kaldırım renkleri",
  },
  {
    id: "right-of-way",
    titleTr: "Geçiş Hakkı & Kavşaklar (Right of Way)",
    titleEn: "Right-of-Way & Intersections",
    color: "#9561FF",
    badgeClass: "bg-purple-950/80 text-purple-300 border-purple-700/60",
    description: "4 yönlü durak, kontrolsüz kavşaklar, döner kavşaklar, yaya ve acil araç geçiş üstünlüğü",
  },
  {
    id: "turns-passing",
    titleTr: "Dönüşler & Sollama (Turns & Passing)",
    titleEn: "Turns, Lanes & Passing",
    color: "#00A68A",
    badgeClass: "bg-teal-950/80 text-teal-300 border-teal-700/60",
    description: "Sağa/sola dönüş kuralları, U dönüşü, şerit değiştirme ve güvenli sollama",
  },
  {
    id: "speed-distance",
    titleTr: "Hız & Takip Mesafesi (Speed & Distance)",
    titleEn: "Speed Limits & Following Distance",
    color: "#FF9900",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-700/60",
    description: "Okul/yerleşim/otoyol hız sınırları, 3 saniye kuralı ve durma mesafesi",
  },
  {
    id: "parking",
    titleTr: "Park Etme Kuralları (Parking)",
    titleEn: "Parking Rules",
    color: "#0066FF",
    badgeClass: "bg-indigo-950/80 text-indigo-300 border-indigo-700/60",
    description: "Yokuşta park tekerlek yönü, yangın musluğu mesafesi ve park yasağı alanları",
  },
  {
    id: "safe-driving",
    titleTr: "Güvenli Sürüş (Safe Driving)",
    titleEn: "Safe Driving Practices",
    color: "#00A68A",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
    description: "Defansif sürüş, kör noktalar, ayna kontrolü, dikkat dağınıklığı ve emniyet kemeri",
  },
  {
    id: "alcohol-drugs",
    titleTr: "Alkol & Maddeler (Alcohol & Drugs)",
    titleEn: "Alcohol, Drugs & Implied Consent",
    color: "#FF195C",
    badgeClass: "bg-red-950/80 text-red-300 border-red-700/60",
    description: "BAC limitleri (0.08% / 21 yaş altı sıfır tolerans), Implied Consent ve DUI cezaları",
  },
  {
    id: "special-conditions",
    titleTr: "Özel Koşullar & Acil Durumlar (Special Conditions)",
    titleEn: "Special Conditions & Emergencies",
    color: "#9561FF",
    badgeClass: "bg-violet-950/80 text-violet-300 border-violet-700/60",
    description: "Gece sürüşü, sis, yağmur/kızaklama (hydroplaning), fren patlaması ve arıza",
  },
  {
    id: "sharing-the-road",
    titleTr: "Yolu Paylaşma (Sharing the Road)",
    titleEn: "Sharing the Road",
    color: "#FF9900",
    badgeClass: "bg-orange-950/80 text-orange-300 border-orange-700/60",
    description: "Okul otobüsleri, bisikletliler, motosikletler, yayalar, büyük kamyonlar (No-Zone) ve Move Over",
  },
];

export const getTopicMeta = (topicId: string): TopicPreset => {
  return (
    ADMIN_TOPICS.find((t) => t.id === topicId) || {
      id: topicId,
      titleTr: topicId,
      titleEn: topicId,
      color: "#64748B",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
      description: "Özel konu başlığı",
    }
  );
};

export interface StateHandbookMeta {
  code: string;
  name: string;
  agency: string;
  handbookTitle: string;
  handbookUrl: string;
  examInfoUrl: string;
  defaultQuestionCount: number;
  defaultMinCorrect: number;
  defaultDurationSeconds: number | null;
  defaultOptionsCount: 3 | 4;
  defaultSections: { topic: string; questionCount: number; minimumCorrect: number }[];
  notesTr: string;
}

export const STATE_HANDBOOKS: Record<string, StateHandbookMeta> = {
  CA: {
    code: "CA",
    name: "California",
    agency: "California DMV",
    handbookTitle: "California Driver's Handbook",
    handbookUrl: "https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/",
    examInfoUrl: "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/preparing-for-knowledge-and-drive-tests/",
    defaultQuestionCount: 36,
    defaultMinCorrect: 30,
    defaultDurationSeconds: 2700,
    defaultOptionsCount: 3,
    defaultSections: [{ topic: "road-signs", questionCount: 8, minimumCorrect: 6 }],
    notesTr: "California DMV yazılı sınavında geçme barajı yaklaşık %83 (36 soruda 30 doğru; bunun 8 tanesi yol işareti) ve 3 şıklı (A/B/C) soru yapısı kullanılır.",
  },
  TX: {
    code: "TX",
    name: "Texas",
    agency: "Texas DPS",
    handbookTitle: "Texas Driver Handbook",
    handbookUrl: "https://www.dps.texas.gov/section/driver-license/driver-license-services-brochures",
    examInfoUrl: "https://www.dps.texas.gov/section/driver-license/apply-texas-driver-license",
    defaultQuestionCount: 30,
    defaultMinCorrect: 21,
    defaultDurationSeconds: 1800,
    defaultOptionsCount: 4,
    defaultSections: [{ topic: "road-signs", questionCount: 6, minimumCorrect: 4 }],
    notesTr: "Texas DPS bilgi sınavı 30 sorudan oluşur ve geçmek için %70 (en az 21 doğru) gerekir.",
  },
  FL: {
    code: "FL",
    name: "Florida",
    agency: "FLHSMV",
    handbookTitle: "Official Florida Driver License Handbook",
    handbookUrl: "https://www.flhsmv.gov/resources/handbooks-manuals/",
    examInfoUrl: "https://www.flhsmv.gov/driver-licenses-id-cards/licensing-requirements-teens-graduated-driver-license-laws-driving-curfews/class-e-knowledge-exam-driving-skills-test/",
    defaultQuestionCount: 50,
    defaultMinCorrect: 40,
    defaultDurationSeconds: 3600,
    defaultOptionsCount: 4,
    defaultSections: [{ topic: "road-signs", questionCount: 10, minimumCorrect: 8 }],
    notesTr: "Florida Class E Knowledge Exam 50 sorudan oluşur ve geçmek için en az 40 doğru (%80) gerekir.",
  },
  NY: {
    code: "NY",
    name: "New York",
    agency: "New York State DMV",
    handbookTitle: "New York State Driver's Manual",
    handbookUrl: "https://dmv.ny.gov/driver-license/drivers-manual-practice-tests",
    examInfoUrl: "https://dmv.ny.gov/book/export/html/1556",
    defaultQuestionCount: 20,
    defaultMinCorrect: 14,
    defaultDurationSeconds: 1800,
    defaultOptionsCount: 4,
    defaultSections: [{ topic: "road-signs", questionCount: 4, minimumCorrect: 2 }],
    notesTr: "New York DMV kuralı: Toplam 20 soruda en az 14 doğru VE 4 yol işareti (road-signs) sorusundan en az 2 doğru zorunludur.",
  },
  PA: {
    code: "PA",
    name: "Pennsylvania",
    agency: "PennDOT",
    handbookTitle: "Pennsylvania Driver's Manual",
    handbookUrl: "https://www.pa.gov/agencies/dmv/driver-services/pennsylvania-drivers-manual.html",
    examInfoUrl: "https://www.pa.gov/agencies/dmv/driver-services/young-driver-information.html",
    defaultQuestionCount: 18,
    defaultMinCorrect: 15,
    defaultDurationSeconds: null,
    defaultOptionsCount: 4,
    defaultSections: [{ topic: "road-signs", questionCount: 4, minimumCorrect: 3 }],
    notesTr: "Pennsylvania PennDOT bilgi sınavı 18 sorudan oluşur ve geçmek için en az 15 doğru (%83) gerekir.",
  },
  IL: {
    code: "IL",
    name: "Illinois",
    agency: "Illinois Secretary of State",
    handbookTitle: "Illinois Rules of the Road",
    handbookUrl: "https://www.ilsos.gov/publications/pdf_publications/dsd_a112.pdf",
    examInfoUrl: "https://www.ilsos.gov/departments/drivers/drivers_license/drlicid.html",
    defaultQuestionCount: 35,
    defaultMinCorrect: 28,
    defaultDurationSeconds: null,
    defaultOptionsCount: 4,
    defaultSections: [{ topic: "road-signs", questionCount: 10, minimumCorrect: 8 }],
    notesTr: "Illinois yazılı sınavı 35 sorudan oluşur ve %80 (28 doğru) barajı uygulanır.",
  },
  OH: {
    code: "OH",
    name: "Ohio",
    agency: "Ohio BMV",
    handbookTitle: "Digest of Ohio Motor Vehicle Laws",
    handbookUrl: "https://www.bmv.ohio.gov/forms-manuals.aspx",
    examInfoUrl: "https://www.bmv.ohio.gov/dl-gdl.aspx",
    defaultQuestionCount: 40,
    defaultMinCorrect: 30,
    defaultDurationSeconds: null,
    defaultOptionsCount: 4,
    defaultSections: [
      { topic: "road-signs", questionCount: 10, minimumCorrect: 8 },
    ],
    notesTr: "Ohio BMV bilgi sınavı 40 sorudan oluşur ve %75 (toplam 30/40) başarı aranır.",
  },
  GA: {
    code: "GA",
    name: "Georgia",
    agency: "Georgia DDS",
    handbookTitle: "Georgia Drivers Manual",
    handbookUrl: "https://dds.georgia.gov/dds-forms-and-manuals/manuals",
    examInfoUrl: "https://dds.georgia.gov/testing-and-training/knowledge-exam",
    defaultQuestionCount: 40,
    defaultMinCorrect: 30,
    defaultDurationSeconds: null,
    defaultOptionsCount: 4,
    defaultSections: [
      { topic: "road-signs", questionCount: 10, minimumCorrect: 8 },
    ],
    notesTr: "Georgia DDS sınavı 40 sorudan oluşur ve %75 (toplam 30/40) başarı gerekir.",
  },
};

export const PROFILE_LABELS: Record<CandidateProfile, { title: string; subtitle: string; badge: string }> = {
  "general-first": {
    title: "Ortak Çalışma (General First)",
    subtitle: "Tüm yaş grupları için incelenmiş varsayılan günlük pratik, ders ve ortak sınav paketi",
    badge: "bg-emerald-950/90 text-emerald-300 border-emerald-700/70",
  },
  "adult-first": {
    title: "Yetişkin 18+ (Adult First)",
    subtitle: "Yalnızca 18 yaş ve üzeri ilk başvuruya özel kurallar/sınav farklıysa kullanılır",
    badge: "bg-blue-950/90 text-blue-300 border-blue-700/70",
  },
  "teen-first": {
    title: "Genç <18 (Teen First)",
    subtitle: "Yalnızca 18 yaş altı GDL / learner permit sınavı farklıysa kullanılır",
    badge: "bg-purple-950/90 text-purple-300 border-purple-700/70",
  },
};

export function buildPresetRule(state: string, profile: CandidateProfile): ExamRule {
  const meta = STATE_HANDBOOKS[state] || STATE_HANDBOOKS.CA;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `rule-${state.toLowerCase()}-${profile}`,
    version: "1.0",
    state,
    vehicle: "car",
    profile,
    questionCount: meta.defaultQuestionCount,
    minimumCorrect: meta.defaultMinCorrect,
    durationSeconds: meta.defaultDurationSeconds,
    sections: meta.defaultSections.map((s) => ({ ...s })),
    verifiedAt: today,
    sourceUrl: meta.examInfoUrl,
  };
}

export function buildStarterQuestions(state: string): Question[] {
  if (state === "CA") return caGeneralFirst.questions.map((q) => ({ ...q, options: [...q.options], source: { ...q.source } }));
  if (state === "TX") return txGeneralFirst.questions.map((q) => ({ ...q, options: [...q.options], source: { ...q.source } }));
  if (state === "FL") return flGeneralFirst.questions.map((q) => ({ ...q, options: [...q.options], source: { ...q.source } }));
  if (state === "NY") return nyGeneralFirst.questions.map((q) => ({ ...q, options: [...q.options], source: { ...q.source } }));

  const meta = STATE_HANDBOOKS[state] || STATE_HANDBOOKS.CA;
  const reviewedAt = new Date().toISOString().slice(0, 10);
  const prefix = state.toLowerCase();

  return txGeneralFirst.questions.map((q) => ({
    ...q,
    id: q.id.replace(/^tx-/, `${prefix}-`),
    prompt: q.prompt.replace(/Texas/g, meta.name),
    options: q.options.map((opt) => opt.replace(/Texas/g, meta.name)),
    explanation: q.explanation.replace(/Texas/g, meta.name),
    source: {
      title: meta.handbookTitle,
      url: meta.handbookUrl,
      section: q.source.section,
      reviewedAt,
    },
  }));
}

export function buildStarterLessons(state: string): Lesson[] {
  if (state === "CA") return caGeneralFirst.lessons.map((l) => ({ ...l, source: { ...l.source } }));
  if (state === "TX") return txGeneralFirst.lessons.map((l) => ({ ...l, source: { ...l.source } }));
  if (state === "FL") return flGeneralFirst.lessons.map((l) => ({ ...l, source: { ...l.source } }));
  if (state === "NY") return nyGeneralFirst.lessons.map((l) => ({ ...l, source: { ...l.source } }));

  const meta = STATE_HANDBOOKS[state] || STATE_HANDBOOKS.CA;
  const reviewedAt = new Date().toISOString().slice(0, 10);
  const prefix = state.toLowerCase();

  return txGeneralFirst.lessons.map((l) => ({
    ...l,
    id: l.id.replace(/^tx-/, `${prefix}-`),
    title: l.title.replace(/Texas/g, meta.name),
    body: l.body.replace(/Texas/g, meta.name),
    source: {
      title: meta.handbookTitle,
      url: meta.handbookUrl,
      section: l.source.section,
      reviewedAt,
    },
  }));
}
