// Registry model gambar kie.ai + helper (upload, create task, status).
// File berawalan "_" tidak dijadikan route oleh Vercel.

export const KIE_API = 'https://api.kie.ai';
export const KIE_UPLOAD = 'https://kieai.redpandaai.co';

export type Ratio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
type BuildArgs = { prompt: string; ratio: Ratio; urls: string[] };

export type KieModel = {
  id: string; // dipakai di UI & riwayat → "kie:<id>"
  label: string;
  group: string;
  text?: string; // model-id kie untuk teks→gambar
  edit?: string; // model-id kie untuk gambar→gambar (referensi)
  maxRefs: number; // 0 = tidak mendukung referensi
  build: (a: BuildArgs) => Record<string, unknown>;
};

// ---------- builder per keluarga model ----------
const withUrls = (key: string, urls: string[]) => (urls.length ? { [key]: urls } : {});

const nano = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  image_input: urls,
  aspect_ratio: ratio,
  resolution: '1K',
  output_format: 'jpg',
});

const nanoV1 = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('image_urls', urls),
  image_size: ratio,
  output_format: 'jpeg',
});

const gptNew = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('input_urls', urls),
  aspect_ratio: ratio,
  resolution: '1K',
});

const GPT15_RATIO: Record<Ratio, string> = { '1:1': '1:1', '3:4': '2:3', '4:3': '3:2', '9:16': '2:3', '16:9': '3:2' };
const gpt15 = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('input_urls', urls),
  aspect_ratio: GPT15_RATIO[ratio],
  quality: 'medium',
});

const flux2 = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('input_urls', urls),
  aspect_ratio: ratio,
  resolution: '1K',
});

const seedream = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('image_urls', urls),
  aspect_ratio: ratio,
  quality: 'basic',
});

const SEEDREAM4_SIZE: Record<Ratio, string> = {
  '1:1': 'square_hd',
  '3:4': 'portrait_4_3',
  '4:3': 'landscape_4_3',
  '9:16': 'portrait_16_9',
  '16:9': 'landscape_16_9',
};
const seedream4 = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  ...withUrls('image_urls', urls),
  image_size: SEEDREAM4_SIZE[ratio],
  image_resolution: '1K',
  max_images: 1,
});

const GROK_RATIO: Record<Ratio, string> = { '1:1': '1:1', '3:4': '2:3', '4:3': '3:2', '9:16': '9:16', '16:9': '16:9' };
const grok2 = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  aspect_ratio: GROK_RATIO[ratio],
  ...withUrls('image_urls', urls),
});
const grok1 = ({ prompt, ratio, urls }: BuildArgs) =>
  urls.length ? { prompt, image_urls: urls.slice(0, 1) } : { prompt, aspect_ratio: GROK_RATIO[ratio] };

const imagen = ({ prompt, ratio }: BuildArgs) => ({ prompt, aspect_ratio: ratio, num_images: '1' });
const zimage = ({ prompt, ratio }: BuildArgs) => ({ prompt, aspect_ratio: ratio });

const QWEN_SIZE: Record<Ratio, string> = {
  '1:1': 'square_hd',
  '3:4': 'portrait_4_3',
  '4:3': 'landscape_4_3',
  '9:16': 'portrait_16_9',
  '16:9': 'landscape_16_9',
};
const qwen = ({ prompt, ratio, urls }: BuildArgs) => ({
  prompt,
  image_size: QWEN_SIZE[ratio],
  ...(urls.length ? { image_url: urls[0] } : {}),
  output_format: 'jpeg',
});

// ---------- daftar model ----------
export const KIE_MODELS: KieModel[] = [
  // Google
  { id: 'nano-banana-2-1', label: 'Nano Banana 2.1', group: 'Google', text: 'nano-banana-2-1', edit: 'nano-banana-2-1', maxRefs: 10, build: nano },
  { id: 'nano-banana-2', label: 'Nano Banana 2', group: 'Google', text: 'nano-banana-2', edit: 'nano-banana-2', maxRefs: 10, build: nano },
  { id: 'nano-banana-2-lite', label: 'Nano Banana 2 Lite', group: 'Google', text: 'nano-banana-2-lite', edit: 'nano-banana-2-lite', maxRefs: 10, build: nano },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', group: 'Google', text: 'nano-banana-pro', edit: 'nano-banana-pro', maxRefs: 8, build: nano },
  { id: 'nano-banana', label: 'Nano Banana', group: 'Google', text: 'google/nano-banana', edit: 'google/nano-banana-edit', maxRefs: 10, build: nanoV1 },
  { id: 'imagen4-ultra', label: 'Imagen 4 Ultra', group: 'Google', text: 'google/imagen4-ultra', maxRefs: 0, build: imagen },
  { id: 'imagen4', label: 'Imagen 4', group: 'Google', text: 'google/imagen4', maxRefs: 0, build: imagen },
  { id: 'imagen4-fast', label: 'Imagen 4 Fast', group: 'Google', text: 'google/imagen4-fast', maxRefs: 0, build: imagen },

  // OpenAI
  { id: 'gpt-image-2-5-sunburst', label: 'GPT Image 2.5 Sunburst', group: 'OpenAI', text: 'gpt-image-2-5-sunburst-text-to-image', edit: 'gpt-image-2-5-sunburst-image-to-image', maxRefs: 16, build: gptNew },
  { id: 'gpt-image-2-5-flare', label: 'GPT Image 2.5 Flare', group: 'OpenAI', text: 'gpt-image-2-5-flare-text-to-image', edit: 'gpt-image-2-5-flare-image-to-image', maxRefs: 16, build: gptNew },
  { id: 'gpt-image-2', label: 'GPT Image 2', group: 'OpenAI', text: 'gpt-image-2-text-to-image', edit: 'gpt-image-2-image-to-image', maxRefs: 16, build: gptNew },
  { id: 'gpt-image-1-5', label: 'GPT Image 1.5', group: 'OpenAI', text: 'gpt-image/1.5-text-to-image', edit: 'gpt-image/1.5-image-to-image', maxRefs: 16, build: gpt15 },

  // ByteDance
  { id: 'seedream-5-pro', label: 'Seedream 5.0 Pro', group: 'ByteDance', text: 'seedream/5-pro-text-to-image', edit: 'seedream/5-pro-image-to-image', maxRefs: 10, build: seedream },
  { id: 'seedream-5-lite', label: 'Seedream 5.0 Lite', group: 'ByteDance', text: 'seedream/5-lite-text-to-image', edit: 'seedream/5-lite-image-to-image', maxRefs: 10, build: seedream },
  { id: 'seedream-5-flash', label: 'Seedream 5.0 Flash', group: 'ByteDance', text: 'seedream/5-flash-text-to-image', edit: 'seedream/5-flash-image-to-image', maxRefs: 10, build: seedream },
  { id: 'seedream-4-5', label: 'Seedream 4.5', group: 'ByteDance', text: 'seedream/4.5-text-to-image', edit: 'seedream/4.5-edit', maxRefs: 10, build: seedream },
  { id: 'seedream-4', label: 'Seedream 4.0', group: 'ByteDance', text: 'bytedance/seedream-v4-text-to-image', edit: 'bytedance/seedream-v4-edit', maxRefs: 10, build: seedream4 },

  // Black Forest Labs
  { id: 'flux-2-pro', label: 'Flux 2 Pro', group: 'Flux', text: 'flux-2/pro-text-to-image', edit: 'flux-2/pro-image-to-image', maxRefs: 8, build: flux2 },
  { id: 'flux-2-flex', label: 'Flux 2 Flex', group: 'Flux', text: 'flux-2/flex-text-to-image', edit: 'flux-2/flex-image-to-image', maxRefs: 8, build: flux2 },

  // xAI
  { id: 'grok-imagine-2', label: 'Grok Imagine 2.0', group: 'xAI', text: 'grok-imagine-image-2-0/text-to-image', edit: 'grok-imagine-image-2-0/image-edit', maxRefs: 5, build: grok2 },
  { id: 'grok-imagine', label: 'Grok Imagine', group: 'xAI', text: 'grok-imagine/text-to-image', edit: 'grok-imagine/image-to-image', maxRefs: 1, build: grok1 },

  // Lainnya
  { id: 'qwen', label: 'Qwen', group: 'Lainnya', text: 'qwen/text-to-image', edit: 'qwen/image-edit', maxRefs: 1, build: qwen },
  { id: 'z-image', label: 'Z-Image', group: 'Lainnya', text: 'z-image', maxRefs: 0, build: zimage },
];

export const findKieModel = (id: string) => KIE_MODELS.find((m) => m.id === id);

// ---------- helper HTTP ----------
export function kieKey() {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error('KIE_API_KEY belum diset');
  return key;
}

const authHeaders = () => ({ Authorization: `Bearer ${kieKey()}`, 'Content-Type': 'application/json' });

export async function kieUpload(base64: string, mimeType: string, i: number): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const r = await fetch(`${KIE_UPLOAD}/api/file-base64-upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      base64Data: `data:${mimeType};base64,${base64}`,
      uploadPath: 'fashion-render-studio',
      fileName: `ref-${Date.now()}-${i}.${ext}`,
    }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || j.code !== 200 || !j.data?.downloadUrl) {
    throw new Error(`Upload referensi ke kie.ai gagal: ${j.msg || r.status}`);
  }
  return j.data.downloadUrl as string;
}

export async function kieCreateTask(model: string, input: Record<string, unknown>): Promise<string> {
  const r = await fetch(`${KIE_API}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, input }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (j.code !== 200 || !j.data?.taskId) {
    const hint = j.code === 402 ? ' (kredit kie.ai habis)' : '';
    throw new Error(`kie.ai (${model}): ${j.msg || `HTTP ${r.status}`}${hint}`);
  }
  return j.data.taskId as string;
}

export async function kieTaskInfo(taskId: string) {
  const r = await fetch(`${KIE_API}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${kieKey()}` },
  });
  const j: any = await r.json().catch(() => ({}));
  if (j.code !== 200 || !j.data) throw new Error(`kie.ai: ${j.msg || `HTTP ${r.status}`}`);
  return j.data as {
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    resultJson?: string;
    failMsg?: string;
  };
}
