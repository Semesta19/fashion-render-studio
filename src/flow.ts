export type Provider = 'gemini' | 'openai';
type Media = { mediaId: string; base64: string; mimeType: string; type: string; name?: string };

let provider: Provider = 'gemini';
export const setProvider = (p: Provider) => { provider = p; };

const store = new Map<string, Media>();

const MAX_SIDE = 1280; // jaga payload < 4.5MB (batas body Vercel)

function shrink(m: Media): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve({ data: c.toDataURL('image/jpeg', 0.85).split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar referensi'));
    img.src = `data:${m.mimeType};base64,${m.base64}`;
  });
}

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { /* bukan JSON */ }
  if (!r.ok) throw new Error(json.error || `Server error ${r.status}`);
  return json;
}

export const Flow = {
  async upload({ base64, mimeType, name }: { base64: string; mimeType: string; name?: string }) {
    const mediaId = crypto.randomUUID();
    store.set(mediaId, { mediaId, base64, mimeType, type: 'image', name });
    return { mediaId };
  },

  media: {
    select({ filter }: { filter?: string }): Promise<Media> {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = filter === 'image' ? 'image/*' : '*/*';
        input.onchange = () => {
          const f = input.files?.[0];
          if (!f) return reject(new Error('cancelled'));
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            const mediaId = crypto.randomUUID();
            const m: Media = { mediaId, base64, mimeType: f.type, type: 'image', name: f.name };
            store.set(mediaId, m);
            resolve(m);
          };
          reader.onerror = () => reject(new Error('Gagal membaca file'));
          reader.readAsDataURL(f);
        };
        input.addEventListener('cancel', () => reject(new Error('cancelled')));
        input.click();
      });
    },
  },

  generate: {
    async text(prompt: string, opts?: { systemInstruction?: string }) {
      return post('/api/enhance', { prompt, systemInstruction: opts?.systemInstruction });
    },

    async image(opts: {
      prompt: string;
      referenceImageMediaIds?: string[];
      aspectRatio: string;
      modelDisplayName?: string;
    }) {
      const refs = (opts.referenceImageMediaIds ?? [])
        .map((id) => store.get(id))
        .filter(Boolean) as Media[];
      const images = await Promise.all(refs.map(shrink));
      return post('/api/generate', {
        provider,
        prompt: opts.prompt,
        aspectRatio: opts.aspectRatio,
        images,
      }); // → { base64, mimeType }
    },
  },

  download({ base64, mimeType, filename }: { base64: string; mimeType: string; filename: string }) {
    const a = document.createElement('a');
    a.href = `data:${mimeType};base64,${base64}`;
    a.download = filename;
    a.click();
  },
};