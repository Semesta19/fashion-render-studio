import { kieTaskInfo } from './_kie';

export const config = { maxDuration: 30 };

const MAX_INLINE_BYTES = 3_200_000; // batas respons Vercel ±4.5MB (base64 +33%)

export default async function handler(req: any, res: any) {
  try {
    const taskId = String(req.query?.taskId || '');
    if (!taskId) return res.status(400).json({ error: 'taskId kosong' });

    const info = await kieTaskInfo(taskId);
    if (info.state === 'fail') {
      return res.status(200).json({ state: 'fail', error: info.failMsg || 'Generasi gagal di kie.ai' });
    }
    if (info.state !== 'success') return res.status(200).json({ state: info.state });

    let url: string | undefined;
    try {
      url = JSON.parse(info.resultJson || '{}').resultUrls?.[0];
    } catch { /* abaikan */ }
    if (!url) return res.status(200).json({ state: 'fail', error: 'kie.ai tidak mengembalikan gambar' });

    // Unduh di server (hindari masalah CORS di browser) bila cukup kecil.
    const img = await fetch(url);
    if (!img.ok) return res.status(200).json({ state: 'success', url });
    const buf = Buffer.from(await img.arrayBuffer());
    const mimeType = img.headers.get('content-type')?.split(';')[0] || 'image/png';
    if (buf.length > MAX_INLINE_BYTES) return res.status(200).json({ state: 'success', url, mimeType });
    res.status(200).json({ state: 'success', url, mimeType, base64: buf.toString('base64') });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
