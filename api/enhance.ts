export const config = { maxDuration: 30 };

// Urutan model: env dulu, lalu default terbaru, lalu cadangan.
// Bila model ditolak (tidak tersedia / dihentikan), otomatis coba berikutnya.
const DEFAULT_MODELS = ['gemini-3.8-flash', 'gemini-3-flash', 'gemini-2.5-flash'];

async function callGemini(model: string, key: string, body: any) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    }
  );
  const j: any = await r.json();
  return { ok: r.ok, status: r.status, j };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY belum diset');
    const { prompt, systemInstruction, images = [] } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });

    const body = {
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      contents: [
        {
          parts: [
            ...images.map((im: any) => ({ inline_data: { mime_type: im.mimeType, data: im.data } })),
            { text: prompt },
          ],
        },
      ],
    };

    const models = [process.env.GEMINI_TEXT_MODEL, ...DEFAULT_MODELS].filter(
      (m, i, a): m is string => !!m && a.indexOf(m) === i
    );

    let lastError = 'Gemini error';
    for (const model of models) {
      const { ok, status, j } = await callGemini(model, key, body);
      if (ok) {
        const text = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
        return res.status(200).json({ text });
      }
      lastError = j.error?.message || lastError;
      // Lanjut ke model berikutnya hanya jika masalahnya ada di model (404 / dihentikan)
      const modelIssue = status === 404 || /no longer available|not found|not supported/i.test(lastError);
      if (!modelIssue) break;
    }
    throw new Error(lastError);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
