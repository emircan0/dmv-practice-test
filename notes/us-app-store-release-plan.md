# DMV Smart Prep — iOS / App Store çıkış planı

Güncelleme: 6 Kasım 2026. Hedef: önce iOS App Store; Android daha sonra.
Durum: entegrasyon ve içerik hazırlığı devam ediyor. Bu belge, tamamlanmış bir
mağaza gönderimi veya onay garantisi değildir.

## Kararlaştırılan ürün

- Tek uygulama, 8 hedef eyalet. İlk grup CA / TX / FL / NY; ardından PA / IL / OH / GA.
- Başlangıçta yalnızca eyalet seçimi. Günlük içerik iki yaş grubu için incelenmiş
  `general-first` paketi kullanır. Yaş grubu sadece ayrı deneme gerektiğinde sorulur.
- Temel pratik, kaynaklı açıklamalar ve yanlış/favori tekrarı ücretsiz kalır.
- Premium: **aylık otomatik yenilenen abonelik** ve **tek seferlik ömür boyu erişim**.
  Aynı `premium` entitlement'ına bağlanırlar. Yıllık seçenek eklenmeyecek.
- Başlangıç fiyat hipotezi: ABD mağazasında aylık **$9.99**, ömür boyu **$19.99**.
  Bu ölçülmüş bir piyasa optimumu değildir; yaklaşık iki aylık ödeme karşılığında
  ömür boyu erişim değer önerisini denemek içindir. Mağazada henüz ayarlanmadı.
  Uygulama gerçek ve yerelleştirilmiş fiyatları StoreKit/RevenueCat'ten alır.
- Onaylanan ek araçlar: **kişisel 7 günlük plan 3 kredi**, **ayrıntılı ilerleme
  raporu 3 kredi**. Premium'da ikisi de sınırsız oluşturulur ve otomatik reklam
  araları kaldırılır. Eski kaydedilmiş sonucu yeniden açmak ücretsizdir.
- Plan/rapor için en az 10 cevap ve 5 farklı soru gerekir; yetersiz veriyle kredi
  harcanmaz. Sonuçlar gerçek yerel geçmişe dayanır, gerçek sınav başarı ihtimali
  gibi sunulmaz. Son 20 araç çıktısı hesap ve eyalet kapsamında saklanır.
- Reklamlar: isteğe bağlı ödüllü reklam + oturum sonrası sınırlı geçiş reklamı.
  Aktif oturumlarda, denemelerde ve günlük mini test geçişlerinde otomatik reklam yok.
  Ödül yalnızca SDK'nın earned-reward olayından gelir.

## Yeniden kontrol edilen durum

| Alan | Doğrulanan | Kalan |
| --- | --- | --- |
| Expo/EAS | CLI hesabı açık; `@emircanmert/dmv-smart-prep`, proje `c80973c1-2c51-452a-a8e7-1fef274b05fe` | Aynı proje ID'sini yerel ve EAS ortamlarında açıkça tanımla |
| iOS kimliği | Kaynakta `com.dmvsmartprep.app`; submit hedefi `6828894940` | Apple portalında App Store kaydı / Bundle ID / takım eşleşmesini doğrula; mağaza kaydı tarayıcıdan doğrulanamadı |
| Supabase Auth | Canlı `/auth/v1/settings`: Apple ve e-posta açık, Google kapalı | Google provider, redirect'ler ve gerçek cihaz giriş/çıkış testleri |
| İçerik | Read-only kontrol ilk grubun tam ortak soru + ders + doğrulanmış deneme paketini doğrulamadı | Kaynak araştırması, editör incelemesi ve paket yayını |
| RevenueCat | SDK 10.16.0, ürün allowlist'i, aylık/ömür boyu paywall, entitlement, restore ve hesap eşleme kodu eklendi | ABD proje/uygulama/ürün/key/offering kayıtlarını eşle; sandbox test et |
| AdMob | Native plugin, UMP öncesi ölçümü erteleme, non-personalized istekler, ödüllü + geçiş akışı eklendi | ABD app/unit ID'leri, mesajlar, test cihazları ve gerçek cihaz doğrulaması |
| Hesap silme | Authenticated Edge Function; Apple kod değişimi/ID token doğrulama/revoke yolu eklendi | US projeye deploy, Apple server secret ve uçtan uca test |
| Hukuki/destek | Ekranlar var | US public privacy/terms/support URL'leri ve destek e-postası boş |
| Mağaza materyali | Tasarım mevcut | Yeni ikon, İngilizce açıklama ve gerçek US iPhone/iPad ekran görüntüleri |

Hesap panellerine otomatik erişim doğrulanamadı: bu oturumda bilgisayar kontrol
izni kapalı. Anahtarları sohbet metnine yazmak gerekmez. Public SDK/config değerleri
`.env` ve doğru EAS ortamına; gizli sunucu/Apple anahtarları yalnızca servis secret
ayarlarına girilmeli. Türk uygulamasının ürün, reklam, provider ve signing değerleri
kullanılmamalı.

## Yerel teknik doğrulama

- SDK'ları içeren iOS Simulator Debug/development-client build'i Xcode ile tamamlandı.
  Bu imzasız simülatör `.app` çıktısıdır; App Store `.ipa` veya TestFlight gönderimi değildir.
- RevenueCat 11'in CocoaPods bağımlılığı 6 Kasım'da yayımlı olmadığı için üreticinin
  Expo önerisine uygun **10.16.0** sürümü sabitlendi; CocoaPods kurulumu tamamlandı.
- Gerçek Apple/Google hesap girişi, StoreKit sandbox satın alma/restore, AdMob UMP
  ve provider token revocation henüz cihazda doğrulanmadı.

## Uygulama sırası ve her aşamanın çıkış koşulu

### 1. Uygulama kimlikleri ve ortamlar

- [ ] Apple Developer'da US Bundle ID ve Sign in with Apple capability'sini doğrula.
- [ ] App Store Connect uygulamasının aynı Bundle ID ve Apple takımına bağlı olduğunu doğrula.
- [ ] `US_IOS_BUNDLE_ID`, `US_EAS_PROJECT_ID`, `US_ASC_APP_ID` değerlerini eşleştir.
- [ ] `eas.json` submit hedefini doğrulanmış US kaydına bağla. İsim benzerliği yeterli değil.
- [ ] Development / preview / production ortamlarını ayrı doğrula; eski Türk env değerlerine fallback yok.
- [ ] `npm run release:check:ios` hatasız çalışsın; TODO'lar kapatılsın.

Çıkış: yanlış uygulamaya build veya gönderim yapılmayacak şekilde kimlikler eşleşir.

### 2. Backend, giriş ve hesap yaşam döngüsü

- [ ] Üç US SQL migration'ının gerçek projede uygulandığını doğrula; RLS ve anon/auth erişimlerini test et.
- [ ] Google Cloud OAuth consent/client ayarları ve Supabase Google sağlayıcısını tamamla.
- [ ] Apple native App ID ile Supabase Apple provider client listesi/secret'ını eşleştir.
- [ ] `dmvsmartprep://auth/callback` ve recovery/verified dönüşlerini izinli redirect listesine ekle.
- [ ] Google / Apple / e-posta / misafir akışlarını gerçek development build'de test et.
- [ ] E-posta doğrulama, şifre sıfırlama, giriş iptali, çıkış ve hesaplar arası geçmiş izolasyonunu test et.
- [ ] `us-delete-account` Edge Function'ını deploy et; Apple silme için sadece sunucuda
  `US_APPLE_CLIENT_ID` (native iOS Bundle ID) ve `US_APPLE_CLIENT_SECRET` tanımla.
- [ ] Apple ile giriş yapan kullanıcı için silmede taze authorization code alınır.
  Sunucu Apple ID token imza/issuer/audience/sub doğrulamasından sonra token'ı revoke eder.
  Revocation yapılamadığında hesap silme yine tamamlanır ve kullanıcıya Apple
  bağlantısını ayarlardan kaldırabileceği söylenir. Hiçbir token loglanmaz.
- [ ] Migration sonrası hesap senkronizasyonu ve opt-in sıralamayı doğrula.

Çıkış: girişten hesap silmeye kadar çalışan ve cihazda doğrulanmış akış.

### 3. İçerik üretimi ve yayın

- [ ] CA / TX / FL / NY resmî el kitaplarını ve uygulanabilir sınav kurallarını kaydet.
- [ ] Önce 50 soruluk kaynak eşlemeli pilotla editör sürecini doğrula.
- [ ] Eyalet başına yaklaşık 300–500 soruyu bir içerik hedefi olarak değerlendir;
  yayına uygunluk yalnızca sayıyla belirlenmez. Ders/işaret kapsamı ve kurallar da gerekir.
- [ ] Ortak sorular için her eyalet ve `general-first` kapsamını ayrıca incele;
  yetişkin sorularını otomatik herkese uygun sayma.
- [ ] Açıklama, doğru seçenek, konu, kaynak bölümü, gözden geçirme ve görsel haklarını kontrol et.
- [ ] Soru/ders paketini oluştur; `compose:content` ve `validate:content` kontrollerini çalıştır.
- [ ] Sınav alt bölüm kotaları, kaynaklı süre, doğru sayısı ve yeterli soru havuzunu doğrula.
- [ ] İncelenen paketleri yayımla; mobilde onboarding / pratik / konu / ders / deneme / sonuç akışlarını test et.
- [ ] Diğer dört hedef eyalet ikinci gruptur; hazır olmayan paketler açılmaz.

Çıkış: ilk grubun paketleri tamamlanır. Boş ekranlar veya QA fixture'larıyla review gönderilmez.

### 4. App Store ürünleri ve RevenueCat

- [ ] App Store Connect'te 1 aylık auto-renewable subscription + lifetime non-consumable oluştur.
- [ ] Aylık abonelik grubunu, ürün başlık/açıklama ve review bilgilerini tamamla.
- [ ] Gerçek product ID'lerini `EXPO_PUBLIC_US_MONTHLY_PRODUCT_ID` ve `...LIFETIME_PRODUCT_ID` olarak tanımla.
- [ ] RevenueCat US app'ine App Store bağlantısını ekle; iki ürünü aynı `premium` entitlement'ına bağla.
- [ ] Current offering içinde aylık ve lifetime paketlerini tanımla.
- [ ] Public Apple SDK key ve entitlement değerlerini `.env` + EAS ortamına gir.
- [ ] Sandbox'ta aylık ve lifetime satın alma, iptal, bekleyen/başarısız işlem,
  restore, yenilenme/sona erme, çıkış/giriş ve başka hesap senaryolarını test et.
- [ ] Lifetime alan mevcut aylık aboneye, aylık aboneliğin otomatik iptal olmadığı
  ve aboneliğini ayrıca yönetmesi gerektiği açıkça gösterilir.
- [ ] Ücretli kullanıcıda otomatik reklamın gerçekten kalktığını test et.
- [x] Onaylanan plan/rapor araçlarını 3 kredi veya Premium sınırsız modeliyle uygula.
- [ ] Gerçek ödüllü reklamdan kazanılan krediyle araç oluşturma ve hesap değişiminde
  veri/credit izolasyonunu gerçek cihazda test et.
- [ ] Çalışmayan ek Premium araçlarına dair pazarlama vaadi bırakma.

Çıkış: mağaza fiyatıyla satın alma/restore ve Premium erişimi gerçek cihazda çalışır.

### 5. AdMob, izin ve veri beyanı

- [ ] Ayrı US iOS AdMob uygulaması, rewarded ve interstitial unit'leri oluştur/doğrula.
- [ ] AdMob Privacy & messaging'de dağıtım bölgelerine uygun UMP mesajlarını yapılandır.
- [ ] App Store gizlilik beyanını gerçek Supabase/RevenueCat/Google veri akışıyla eşleştir.
- [ ] Yaşı belirsiz/genç kullanıcı kitlesi için hedefleme ve reklam içeriği politikasını incele.
  Şimdiki uygulama non-personalized istek ve G içerik sınırı kullanır; bu tek başına
  tüm gizlilik yükümlülüklerini otomatik çözmez. Sınav yaşı seçimi reklama aktarılmaz.
- [ ] İzleme yapılacaksa ATT açıklaması ve talep akışını gerçek veri kullanımına göre test et;
  izin reddi pratik/satın alma akışını bozmasın.
- [ ] Simulator/test cihazında test reklamları; test sırasında üretim reklamına tıklama yok.
- [ ] Reward sadece earned olayında; erken kapatma / hata / tekrar callback'i kredi üretmesin.
- [ ] Geçiş reklamı yalnızca farklı tamamlanmış pratik oturumlarından sonra, en az
  üç oturum ve iki dakika aralık koşuluyla gösterilir. Deneme/günlük görev hariçtir.
- [ ] Gizlilik tercihlerine ayarlardan yeniden erişim ve offline/no-fill akışlarını test et.
- [ ] Developer website / app-ads.txt kaydını US AdMob hesabına uygun yayımla.
- [ ] Üretim app/unit ID'lerini doğruladıktan sonra test modunu kapat.

Çıkış: izin ve ödül davranışı doğrulanır; reklamsız kullanıcıya otomatik reklam gelmez.

### 6. Ürün tamamlığı, yasal bağlantılar ve mağaza materyali

- [ ] Yeni US ikonunu ve açılış görsellerini tamamla; Türk mağaza materyallerini kullanma.
- [ ] Privacy / terms / support sayfaları herkese açık HTTPS adreslerinde çalışsın.
- [ ] Uygulamanın bağımsız DMV hazırlık ürünü olduğu açık olsun; resmî onay/geçme garantisi iddiası olmasın.
- [ ] Hata bildirme ekranını soru ID'si, sürüm ve eyaletle gerçek destek akışına bağla.
- [ ] Profil fotoğrafı kullanılmıyorsa gereksiz kamera/fotoğraf izinlerini kaldır.
- [ ] İngilizce/Türkçe bütün ekranlarda placeholder, bozuk link, taşma ve yanlış vaadi temizle.
- [ ] Mağaza adı, alt başlık, açıklama, anahtar kelimeler, kategori, yaş derecelendirmesi,
  gizlilik etiketleri, içerik hakları ve review iletişim bilgilerini doldur.
- [ ] iPhone ve destekleniyorsa iPad'den gerçek US ekran görüntülerini hazırla.
- [ ] Reviewer'ın uygulamaya, içeriğe ve ürünlere erişimini sağlayacak notları/hisabı hazırla.

Çıkış: kullanıcı ve reviewer hiçbir hazırlık/servis placeholder'ıyla karşılaşmaz.

### 7. Development build → TestFlight → App Review

- [ ] TypeScript, birim testleri, admin derlemesi, web/iOS bundle ve release ön kontrolünü geçir.
- [ ] Native SDK'ları içeren development build al; gerçek iPhone'da kritik akışları test et.
- [ ] iPad desteği açıksa tablet görünümünü ayrıca test et.
- [ ] Uçak modu, bağlantı kopması, arka plan/geri dönüş, süre aşımı, kaldığı yerden devam,
  içerik güncelleme ve yanlış eyalet/profil verisinin karışmamasını test et.
- [ ] Production EAS ortamına doğrulanmış US değerlerini yerleştir; signing'i kontrol et.
- [ ] Uygun güncel Xcode/iOS SDK ile production .ipa oluştur.
- [ ] Doğrulanmış US App Store kaydına yükle; processing sonrası TestFlight'ta smoke test yap.
- [ ] App Store ürünlerini ve sürümü review'a gönder; ilk yayın için manuel release seç.

Örnek komutlar (kimlikler ve içerik hazır olduktan sonra):

```sh
npm run typecheck
npm run test:us
npm --prefix admin-web run build
npm run release:check:ios -- --online
npx eas-cli@27.2.0 build --platform ios --profile development
npx eas-cli@27.2.0 build --platform ios --profile production
npx eas-cli@27.2.0 submit --platform ios --profile production --id <verified-production-build-id>
```

`--latest` yerine belirli doğrulanmış build ID'si kullanılır. Sadece .ipa yüklemek
App Review'a gönderimin veya mağazada yayımlamanın tamamlandığı anlamına gelmez.

## Hesaplarda birlikte yeniden kontrol edilecek kısa liste

1. **App Store Connect:** US uygulaması, Bundle ID, numeric app ID, takım;
   aylık ve lifetime ürün ID'leri; vergi/banka/ücretli uygulama sözleşmesi durumu.
2. **RevenueCat:** US project/app, public iOS SDK key, premium entitlement,
   current offering, iki product/package eşlemesi ve restore/transfer politikası.
3. **AdMob:** US iOS App ID, rewarded/interstitial unit'leri, reward miktarı,
   Privacy & messaging ve app-ads.txt.
4. **Supabase / Google / Apple:** US proje, Google provider, izinli redirect'ler,
   Apple native client ve sunucudaki secret, silme endpoint'i.
5. **Web/destek:** public privacy/terms/support URL'leri ve destek e-postası.

## Kaynaklar

6 Kasım 2026 tarihinde tekrar kontrol edilen teknik/politika referansları:

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple SDK gereklilikleri](https://developer.apple.com/news/upcoming-requirements/)
- [Apple hesap silme](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [Apple token revocation / TN3194](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple)
- [RevenueCat Expo kurulumu](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [RevenueCat Expo/CocoaPods sürüm notu](https://www.revenuecat.com/docs/sdk-guides/react-native-cocoapods-to-spm-migration#expo-apps)
- [AdMob Expo native kurulumu](https://docs.page/invertase/react-native-google-mobile-ads/installation/expo)
- [AdMob consent](https://docs.page/invertase/react-native-google-mobile-ads/consent-basics)
- [Google UMP / ATT](https://developers.google.com/admob/ios/privacy/idfa)
