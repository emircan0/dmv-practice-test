# App Store Connect - App Privacy (Uygulama Gizliliği) Beyan Rehberi

**Uygulama:** DMV Practice Test: Smart Prep  
**Paket Adı:** `com.dmvsmartprep.app`  
**Geliştirici:** Emircan Mert  
**Tarih:** 19 Kasım 2026  

App Store Connect panelinde **App Privacy (Uygulama Gizliliği)** bölümünü doldururken Apple inceleme ekibinin red vermemesi ve beyanların tam tutarlı olması için aşağıdaki yanıtları birebir seçebilirsiniz:

---

### 1. Veri Topluyor musunuz?
👉 **Evet, bu uygulamadan veri topluyoruz.** (Yes, we collect data from this app)

---

### 2. Toplanan Veri Türleri ve Kullanım Amaçları Tablosu:

| Veri Kategorisi | Apple Karşılığı | Kullanım Amacı | Kullanıcı Kimliğiyle İlişkili mi? (Linked to User) | Takip Amaçlı Kullanılıyor mu? (Tracking) |
| :--- | :--- | :--- | :--- | :--- |
| **İletişim Bilgileri (Contact Info)** | Email Address & Name | **App Functionality** (Kayıt, giriş ve hesap eşleştirme) | **Evet** (Yes) | **Hayır** (No) |
| **Tanımlayıcılar (Identifiers)** | User ID | **App Functionality** (Kullanıcı hesabını ve sınav kayıtlarını tutma) | **Evet** (Yes) | **Hayır** (No) |
| **Tanımlayıcılar (Identifiers)** | Device ID (IDFA / Ad ID) | **Third-Party Advertising** (Google AdMob reklamları için) | **Hayır** (No - Not Linked) | **Hayır** (No - ATT iznine bağlı anonim reklam isteği) |
| **Kullanım Verileri (Usage Data)** | Product Interaction | **App Functionality / Personalization** (Çözülen sorular, başarı yüzdesi, AI Koç analizleri) | **Evet** (Yes) | **Hayır** (No) |
| **Satın Alma Geçmişi (Purchases)** | Purchase History | **App Functionality** (Abonelik / Premium durumunu doğrulama) | **Evet** (Yes) | **Hayır** (No) |
| **Tanılama (Diagnostics)** | Crash Data / Performance | **App Functionality** (Hata tespiti ve performans takibi) | **Hayır** (No) | **Hayır** (No) |

---

### 3. Apple'ın 4 Kritik Sorusuna Verilecek Yanıtlar:

1. **Veriler kullanıcıları takip etmek için (Tracking) mi kullanılıyor?**
   - **HAYIR (No).** (Veriler kullanıcıyı başka şirketlerin uygulamalarında takip etmek veya veri simsarlarına satmak için kullanılmaz).
2. **Kullanıcı verileri üçüncü şahıslara satılıyor mu?**
   - **HAYIR (No).**
3. **Veriler kullanıcı kimliğiyle ilişkilendiriliyor mu? (Linked to User)**
   - **EVET (Yes).** (E-posta, isim ve test çözme geçmişi kullanıcının Supabase hesabıyla eşleşir).
4. **Kullanıcı hesap silme mekanizması mevcut mu?**
   - **EVET (Yes).** (Uygulama içinde Settings > Profile Details > Delete Account menüsünden anında ve kalıcı olarak silinebilir. Apple Guideline 5.1.1 tam uyumlu).
