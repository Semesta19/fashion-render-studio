import { findKieModel, kieCreateTask, kieUpload, type Ratio } from './_kie';

export const config = { maxDuration: 60 };

// Upload referensi → buat task. Hasil dipolling klien lewat /api/kie-status
// (supaya tidak kena batas durasi fungsi Vercel).
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { model: id, prompt, aspectRatio = '1:1', images = [] } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });
    const m = findKieModel(String(id));
    if (!m) return res.status(400).json({ error: `Model kie.ai tidak dikenal: ${id}` });

    const hasRefs = images.length > 0;
    if (hasRefs && !m.edit) {
      return res.status(400).json({
        error: `${m.label} hanya teks→gambar dan tidak menerima gambar referensi (sketsa/tekstur). Pilih model lain.`,
      });
    }

    const refs = hasRefs ? images.slice(0, m.maxRefs) : [];
    const urls = await Promise.all(refs.map((im: any, i: number) => kieUpload(im.data, im.mimeType || 'image/jpeg', i)));

    const input = m.build({ prompt, ratio: aspectRatio as Ratio, urls });
    const taskId = await kieCreateTask(hasRefs ? m.edit! : m.text!, input);
    res.status(200).json({ taskId });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
