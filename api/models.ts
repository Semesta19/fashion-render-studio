import { KIE_MODELS } from './_kie';

// Daftar model yang tersedia di UI, sesuai API key yang diset di environment.
export default function handler(_req: any, res: any) {
  const models: { id: string; label: string; group: string; maxRefs: number }[] = [];

  if (process.env.KIE_API_KEY) {
    for (const m of KIE_MODELS) {
      models.push({ id: `kie:${m.id}`, label: m.label, group: `kie.ai · ${m.group}`, maxRefs: m.maxRefs });
    }
  }
  if (process.env.GEMINI_API_KEY) {
    models.push({ id: 'gemini', label: 'Nano Banana (Gemini langsung)', group: 'API langsung', maxRefs: 10 });
  }
  if (process.env.OPENAI_API_KEY) {
    models.push({ id: 'openai', label: 'GPT Image (OpenAI langsung)', group: 'API langsung', maxRefs: 16 });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ models });
}
