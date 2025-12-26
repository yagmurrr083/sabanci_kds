# Sabancı Vakfı - Karar Destek Sistemi (KDS)

Sürdürülebilirlik odaklı firma ve girişimci analiz platformu.

## 🚀 Vercel ile Deployment

### 1. Önkoşullar

- Node.js 18+
- Supabase hesabı ve proje
- Vercel hesabı

### 2. Supabase Konfigürasyonu

⚠️ **ÖNEMLİ: Service Role Key'i Rotate Edin!**

Eğer service role key'inizi herhangi bir yerde paylaştıysanız:
1. Supabase Dashboard → Settings → API
2. "Reset service_role secret" butonuna tıklayın
3. Yeni key'i kopyalayın

### 3. Ortam Değişkenlerini Ayarlayın

Vercel projesinde şu environment variables'ları ekleyin:

```
SUPABASE_URL=https://nsgajaiblzuevodmqozm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ2FqYWlibHp1ZXZvZG1xb3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTE2MDYsImV4cCI6MjA4MTkyNzYwNn0.02eTdn7Rz6Rje5I3Q7LAog2FMoOQGRoeBs_MfHGXSjs
SUPABASE_SERVICE_ROLE_KEY=<ROTATED_KEY_BURAYA>
DATABASE_URL=postgresql://postgres.nsgajaiblzuevodmqozm:<SIFRENIZ>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
DB_SSLMODE=require
NODE_ENV=production
```

### 4. Deployment Adımları

#### GitHub Üzerinden Deploy

```bash
# 1. Repository oluşturun
git init
git add .
git commit -m "Initial commit: Sabancı KDS"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main

# 2. Vercel'e import edin
# - vercel.com'a gidin
# - "New Project" tıklayın
# - GitHub repo'nuzu seçin
# - Environment Variables ekleyin
# - Deploy edin
```

#### Doğrudan Vercel CLI ile Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 5. Lokal Test

```bash
# 1. .env dosyası oluşturun
cp .env.example .env
# .env dosyasını düzenleyip eksik değerleri doldurun

# 2. Bağımlılıkları yükleyin
npm install

# 3. Sunucuyu başlatın
npm run dev

# 4. Tarayıcıda açın
http://localhost:3000
```

## 📊 DSS Özellikleri

Bu sistem 14 KDS özelliğine uygun şekilde geliştirilmiştir:

✅ Geleceğe yönelik planlama (what-if senaryoları)
✅ Yarı-yapılandırılmış kararları destekler
✅ Karar vericiye yardımcı olur (onu değiştirmez)
✅ Tüm karar aşamalarını destekler
✅ Kullanıcı kontrolü altında
✅ Veri ve model tabanlarına erişir
✅ Analitik modeller kullanır
✅ İnteraktif ve kullanımı kolay
✅ Stratejik/taktik yönetim odaklı
✅ Bağımsız/bağımlı kararları destekler
✅ Bireysel ve grup karar vermeyi destekler
✅ Kullanım kolaylığı (Türkçe arayüz)
✅ Değişen koşullara esneklik (dinamik filtreler)
✅ Düzensiz/planlanmamış zamanlarda kullanılabilir

## 🛠 Teknoloji Stack'i

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Charts**: Chart.js v4
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📁 Proje Yapısı

```
sabanci_kds/
├── app.js                  # Ana Express uygulaması
├── package.json
├── vercel.json            # Vercel deployment config
├── .env.example           # Ortam değişkenleri template
├── controllers/
│   └── analizController.js  # Analiz endpoint logic
├── routers/
│   └── analizRouter.js      # API rotaları
├── db/
│   └── supabase.js          # Supabase client
├── middlewares/
│   └── errorHandler.js      # Hata yönetimi
├── views/
│   └── analiz.html          # Ana dashboard sayfası
└── public/
    ├── css/
    │   └── analiz.css       # Stil dosyası
    └── js/
        └── analiz.js        # Client-side logic
```

## 🔐 Güvenlik Notları

- Service role key **asla** browser'a expose edilmez
- Tüm hassas işlemler server-side yapılır
- RLS enabled olsa bile service role bypass eder
- Production ortamında error stack trace'leri gizlidir

## 📞 Destek

Sorularınız için lütfen proje sorumlusuna başvurun.
