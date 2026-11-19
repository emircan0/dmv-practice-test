import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Globe } from "lucide-react-native";
import { usePalette } from "../src/us/ui";

export default function TermsScreen() {
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
          {isEn ? "Terms of Service" : "Kullanım Koşulları"}
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
          {isEn ? "END USER LICENSE AGREEMENT (EULA)" : "SON KULLANICI LİSANS SÖZLEŞMESİ (EULA)"}
        </Text>

        <Text style={[st.dateText, { color: p.muted }]}>
          {isEn ? "Last Updated: November 19, 2026" : "Son Güncelleme: 19 Kasım 2026"}
        </Text>

        {/* Disclaimer Callout Box */}
        <View style={[st.callout, { backgroundColor: "#EF444415", borderColor: "#EF444440" }]}>
          <Text style={st.calloutTitle}>
            {isEn ? "⚠️ STRICT GOVERNMENTAL DISCLAIMER" : "⚠️ KESİN DEVLET/KAMU SORUMLULUK REDDİ"}
          </Text>
          <Text style={[st.calloutText, { color: p.ink }]}>
            {isEn
              ? "DMV Practice Test: Smart Prep is an independent educational tool. IT IS NOT AFFILIATED WITH, ENDORSED BY, OR CONNECTED TO ANY STATE DEPARTMENT OF MOTOR VEHICLES (DMV), DOT, BMV, OR ANY GOVERNMENT AGENCY. Scoring well on practice exams does NOT guarantee passing the official state permit or driver's license test."
              : "DMV Practice Test: Smart Prep bağımsız bir eğitim platformudur. HİÇBİR EYALET MOTORLU TAŞITLAR DAİRESİ (DMV), ULAŞTIRMA BAKANLIĞI (DOT) VEYA DEVLET KURUMUYLA BAĞI YOKTUR. Uygulamada başarılı olmak resmi eyalet ehliyet sınavını geçme garantisi VERMEZ."}
          </Text>
        </View>

        {/* Section 1 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "1. License & Educational Purpose" : "1. Lisans Kapsamı ve Eğitim Amacı"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "We grant you a personal, revocable, non-exclusive, non-transferable license to use the App solely for non-commercial personal study. All test materials and questions are provided on an 'AS IS' basis for self-preparation."
              : "Uygulama yalnızca kişisel ve ticari olmayan eğitim amacıyla kullanılmak üzere sınırlı, devredilemez ve geri alınabilir bir lisansla sunulur. Tüm test materyalleri adayın kendini sınaması amacıyla 'OLDUĞU GİBİ' sağlanır."}
          </Text>
        </View>

        {/* Section 2 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "2. Subscriptions & Billing (Apple App Store)" : "2. Abonelikler ve Faturalandırma (Apple)"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "All premium purchases and auto-renewable subscriptions are processed exclusively through Apple In-App Purchases. Payment is charged to your Apple ID account. You may manage or cancel your subscription anytime via iOS Device Settings (Settings > Apple ID > Subscriptions). Developer cannot issue direct refunds; all refund requests are subject strictly to Apple policies (reportaproblem.apple.com)."
              : "Tüm premium satın alımlar ve otomatik yenilenen abonelikler doğrudan Apple In-App Purchases altyapısı üzerinden işlenir. Ödeme Apple ID hesabınızdan tahsil edilir. Aboneliğinizi dilediğiniz an iOS Ayarlarından iptal edebilirsiniz. Geliştiricinin doğrudan para iadesi yapma yetkisi yoktur; iadeler tamamen Apple'ın kurallarına tabidir."}
          </Text>
        </View>

        {/* Section 3 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "3. Virtual Study Credits" : "3. Sanal Çalışma Kredileri"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "Users may earn virtual credits by voluntarily viewing rewarded ads. Credits hold no monetary value, cannot be redeemed for cash, and cannot be transferred. Developer reserves the right to modify or expire virtual credits without liability."
              : "Kullanıcılar isteğe bağlı olarak ödüllü reklam izleyerek sanal kredi kazanabilirler. Kredilerin nakdi karşılığı yoktur, paraya çevrilemez veya devredilemez."}
          </Text>
        </View>

        {/* Section 4 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "4. AI Coach / AI Tutor Disclaimer" : "4. AI Koç / AI Tutor Sorumluluk Reddi"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "AI-generated recommendations and score estimations are produced algorithmically for study guidance only. They do not constitute formal driving instruction or legal advice. Verify critical rules with your state's driver handbook."
              : "Yapay zeka analizleri ve koçluk önerileri bilgilendirme amaçlıdır; sertifikalı sürüş eğitimi veya resmi sınav garantisi teşkil etmez."}
          </Text>
        </View>

        {/* Section 5 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "5. Strict Limitation of Liability" : "5. Sorumluluğun Sınırlandırılması"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVELOPER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING FAILURE TO PASS AN EXAM OR DEVICE ISSUES. TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID IN THE LAST 3 MONTHS OR $50 USD, WHICHEVER IS LESS."
              : "YASALARIN İZİN VERDİĞİ AZAMİ ÖLÇÜDE: GELİŞTİRİCİ, SINAVDA BAŞARISIZ OLUNMASI DAHİL HİÇBİR ARIZİ VEYA DOLAYLI ZARARDAN SORUMLU TUTULAMAZ. GELİŞTİRİCİNİN TOPLAM SORUMLULUĞU SON 3 AYDA ÖDENEN TUTARI VEYA AZAMİ 50 DOLARI AŞAMAZ."}
          </Text>
        </View>

        {/* Section 6 */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "6. Binding Arbitration & Class Action Waiver" : "6. Tahkim ve Toplu Dava Feragati"}
          </Text>
          <Text style={[st.bodyText, { color: p.muted }]}>
            {isEn
              ? "Any disputes arising from this Agreement shall be resolved through binding individual arbitration under Delaware law and the American Arbitration Association (AAA) Consumer Rules. You expressly waive any right to bring or participate in a class action."
              : "Uyuşmazlıklar Delaware yasaları ve Amerikan Tahkim Derneği (AAA) Tüketici Kuralları uyarınca bireysel tahkimle çözülecektir. Toplu dava haklarından peşinen feragat edilmiştir."}
          </Text>
        </View>

        {/* Contact */}
        <View style={[st.sectionCard, { backgroundColor: p.card, borderColor: p.line, marginBottom: 40 }]}>
          <Text style={[st.sectionTitle, { color: p.ink }]}>
            {isEn ? "7. Contact & Support" : "7. İletişim ve Destek"}
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
  calloutTitle: { fontSize: 13, fontWeight: "900", color: "#DC2626" },
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
