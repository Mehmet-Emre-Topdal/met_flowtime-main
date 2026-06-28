Flowtime Mobile — Uygulama Planı
1. Teknoloji & Mimari Kararlar
Katman	Seçim	Gerekçe
Framework	Expo (React Native) + TypeScript	Native iOS/Android, store'a çıkabilir
Navigasyon	Expo Router (file-based, dosya tabanlı)	Next.js Pages router'a en yakın zihinsel model
Auth + Data	Firebase JS SDK doğrudan (firebase/auth, firebase/firestore)	Web'de zaten kullanılan SDK; aynı proje, aynı koleksiyonlar, realtime + offline cache bedava
State	Redux Toolkit (sadece auth + UI state) + Firestore onSnapshot hook'ları (data)	Realtime liste; minimum boilerplate. RTK Query//api katmanını kullanmıyoruz
Tema	CSS değişkenleri → TS theme objesi	Birebir aynı renkler
İkonlar	@expo/vector-icons (Lucide/Ionicons)	PrimeIcons karşılığı
Backend kararı: /api route'larını mobilde kullanmıyoruz. Onlar firebase-admin (server-only) ve deploy + CORS gerektirir. Mobil app doğrudan Firestore'a bağlanır → daha hızlı, realtime, offline. Tek bedeli: web tarafında sunucuda olan birkaç mantığın (daily reset, order atama) mobile taşınması + Firestore Security Rules yazılması.

2. Klasör Yapısı (mobile/)

mobile/
├── app/                        # Expo Router (ekranlar)
│   ├── _layout.tsx             # Root: Redux Provider + auth guard
│   ├── login.tsx
│   └── (tabs)/
│       ├── _layout.tsx         # Bottom tab bar
│       ├── index.tsx           # Ana Sayfa — sadece görev LİSTESİ
│       ├── gps.tsx
│       └── settings.tsx
├── src/
│   ├── theme/                  # colors.ts, spacing.ts (web _variables.scss portu)
│   ├── lib/firebase.ts         # web'deki firebase.ts'in EXPO_PUBLIC_ portu
│   ├── types/                  # web src/types/* birebir kopya (paylaşılan model)
│   ├── store/                  # auth slice + UI slice
│   ├── features/
│   │   ├── tasks/              # useTasks() onSnapshot hook + CRUD + TaskCard, TaskModal
│   │   ├── collections/        # useCollections() + selector + ekleme
│   │   ├── gps/                # useGps() + GPS ekranı
│   │   └── settings/           # flow intervals, gps display
│   └── components/             # ortak UI (Button, Card, Sheet, Input)
├── app.json / app.config.ts    # Expo config + EXPO_PUBLIC_FIREBASE_* env
└── package.json
3. Tema Portu
_variables.scss'teki tüm CSS değişkenleri tek bir theme/colors.ts objesine taşınır (accent #7c6cd4, surface #fff, background #f6f6f9, GPS goal/plan/system renkleri, radius, shadow vb.). RN'de CSS değişkeni yok → bir theme objesi + (opsiyonel) useTheme() hook ile tüm ekranlar aynı paleti kullanır. Font: Plus Jakarta Sans expo-font ile yüklenir.

4. Ekranlar (sade kapsam)
Login (login.tsx) — email/şifre + kayıt. Web authApi'deki Firebase auth mantığının aynısı, hata   mesajlarıyla.
Ana Sayfa ((tabs)/index.tsx) — Sadece liste görünümü. Kanban yok, Panel A/B yok, SelectButton yok. Üstte: selamlama + CollectionSelector + "Daily" filtresi (opsiyonel). Liste: onSnapshot ile canlı görevler, status'e göre (todo/inprogress/done). Görev kartında: checkbox/status toggle, numeric sayaç (+/–), tap → düzenleme sheet'i. Alt köşede FAB → yeni görev.
GPS ((tabs)/gps.tsx) — GPS kaydını görüntüle/oluştur/düzenle: goals, anti-goals, major moves, crystal ball, system. Web gps.tsx yapısının sadeleştirilmiş hali.
Settings ((tabs)/settings.tsx) — Flow interval ayarları, GPS counter görünürlüğü (web user-configs), dil, çıkış. Koleksiyon yönetimi (ekle/yeniden adlandır/renk/sil) buraya veya CollectionSelector içine.
Navigasyon: alt tab bar — Görevler / GPS / Ayarlar (3 sekme), aktif renk accent.

5. Veri Katmanı Deseni
Her feature için tek bir hook:


useTasks()        → onSnapshot(query(tasks, where userId)) → {tasks, loading}
createTask/updateTask/deleteTask/setStatus → Firestore doc yazma (serverTimestamp)
Aynısı useCollections(), useGps(), useUserConfig() için. Realtime + offline persistence (initializeFirestore ile cache) otomatik gelir. Web'deki optimistic update karmaşıklığına gerek kalmaz — onSnapshot zaten anında günceller.

Mobile'a taşınacak server mantığı: order atama (en yüksek order+1), daily task reset (uygulama açılışında lastResetDate < bugün olanları sıfırla).

6. Güvenlik (yeni gereksinim)
Doğrudan Firestore eriştiğimiz için Firestore Security Rules yazılmalı: her dökümanda request.auth.uid == resource.data.userId. Bu web'in admin SDK'sıyla zaten korunan veriyi mobil için de güvene alır. (Web'i de etkilemez, sadece client erişimini kısıtlar.)

7. Aşamalar (Milestones)
M0 — İskelet: npx create-expo-app, Expo Router, theme portu, firebase.ts, env, tab bar (boş ekranlar).
M1 — Auth: Login/register, auth guard, çıkış. Firestore rules deploy.
M2 — Görev Listesi: useTasks onSnapshot, TaskCard, status toggle, numeric sayaç, FAB + ekleme/düzenleme sheet. (Çekirdek değer)
M3 — Koleksiyonlar: selector + ekleme/silme, listede filtreleme.
M4 — GPS: görüntüle + oluştur/düzenle.
M5 — Ayarlar: flow intervals, gps counter, daily reset, dil.
M6 — Cila: boş durumlar, loading skeleton, animasyonlar, ikon/splash.
8. Açık Notlar
Aynı Firebase projesi kullanılacak → .env'deki Firebase config değerleri EXPO_PUBLIC_FIREBASE_* olarak mobile'a kopyalanır.
src/types/* dosyaları birebir kopyalanır (model tutarlılığı); ileride istersen ortak bir paket'e çıkarılabilir.