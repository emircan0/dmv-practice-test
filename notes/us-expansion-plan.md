# ABD ehliyet sınavına hazırlık uygulaması — plan taslağı

İlk taslak: 30 Ekim 2026. Kapsam revizyonu: 4 Kasım 2026. Temel uygulama mevcut; aşağıdaki eski kod incelemesi tarihsel bağlamdır. Güncel uygulama durumu `us-implementation-status.md` içindedir.

## Onaylanan sade başlangıç — 4 Kasım 2026

Başlangıçta yalnızca eyalet seçilir; 18 altı/üstü sorulmaz. Günlük soru ve dersler
iki yaş grubu için incelenmiş ortak paketle sunulur. Deneme için iki grupta da
geçerli olduğu doğrulanmış ortak kural varsa yaş sorulmaz. Ortak deneme yoksa,
yaşa özel deneme hazır olduğunda yaş grubu yalnızca o deneme öncesinde sorulur.
Gelecekteki başvuru rehberlerinde yaşa bağlı koşul varsa aynı ihtiyaç anında sorma
ilkesi uygulanır. Eski yetişkin paketi otomatik olarak herkese uygun sayılmaz.
Bu karar aşağıdaki zorunlu başlangıç aday profili seçim önerilerinin yerini alır.

## Onaylanan 8 eyalet kapsamı — 4 Kasım 2026

- İlk grup: **California, Texas, Florida, New York**.
- İkinci grup: **Pennsylvania, Illinois, Ohio, Georgia**.
- Tek uygulama ve ortak içerik havuzu kullanılacak. Her ortak soru/ders için uygulanabilir eyalet ve aday profiline ait kaynak incelemesi ayrı tutulacak.
- Her eyalet/profil kendi sınav ayarını ve yayımlanmış paketini kullanacak. Benzer sınav formatı içerik eşitliği sayılmayacak.
- Seçim ekranında yalnızca bu 8 hedef eyalet yer alacak; incelenmiş ortak çalışma paketi yayımlandıkça açılacak. Hazır olmayan eyaletler “Hazırlanıyor” durumunda kalacak.
- Önce ilk grubun içerikleri tamamlanacak, ardından ikinci grup eklenecek. California ilk teknik pilot olabilir; ürün hedefi tek eyaletle sınırlı değildir.
- Nüfus/göç başlangıç önceliği için göstergedir; gelir, rekabet ve edinme maliyeti üstünlüğü henüz ölçülmedi.

Bu kararlar aşağıdaki tek eyalet/ikinci eyalet önerilerinin yerini alır. Tüm ABD eyaletlerine genişleme mevcut kapsamın dışındadır.

## Güncel yön — kullanıcının netleştirdiği kararlar

- Hedef genel ABD pazarı; ABD'deki Türklerle sınırlı bir ürün değil.
- Gelir modeli reklam geliri + uygun fiyatlı ücretli paketler. Önceki reklamsız başlangıç önerisinin yerini bu yön alır.
- İsim tercihi açıklayıcı ve arama kelimeleri odaklı. Güncel isim önerisi: **DMV Practice Test: Smart Prep**. Kullanıcı tarafından henüz son onay verilmedi.
- App Store alt başlık önerisi: **Permit Exam & Road Signs**. Mağaza adı 29 karakterdir ve Apple/Google'ın 30 karakter sınırına uyar. Gerçek mağaza/marka müsaitliği doğrulanmadı; arama hacmi ölçülmedi.
- Kullanıcı projeyi kendisi kopyalayıp yeni sohbette geliştirmeye başlayacak. Bu sohbet kapsamında proje kopyalanmadı.
- Reklam tasarımı: ücretsiz pratik ve deneme erişimi; doğal oturum sonlarında reklam; isteğe bağlı ödüllü reklam; ücretli pakette reklamsız kullanım ve ek çalışma özellikleri. Aktif denemeyi reklamla kesmemek önerilir. ABD reklam gelirinin yüksek olacağı bir iş hipotezidir; gerçek eCPM, doluluk, kullanım, kullanıcı yaşı ve platform bazında ölçülmelidir.
- Eski isim kısa listesi aşağıda araştırma geçmişi olarak durur; güncel öneri bu bölümdeki isimdir.

Mağaza ad sınırları: [Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information), [Google Play](https://support.google.com/googleplay/android-developer/answer/9898842?hl=en-GB).

## 1. Ürün kararı

Mevcut Ehliyet Hocam altyapısından ayrı ABD markası ve mağaza uygulaması oluşturulması önerilir. ABD sürümü, eyalet ve aday profiline göre içerik ve sınav kuralları seçmelidir. Türkiye sorularını İngilizceye çevirmek içerik stratejisi değildir.

İlk aday: California, standart otomobil, ilk kez yazılı bilgi sınavına hazırlanan kullanıcılar, İngilizce. California seçimi çalışma varsayımıdır; talep, edinme maliyeti veya gelir üstünlüğü bu araştırmada kanıtlanmadı. Yayına başlamadan California, Florida, New York ve Texas için kullanıcı erişimi, içerik üretim maliyeti, arama talebi ve küçük edinme denemeleri karşılaştırılmalı. Erişebildiğimiz adayların yoğunlaştığı eyalet seçimi değiştirebilir.

Tek ABD uygulaması içinde zamanla eyalet paketleri açılmalı. Her eyalet için ayrı uygulama ve kod kopyası önerilmez. Desteklenmeyen eyaletlerde genel soruları o eyalete aitmiş gibi göstermemeli.

## 2. ABD'de sistem ve doğrulanan örnekler

Tipik yol: eyalete ve yaşa bağlı başvuru koşulları → görme ve knowledge/written test → learner/instruction permit → gerekli eğitim ve gözetimli sürüş → road/skills test → ilgili ehliyet aşaması. Yetişkin, genç, başka eyalet ehliyeti olan ve yabancı ehliyet sahibi aynı akışa sahip olmayabilir. Muafiyetler resmî kaynaklardan profil bazında doğrulanmalı.

| Eyalet | Doğrulanan bilgi | Ürün sonucu |
| --- | --- | --- |
| California | DMV permit sayfasında geçme eşiği %80; 18 yaş altı ve yetişkin başvuru koşulları ayrı | Yaş profili ve sürümlenmiş sınav yapılandırması gerekir |
| New York | 20 soruda en az 14 doğru; 4 işaret sorusundan en az 2 doğru | Yalnızca yüzde puanına bakılarak geçme kararı verilemez |
| Florida | Class E sınavı 50 soru, en az 40 doğru (%80) | Soru sayısı ve eşik eyaletten gelir |
| Texas | İlk başvuruda 18–24 yaş için altı saatlik yetişkin sürücü eğitimi şartı; bilgi ve sürüş sınavları akışın parçası | Sınava hazırlık ile zorunlu eğitim/sertifika hizmeti ayrılmalı |

California için internette dolaşan 36/46 soru sayılarını güncel, uygulanabilir resmî doğrulama olmadan ürün kuralı yapmamalıyız. Kesin soru sayısı, süre, seçenek sayısı, alt bölüm dağılımı, sınav dili ve sınavın uygulanış biçimi hedef aday profili için ayrıca doğrulanacak. Kaynak doğrulanmayan süre ürünün alıştırma süresi olarak etiketlenebilir; resmî sınav süresi diye sunulmaz.

## 3. Mevcut koddan bulgular

İnceleme yerel kaynak koduyla sınırlıdır; canlı Supabase şeması, mağaza hesapları ve RevenueCat paneli incelenmedi.

| Alan | Görülen durum | Dönüşüm |
| --- | --- | --- |
| Teknoloji | Expo 54, React Native, Expo Router, Supabase, Zustand | Temel teknoloji korunabilir |
| Soru ekranları | Soru, cevap, açıklama, görsel, sonuç akışları mevcut | Eyalet kurallarını kullanan pratik/simülasyon modları |
| Puanlama | `src/store/useQuizStore.ts` içinde `score >= 70` | Ham doğru sayıları ve alt bölüm kuralları üzerinden karar |
| Sonuç ve analiz | `app/quiz/result.tsx`, `app/(tabs)/statistics.tsx` içinde %70 varsayımları | Tek kural motorundan türetilen sonuç ve anlatım |
| Genel deneme | `src/api/queries.ts` içinde 50 soruluk RPC çağrısı | Eyalet, ehliyet türü, profil, paket sürümü filtreleri |
| Onboarding | `app/onboarding.tsx`: 50 soru, 45 dakika, 70+ puan | Desteklenen eyalet → aday profili → tarih → çalışma hedefi |
| Konular | `src/types/database.ts` ve sorgularda trafik/ilk yardım/motor/adap | ABD el kitabına dayalı konu taksonomisi |
| Öğrenme | `app/study/[id].tsx` içinde Türkiye içerikleri | ABD işaret ve senaryo materyalleri |
| AI açıklaması | `src/services/aiTutor.ts` incelenen haliyle simülasyon/şablon yanıt | İlk sürümde editör onaylı açıklama; gerçek AI ayrı kapsam |
| Üyelik | RevenueCat SDK ve Türkiye ürün kimlikleri | ABD uygulamasına özel ürün, entitlement, paywall ve webhook eşlemesi |
| Yönetim | `admin-web` ve JSON sınav içe aktarma betiği | Kaynak, eyalet, çeviri, onay ve sürüm alanları |
| Offline | Profil senkronizasyon kuyruğu mevcut | Tam offline soru paketi desteği ayrıca tasarlanmalı |

Başlangıçta `app.json` üzerinde kullanıcıya ait mevcut bir değişiklik vardı; bu plan kapsamında değiştirilmedi.

## 4. Kopyalama ve teknik ayrıştırma

1. Kullanıcı değişikliklerini koruyarak çalışır sürümün kaynak referansını kaydet.
2. Uygulamaya geçileceğinde ABD için ayrı repo/checkout oluştur; mevcut Türkiye ürününü dönüştürerek üzerine yazma. Bu plan aşamasında kopyalama yapılmadı.
3. `.env`, üretim verileri, imza dosyaları ve üretilmiş native/build çıktıları yeni projeye körlemesine taşınmasın. Yeni ortamlarda gereken servis bilgileri açıkça yapılandırılsın.
4. ABD için ayrı Supabase projesi önerilir. Şemayı migration olarak taşı; Türkiye kullanıcılarını ve sonuçlarını varsayılan olarak taşıma. RLS, storage ve RPC erişimini doğrula.
5. Ayrı bundle ID / Android package, Expo/EAS proje kimliği, URL scheme, OAuth uygulamaları ve redirect adresleri oluştur. Native iOS/Android yapılandırmaları da yeni kimliklerle eşleşsin.
6. RevenueCat uygulaması ve mağaza ürünleri, reklam uygulama kimlikleri, bildirim kimlik bilgileri, destek alan adı ve yasal bağlantıları yeni ürüne bağla.
7. İlk etapta iki bağımsız ürünün bakımı; ortak kod çıkarma ancak gerçek ortaklıklar belirginleşince. ABD içinde eyaletleri kod kopyalayarak büyütme.

### Veri ve kural modeli

- `jurisdictions`: eyalet kodu, kurum adı, resmî bağlantılar.
- `exam_configs`: eyalet, yerel ehliyet sınıfı, standartlaştırılmış araç türü, aday/yaş profili, soru ve seçenek kuralları, varsa süre, doğru sayısı ve alt bölüm eşikleri, yürürlük tarihleri, kaynak ve doğrulama tarihi.
- `questions` + `question_applicability`: kanonik soru, konu, uygulanabilir eyaletler, profil ve geçerlilik dönemi. Aynı soruyu bütün eyaletlere otomatik yayma.
- `question_translations`: soru kimliği, dil, seçenekler, açıklama, çeviri ve inceleme durumu.
- `content_sources` / `content_releases`: resmî kaynak, bölüm/sayfa, yayın/erişim tarihi, inceleyen, lisans/kullanım notu, paket sürümü.
- `attempts`: eyalet, profil, kural ve içerik sürümü, soru/cevap referansları ve alt bölüm sonuçları. Sonradan güncellenen kurallar eski sonuçları değiştirmesin.
- Yerel paket ve önbellek anahtarları: uygulama/eyalet/dil/içerik sürümü. Eyalet değiştirmek geçmiş kayıtları başka eyalete dönüştürmesin.

Kritik kabul örneği: NY'de 14/20 ve yalnızca 1/4 işaret doğrusu başarısız; 14/20 ve 2/4 başarılı. FL'de 39/50 başarısız, 40/50 başarılı. Kararı yuvarlanmış yüzde değil doğru sayısı ve kurallar verir. Süresi, seçenek sayısı ve içerik havuzu da yapılandırmadan gelmelidir.

## 5. İçerik üretimi

Kaynak önceliği: hedef eyaletin güncel resmî driver handbook'u, resmî örnek testleri ve gerekli durumlarda ilgili resmî düzenlemeler. Rakip soru bankası kopyalanmaz. Resmî eyalet materyallerinin ticari kullanım ve görsel hakları ayrıca kontrol edilir; kamu sitesinde bulunması otomatik kullanım izni sayılmaz.

Başlangıç üretim hedefi: konu kapsamına göre ayarlanacak yaklaşık 300–500 özgün, incelenmiş soru. Bu sayı resmî soru havuzunun büyüklüğü veya yayına yeterlilik garantisi değildir. Önce 50 soruluk pilotla kaynak eşleme ve editör sürecini doğrula.

Önerilen konular: işaretler ve yol çizgileri, geçiş hakkı/kavşaklar, dönüş ve şerit değişimi, hız/takip mesafesi, park, yaya/bisiklet, okul otobüsleri, acil araçlar/Move Over, alkol ve dikkat dağılması, güvenli sürüş. Gerçek kapsam ve ağırlık el kitabı ve doğrulanan sınav kurallarından gelir.

Her soru için: tek savunulabilir doğru cevap, makul çeldiriciler, açıklama, kaynak bölümü, eyalet, gözden geçiren ve geçerlilik bilgisi. Kullanıcıya kaynak ve hata bildirme yolu sun. AI taslak üretebilir; yayın için insan kontrolü gerekir.

mph, feet, miles ve ABD terminolojisi esas alınmalı. Dört yönlü durak, kırmızıda dönüş, okul otobüsü ve bölünmüş yol gibi kurallar eyalet istisnalarıyla ele alınmalı. Görseller Türkiye işaretlerinden otomatik çevrilmemeli.

Dil katmanları ayrılmalı: arayüz dili, çalışma/açıklama dili, resmî sınavda kullanılabilir dil. Bir açıklamanın Türkçe veya İspanyolca olması o eyalette sınavın o dilde verildiği anlamına gelmez. İngilizce ilk yayın; İspanyolca sonraki aday. Türkçe, ABD'deki Türkler odaklı ayrı edinme hipotezi olabilir.

İçerik bakım sahibi belirle; örneğin aylık kaynak kontrolü ve değişiklik duyurusunda acil inceleme uygula. Süresi geçen veya tartışmalı soruyu yayından çek; eski paketi kullanan kullanıcı için güncelleme mekanizması tasarla.

## 6. İlk sürüm ve konumlandırma

Önerilen vaat: seçtiğin eyaletin el kitabına dayalı açıklamalarla çalış, yanlışlarını anla ve denemelerle hazırlığını takip et.

P0: ilk gruptaki dört eyalet, her paket hazır oldukça kademeli açılış/otomobil/İngilizce, misafir pratik, kısa konu dersleri, görselli sorular, açıklamalar, yanlış/favori tekrarı, kaynakları doğrulanan deneme, konu ilerlemesi, hata bildirimi, açık fiyat ve satın alma geri yükleme.

P1: indirilmiş soru paketiyle offline çalışma, plan/hatırlatma iyileştirmeleri, İspanyolca, ikinci gruptaki PA/IL/OH/GA paketleri. Basit günlük hedef mevcut altyapıyla ekonomikse P0'da kalabilir.

Sonraya: CDL, motosiklet, bütün eyaletler, gerçek AI sohbeti, sürüş saati günlüğü, ebeveyn paneli, video eğitimi ve sertifikalı kurs entegrasyonu. Liderlik tablosu ilk değer önerisinde öncelikli değil.

Hazırlık puanı gerçek sınavı geçme olasılığı gibi sunulmaz. Tekrarlanan ezber sorularından gelen yüksek puan yerine görülmemiş sorular, konu kapsamı ve yakın dönem performansı dikkate alınır.

Rakiplerde eyalet içeriği, açıklamalar, kişiselleştirme ve simülasyon zaten var. Farkımızı yalnızca bu özelliklere veya AI etiketine bağlamayalım. Denenecek fark: sade öğrenme akışı, açık kaynak/güncellik bilgisi, anlaşılır açıklama ve şeffaf ücret.

## 7. Gelir ve edinme denemeleri

Ücretsiz örnek içerik ve pratik + ücretli tam paket önerilir. İlk hipotez: tek seferlik eyalet paketi; alternatif aylık plan. Tek seferlik satın alımın hangi eyaletleri ve ne kadar süre güncellemeyi kapsadığı açıkça tanımlanır.

Fiyatlar piyasa tespiti değildir: örneğin tek seferlik $19.99 ile $29.99 veya aylık $9.99 seçeneklerini küçük denemelerle karşılaştır. İlk günden çok sayıda paket ekleme. Vergi, mağaza kesintisi, iadeler, içerik bakımı ve edinme maliyetiyle net gelir ölçülmeli.

Uygulama içi reklam, öğrenme deneyimi ve genç kullanıcı kitlesi nedeniyle başlangıç gelir planının zorunlu parçası olmasın. Abonelik varsa süre, yenilenme, fiyat ve iptal bilgisi açık olmalı. Mevcut Türkiye fiyatını kurla çevirmek ABD fiyatlandırma çalışması yerine geçmez.

İlk araştırma: 5–10 hedef adayla görüşme; yeni yetişkin sürücü ve genç adayların ihtiyaçlarını ayır. Edinme denemeleri için eyalet odaklı mağaza metni, kısa öğretici içerikler ve sürücü okulu işbirliği değerlendirilebilir. Başlangıçta görüşme/işbirliği mesajı gönderilmedi.

## 8. İsim önerileri

Ön kısa liste; hiçbir aday için marka, mağaza adı, alan adı veya sosyal hesap müsaitliği doğrulanmadı:

| Aday | Güçlü tarafı | Dikkat |
| --- | --- | --- |
| PermitNest | Destek ve güven çağrışımı; permit hazırlığıyla doğrudan ilişki | Permit kelimesi inşaat izinleriyle de ilişkilendirilebilir |
| PermitBloom | Gelişim ve öğrenme çağrışımı | Sürüş anlamı alt başlıkla güçlendirilmeli |
| LaneLumo | Daha ayırt edici marka yaklaşımı; sürüşe genişleyebilir | Yazım/telaffuz ve kategori anlaşılabilirliği test edilmeli; bu araştırmada özel ad taraması yapılmadı |

Çalışma favorisi: PermitNest. Mağaza başlığı adayı: `PermitNest: DMV Practice Test` (29 karakter). Alt başlık adayı: `Learn Your State's Road Rules`. Bunlar çalışma metinleridir; ilgili mağazanın güncel kuralları ve gerçek müsaitlik yayın öncesi doğrulanacak.

Ön web taramasında PermitPilot, PermitWise ve PermitLane adlarının başka ürünlerce kullanıldığı görüldü; ilk kısa listeye alınmadılar. RoadReady / DMV Genie gibi mevcut kategori markalarına yakınlaşma yerine ayırt edici bir isim hedeflenmeli.

Karar süreci: üç aday → ABD İngilizcesi konuşan hedef kullanıcılarla telaffuz/anlam testi → App Store/Google Play/alan adı/sosyal hesap kontrolü → USPTO'da aynı ve benzer adlar için inceleme → son isim. Web aramasında sonuç çıkmaması tescil uygunluğu anlamına gelmez.

## 9. Yayın sorumlulukları

- Ürün bağımsız hazırlık uygulaması olarak tanıtılır; resmî DMV uygulaması/onayı, gerçek sınav sorularına erişim veya zorunlu kurs yerine geçme iddiası kurulmaz.
- Ehliyet hedef kitlesinde gençler bulunduğu için yaşa uygun veri ve reklam tasarımı yapılır. COPPA'nın temel eşiği 13 yaş altıdır; 13–17 yaşın diğer yükümlülükleri ayrıca değerlendirilir. Yaş sınırı yazmak tek başına tüm sorumlulukları çözmez.
- Gerçekte kullanılan Supabase, satın alma, reklam, analitik ve AI veri akışlarıyla gizlilik metinleri/mağaza beyanları uyumlu olmalı. Mevcut metinleri yalnızca isim değiştirerek taşımama.
- İlk kapsam içerik hazırlığıdır; kimlik belgesi/SSN yükleme ve ehliyet başvurusu işlemleri gerektirmez.

## 10. Uygulama sırası ve çıkış koşulları

Tek geliştirici, mevcut altyapı ve ulaşılabilir İngilizce içerik inceleyicisi varsayımıyla yaklaşık 6–8 haftalık pilot hedefi düşünülebilir. Bu taahhüt değildir; içerik incelemesi, native kurulum ve mağaza süreçleri süreyi değiştirebilir.

| Aşama | Yaklaşık süre | Somut çıktı |
| --- | --- | --- |
| Ürün/isim/kaynak doğrulama | 3–5 iş günü | Hedef profil/eyalet, rakip matrisi, isim kısa listesi, kaynak kayıtları, 50 soru pilotu |
| Kopyalama ve altyapı | 1 hafta | Ayrı uygulama kimlikleri/ortamları, migration, dil ve eyalet temeli |
| Kural motoru ve içerik araçları | 1–2 hafta | Filtreli soru akışı, sürümleme, admin onayı, doğru geçme değerlendirmesi |
| İçerik ve ürün akışı | 2–3 hafta, teknik işle paralel | İncelenmiş ilk paket, ders/pratik/deneme, İngilizce arayüz |
| Beta ve yayın | 1–2 hafta | Adaylarla kullanım, hata düzeltme, satın alma ve mağaza doğrulaması |

Yayın kapıları: bütün yayımlı soruların kaynak ve editör onayı; hedef profilin doğrulanmış sınav kuralları; eyaletler arası içerik karışmaması; sınır puan/alt bölüm testleri; misafir ilerleme ve hesap bağlama; uygulama arka plana geçince deneme/süre davranışı; satın alma/geri yükleme; varsa offline paket güncelleme; yeni uygulama kimlikleri ve yasal beyanların doğrulanması.

Beta ölçümleri: ilk çalışma oturumuna başlama ve tamamlama, tekrar kullanım, yanlış tekrarının kullanımı, hata bildirimleri, ödeme dönüşümü/iade ve kullanıcı başına net edinme getirisi. Sınava hazırlanma kısa dönemli bir iş olduğu için yalnızca uzun dönem elde tutma oranı başarı ölçütü olmasın. Gerçek sınav sonucu isteğe bağlı takip edilebilir; öz bildirimi doğrulanmış başarı oranı gibi yayımlama.

## 11. Açık kararlar

1. Ana hedef genel ABD pazarı mı, ABD'deki Türkler mi? Varsayılan öneri genel pazar/İngilizce.
2. California önceliği araştırmayla doğrulanıyor mu? İç testlerde NY alt bölüm kuralı ve FL sınır puanları da kullanılabilir; bu eyaletlerin yayında desteklendiği anlamına gelmez.
3. İlk hedef gençler mi yetişkinler mi? İçerik ve onboarding profili buna göre kesinleşir.
4. Marka önceliği açıklayıcı isim mi daha özgün isim mi? Çalışma favorisi PermitNest.
5. İçerik incelemesini kim yapacak ve bakım bütçesi ne olacak?

## Kaynaklar

30 Ekim 2026 tarihinde erişilen kaynaklar; uygulama yayınından önce tekrar kontrol edilecek:

- California DMV — [Instruction and Learner's Permits](https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/learners-permits/)
- California DMV — [Prepare for Knowledge and Drive Tests](https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/preparing-for-knowledge-and-drive-tests/)
- New York DMV — [Driver's Manual, Chapter 1](https://dmv.ny.gov/book/export/html/1556)
- Hillsborough County Tax Collector — [Class E Learner Driver License](https://www.hillstaxfl.gov/drivers-license-id/class-e-learner-driver-license/)
- Texas DPS — [Apply for a Texas Driver License](https://www.dps.texas.gov/section/driver-license/apply-texas-driver-license)
- FTC — [Complying with COPPA: Frequently Asked Questions](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- USPTO — [Search our trademark database](https://www.uspto.gov/trademarks/search)
- Rakiplerin kendi sayfaları: [Zutobi](https://zutobi.com/us), [DMV Genie App Store](https://apps.apple.com/us/app/dmv-genie-permit-test-2026/id513850893)
- İsim taraması: [PermitPilot](https://www.permitpilot.co/), [PermitWise](https://permitwise.app/), [PermitLane](https://permitlane.ca/)
