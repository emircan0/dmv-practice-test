import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Globe, ShieldCheck, Lock, Trash2, Eye } from "lucide-react-native";
import { usePalette } from "../src/us/ui";

export default function PrivacyScreen() {
  const p = usePalette();
  // Default strictly to English for US App Store compliance
  const [lang, setLang] = useState<"en" | "tr">("en");

  const isEn = lang === "en";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[st.container, { backgroundColor: p.bg }]}>
      {/* Header */}
      <View style={[st.header, { borderBottomColor: p.line }]}>
        <Pressable onPress={() => router.back()} style={st.backBtn}>
          <ChevronLeft size={24} color={p.ink} />
        </Pressable>
        <Text style={[st.headerTitle, { color: p.ink }]}>
          {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
        </Text>
        <Pressable
          onPress={() => setLang(isEn ? "tr" : "en")}
          style={[st.langBtn, { backgroundColor: p.soft }]}
        >
          <Globe size={14} color={p.muted} />
          <Text style={[st.langText, { color: p.ink }]}>{isEn ? "TR" : "EN"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.content}>
        <Text style={[st.badge, { backgroundColor: p.soft, color: p.muted }]}>
          {isEn ? "DATA PROTECTION & CCPA/GDPR COMPLIANCE" : "VERİ KORUMA VE CCPA/GDPR UYUMU"}
        </Text>

        <Text style={[st.dateText, { color: p.muted }]}>
          {isEn ? "Last Updated: November 19, 2026" : "Son Güncelleme: 19 Kasım 2026"}
        </Text>

        {/* Disclaimer Callout Box */}
        <View style={[st.callout, { backgroundColor: "#3B82F615", borderColor: "#3B82F640" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={18} color="#2563EB" />
            <Text style={[st.calloutTitle, { color: "#2563EB" }]}>
              {isEn ? "WE NEVER SELL YOUR DATA" : "VERİLERİNİZ ASLA SATILMAZ"}
            </Text>
          </View>
          <Text style={[st.calloutText, { color: p.ink }]}>
            {isEn
              ? "DMV Practice Test: Smart Prep does NOT sell, rent, or trade your personal information. We only collect the minimal information needed to save your study progress, customize AI review, and process App Store subscriptions."
              : "DMV Practice Test: Smart Prep verilerinizi asla satmaz veya üçüncü taraflarla paylaşmaz. Yalnızca soru geçmişinizi kaydetmek, AI koçluğu sunmak ve Apple aboneliklerini doğrulamak için asgari düzeyde veri işlenir."}
          </Text>
        </View>

        {/* Section 1 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "1. Data We Collect" : "1. Toplanan Veriler"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "• Account Details: Email & name (optional, only if creating an account rather than guest).\n• Quiz Progress: Questions solved, accuracy, streak, study time, and favorite bookmarks.\n• Technical & Crash Logs: Device model, iOS version, anonymous diagnostic logs.\n• Advertising Identifiers: Device IDFA via Google AdMob for non-personalized ads (only where permitted by you)."
              : "• Hesap Bilgileri: İsim ve e-posta (isteğe bağlı, misafir girişi yerine hesap açılırsa).\n• Sınav İlerlemesi: Çözülen sorular, başarı yüzdesi, çalışma serisi ve favori sorular.\n• Teknik Veriler: Cihaz modeli, iOS sürümü, anonim çökme raporları.\n• Reklam Tanımlayıcıları: İzin verdiğiniz ölçüde Google AdMob reklam kimliği (IDFA)."}
          </Text>
        </View>

        {/* Section 2 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "2. Trusted Third-Party Services" : "2. Kullanılan Güvenli Servisler"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "We utilize industry-standard, encrypted service providers:\n• Supabase: Cloud database & secure encrypted authentication.\n• RevenueCat: Apple App Store receipt validation.\n• Google AdMob: Privacy-compliant ad delivery (UMP consent framework).\n• Apple Inc: Sign in with Apple and App Store billing."
              : "Verileriniz yalnızca endüstri standardı şifrelenmiş servisler üzerinden işlenir:\n• Supabase: Bulut veritabanı ve güvenli kimlik doğrulama.\n• RevenueCat: Apple App Store faturalandırma doğrulaması.\n• Google AdMob: Bölgesel gizlilik standartlarına uygun reklam dağıtımı.\n• Apple Inc: Apple ile Giriş ve ödeme altyapısı."}
          </Text>
        </View>

        {/* Section 3 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Trash2 size={16} color="#DC2626" />
            <Text style={[st.sectionTitle, { color: p.ink }]}>
              {isEn ? "3. Account & Data Deletion (Apple 5.1.1)" : "3. Hesap ve Veri Silme Hakkı (Apple 5.1.1)"}
            </Text>
          </View>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "You retain full control over your data. In strict compliance with Apple Review Guideline 5.1.1, you can permanently delete your account and all associated test records at any time inside the app via: Settings > Profile Details > Delete Account."
              : "Verileriniz üzerindeki tam kontrol sizdedir. Apple Kılavuzu 5.1.1 uyarınca hesabınızı ve tüm çalışma verilerinizi uygulama içinden dilediğiniz an kalıcı olarak silebilirsiniz: Ayarlar > Profil Detayları > Hesabımı Sil."}
          </Text>
        </View>

        {/* Section 4 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "4. Children's Privacy (COPPA)" : "4. Çocukların Gizliliği (COPPA)"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "The Application is intended for driver permit candidates (typically ages 15+). We do not knowingly collect personal information from children under 13. Any such data detected is deleted immediately."
              : "Uygulama ehliyet adayları için tasarlanmıştır. 13 yaşından küçük çocuklardan bilerek veri toplanmaz; tespit edilen kayıtlar derhal silinir."}
          </Text>
        </View>

        {/* Section 5 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "5. CCPA / CPRA & GDPR Rights" : "5. Yasal Gizlilik Haklarınız"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "You have the right to request access, correction, or deletion of your personal data, and to opt out of cross-app tracking anytime via iOS Settings (Settings > Privacy & Security > Tracking). We do not discriminate against users who exercise their privacy rights."
              : "Verilerinize erişme, düzeltme veya silinmesini talep etme hakkına sahipsiniz. Takip tercihlerini iOS Cihaz Ayarlarından dilediğiniz an kapatabilirsiniz."}
          </Text>
        </View>

        {/* Contact */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line, marginBottom: 40 }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "6. Privacy Contact" : "6. Gizlilik İletişim"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            Developer: Emircan Mert{"\n"}
            Email: emircanmertt@gmail.com{"\n"}
            App: DMV Practice Test: Smart Prep
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  langText: { fontSize: 11, fontWeight: "800" },
  content: { padding: 20, gap: 14 },
  badge: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 12, marginBottom: 4 },
  callout: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  calloutTitle: { fontSize: 13, fontWeight: "900" },
  calloutText: { fontSize: 13, lineHeight: 20, fontWeight: "600" },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  bodyText: { fontSize: 13, lineHeight: 21, fontWeight: "400" },
});
