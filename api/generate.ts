export const config = { maxDuration: 60 };

type Img = { data: string; mimeType: string };

async function gemini(prompt: string, aspectRatio: string, images: Img[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY belum diset');
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';

  const parts: any[] = [{ text: prompt }];
  for (const im of images) parts.push({ inline_data: { mime_type: im.mimeType, data: im.data } });

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } },
      }),
    }
  );
  const j: any = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Gemini error');

  const out = j.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData || p.inline_data);
  const d = out?.inlineData || out?.inline_data;
  if (!d) throw new Error('Gemini tidak mengembalikan gambar (mungkin diblokir safety filter)');
  return { base64: d.data, mimeType: d.mimeType || d.mime_type || 'image/png' };
}

const OPENAI_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '3:4': '1024x1536',
  '9:16': '1024x1536',
  '4:3': '1536x1024',
  '16:9': '1536x1024',
};

async function openai(prompt: string, aspectRatio: string, images: Img[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY belum diset');
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const size = OPENAI_SIZE[aspectRatio] || '1024x1024';

  let r: Response;
  if (images.length > 0) {
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', prompt);
    form.append('size', size);
    form.append('quality', 'medium');
    form.append('output_format', 'jpeg');
    images.forEach((im, i) => {
      form.append('image[]', new Blob([Buffer.from(im.data, 'base64')], { type: im.mimeType }), `ref${i}.jpg`);
    });
    r = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, size, quality: 'medium', output_format: 'jpeg' }),
    });
  }
  const j: any = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'OpenAI error');
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI tidak mengembalikan gambar');
  return { base64: b64, mimeType: 'image/jpeg' };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { provider, prompt, aspectRatio = '1:1', images = [] } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });
    const out =
      provider === 'openai'
        ? await openai(prompt, aspectRatio, images)
        : await gemini(prompt, aspectRatio, images);
    res.status(200).json(out);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}