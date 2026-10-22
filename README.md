# fashion-render-studio
Studio for render fashion clothing

## Model gambar
Daftar model di dropdown dibuat otomatis dari API key yang di-set (`/api/models`):

- `KIE_API_KEY` → 23 model dari [kie.ai](https://kie.ai) (Nano Banana, Imagen 4, GPT Image, Seedream, Flux 2, Grok Imagine, Qwen, Z-Image)
- `GEMINI_API_KEY` / `OPENAI_API_KEY` → API langsung (opsional)

Menambah model kie.ai: tambahkan satu baris di `api/_kie.ts` (`KIE_MODELS`).
Model yang `maxRefs: 0` hanya teks→gambar (tidak bisa dipakai bila ada sketsa/tekstur).

## Deploy ke Vercel
1. Import repo GitHub di Vercel.
2. Settings → Environment Variables → tambah `KIE_API_KEY` (jangan commit ke repo).
3. Redeploy.

Lokal: `npm i -g vercel && vercel dev` (route `/api/*` tidak jalan di `vite dev`).
