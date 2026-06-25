# CLAUDE.md — Flowtime Project Guide

## Proje Özeti

Flowtime tekniği ile Kanban board'u birleştiren, yüksek görsel kaliteli, performanslı ve güvenli üretkenlik platformu. Kullanıcıların odaklanma alışkanlıklarını takip eder ve analiz eder.

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js (Page Router), TypeScript |
| State & Veri | RTK Query |
| Client DB | Firebase Client SDK |
| Server DB | Next.js API Routes + Firebase Admin SDK |
| UI | PrimeReact + Tailwind CSS |
| AI | (removed) |
| Auth | Firebase (Email/Password) |

---

## Mimari Kurallar

### Hybrid Data Architecture
- **Client SDK:** Görev CRUD, anlık sayaç takibi → hız ve real-time için
- **Server-Side API Routes:** Analitik hesaplamalar, aggregation → performans ve güvenlik için
- **Security:** Firebase Security Rules ile veri erişimi sadece sahibi olan `uid` ile sınırlı

### RTK Query Zorunluluğu
Tüm veri çekme işlemleri — ister API route ister Client SDK olsun — RTK Query içine sarmalanacak.

---

## Kod Yazma Kuralları

- **Yorum yok:** Kodda asla yorum satırı kullanılmaz
- **İsimlendirme:** Fonksiyon ve değişken isimleri işlevini tam olarak açıklamalı
- **Tip güvenliği:** TypeScript strict mod, `any` kullanılmaz
- **Sadelik:** Over-engineering yapma, sadece istenen değişikliği yap

---

## Uygulanan Özellikler

### Faz 1 — Core Operations (Tamamlandı)
- Email/şifre ile giriş/çıkış
- Görev CRUD (Başlık + Açıklama)
- Kanban board (Drag & Drop, statü değiştirme)
- Flowtime Timer (dinamik mola hesabı, aktif göreve süre loglama)

### Faz 2 — Intelligence & Analytics (Aktif Geliştirme)
- Focus Analytics (haftalık heatmap, daily/weekly/monthly istatistikler)
- 12 analitik metrik (peak_hours, flow_streak, focus_density vb.)
- Distraction Inbox (hızlı not → To Do dönüşümü)

---

---

## Firestore Koleksiyonları

Detaylar için: [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)

- `users/{userId}` — Kullanıcı profili
- `tasks/{taskId}` — Görevler (sayısal flag: isNumeric/targetCount/remainingCount, GPS bağlantısı: gpsId/majorMoveId)
- `sessions/{sessionId}` — Odak oturumları (durationSeconds, breakDurationSeconds, taskId, userId)
- `gps/{gpsId}` — GPS hedefleri (Goal/Plan/System; majorMoves görevlere bağlanır)

---

## Önemli Dosyalar

| Dosya | Görev |
|---|---|
| `src/features/analytics/utils/analyticsCalculations.ts` | Frontend analitik hesaplamaları |
| `src/features/gps/GpsView.tsx` | GPS hedef yönetimi (liste/oluştur/detay/düzenle) |
| `src/pages/api/gps/` | GPS server-side API route'ları (major move → görev oluşturma) |
