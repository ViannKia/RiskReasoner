# 🥊 TradePunch - AI Trading Risk Analyzer

![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-orange?logo=openai)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)

## 📋 Tentang Project

**TradePunch** adalah aplikasi web berbasis AI yang membantu trader crypto untuk **stress-test rencana trading** sebelum mengeksekusi posisi riil. Tidak seperti chatbot biasa atau sinyal trading, TradePunch membalik peran AI menjadi **penguji kritis** yang memaksa trader mempertanyakan logika dan risiko mereka sendiri.

### 🔥 Masalah yang Diselesaikan

- ❌ Trader pemula sering terjebak FOMO (*Fear Of Missing Out*)
- ❌ Keputusan trading didasari emosi, bukan logika
- ❌ Tidak ada proses self-questioning sebelum eksekusi
- ❌ Alat trading AI hanya memberi sinyal, bukan menguji logika

### ✅ Solusi TradePunch

- 🤖 **AI sebagai Interogator** — AI yang bertanya, bukan menjawab
- 📊 **Verdict Dashboard** — Risk score (0-100) + Emotional Risk + Portfolio Match + Rekomendasi
- ⚡ **Tanpa Sinyal Beli/Jual** — Hanya menguji logika, trader tetap pegang kendali
- 🎯 **3-Step Progressive Questioning** — Pertanyaan makin tajam setiap jawaban

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|------------|
| 🎯 **Trade Plan Input** | Input asset, entry price, target, stop loss |
| 🧠 **AI Questioning (3x)** | AI memberikan 3 pertanyaan kritis progresif |
| 📊 **Verdict Dashboard** | Risk score, emotional risk, portfolio match, best action |
| 💰 **Live Price** | Harga real-time dari CoinGecko API |
| ⚖️ **Risk/Reward Calculator** | Hitung otomatis rasio risk/reward |
| 🔄 **Multi-Asset Support** | BTC, ETH, SOL, DOGE, + top 20 crypto |

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **AI Engine** | OpenRouter API (Llama 3.3 70B / auto-select free model) |
| **Price API** | CoinGecko API |
| **Deployment** | Vercel |
| **Icons & UI** | Tailwind CSS, React hooks |

## 🎨 Branding Identity

| Elemen | Deskripsi |
|--------|-----------|
| **Nama** | TradePunch — kombinasi "Trade" + "Punch" |
| **Logo** | Dua sarung tinju merah saling berhadapan |
| **Warna** | Dark gradient (#0a0a0f → #1a1a2e) + aksen merah (#ef4444) |
| **Font** | Poppins (sans-serif, modern, readable) |
| **Tagline** | "Let logic fight your emotions" |

## 🚀 Cara Menjalankan (Local Development)

```bash
# Clone repository
git clone https://github.com/ViannKia/TradePunch.git

# Masuk ke folder project
cd TradePunch

# Install dependensi
npm install

# Buat file environment
cp .env.example .env.local

# ISI .env.local dengan:
# OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Jalankan development server
npm run dev

```

## 🔧 Environment Variables

| Variable | Keterangan | Wajib? |
|----------|-------------|--------|
| `OPENROUTER_API_KEY` | API key dari OpenRouter untuk mengakses AI model | ✅ Ya |
| `OPENROUTER_API_URL` | Endpoint API OpenRouter (opsional, sudah default) | ❌ Tidak |

### Cara Mendapatkan API Key:

1. Buka [OpenRouter](https://openrouter.ai/keys)
2. Daftar akun gratis (via Google atau email)
3. Klik **Create Key**
4. Beri nama misal `TradePunch`
5. Copy key yang dimulai dengan `sk-or-v1-...`

### Contoh File `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
```

## 👨‍💻 Author

**Adrianus Vianto Eban Kia**

- GitHub: [@ViannKia](https://github.com/ViannKia)
- LinkedIn: [@ViannKia](https://linkedin.com/in/viannkia)

## 📄 License

MIT License - Copyright (c) 2026 Adrianus Vianto Eban Kia
