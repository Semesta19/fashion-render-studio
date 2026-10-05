export const config = { maxDuration: 30 };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY belum diset');
    const { prompt, systemInstruction } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });

    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const j: any = await r.json();
    if (!r.ok) throw new Error(j.error?.message || 'Gemini error');
    const text = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    res.status(200).json({ text });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}