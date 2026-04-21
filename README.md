# Boğazköy Bahar Şenliği Voleybol Turnuvası

Mobil uyumlu Next.js uygulaması. Herkes takım başvurusu yapabilir, onaylı takımları ve son kura sonucunu görebilir. Yönetici şifreyle giriş yaparak başvuruları onaylar, reddeder, siler ve grup/eleme kurası çeker.

## Yerel Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Ardından `http://localhost:3000` adresini aç.

## Supabase Kurulumu

1. Supabase'te yeni proje oluştur.
2. SQL Editor ekranını aç.
3. `supabase/schema.sql` dosyasındaki SQL'i yapıştırıp çalıştır.
4. Project Settings → API ekranından şu değerleri al:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`
5. `.env` dosyasına bu değerleri ve kendi `ADMIN_PASSWORD` değerini yaz.

## Vercel Yayınlama

1. Projeyi GitHub'a gönder.
2. Vercel'de New Project ile repo'yu import et.
3. Environment Variables bölümüne şunları ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy'a bas.

Yayına çıktıktan sonra `/` üzerinden site açılır. Yönetici girişi alt menüdeki “Yönetim” ekranından yapılır.
