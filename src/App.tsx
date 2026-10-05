import React, { useState, useEffect } from 'react';
import { Flow, setProvider } from 'flow-sdk';
import {
  SectionLabel,
  PillButton,
  FieldDropdown,
  TextInput,
  RangeSlider,
  SegmentedToggle,
} from './components/Primitives';

const GARMENT_TYPES = ['blouse', 'shirt', 'dress', 'jacket', 'hoodie', 't-shirt', 'skirt', 'pants'];
const GARMENT_LABELS: Record<string, string> = {
  blouse: 'Blus',
  shirt: 'Kemeja',
  dress: 'Gaun',
  jacket: 'Jaket',
  hoodie: 'Hoodie',
  't-shirt': 'Kaos',
  skirt: 'Rok',
  pants: 'Celana',
};

type SupportedRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type ImageProvider = 'gemini' | 'openai';

/** Sanitize a filename for safe download */
function sanitizeFilename(name: string, ext: string = 'png'): string {
  const clean = name
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);
  return `${clean || 'render'}_${Date.now()}.${ext}`;
}

const SiriLoading = () => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className="absolute inset-0 blur-[40px] opacity-60">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full animate-siri-blob-1" />
      <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-blue-400 rounded-full animate-siri-blob-2" />
      <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-cyan-400 rounded-full animate-siri-blob-3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500 rounded-full animate-siri-blob-4" />
    </div>
    <div className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-3xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
      <span className="material-symbols-outlined text-white text-[32px] animate-pulse">auto_awesome</span>
    </div>
  </div>
);

export default function App() {
  const [garmentType, setGarmentType] = useState('blouse');
  const [textureRepeat, setTextureRepeat] = useState(1);
  const [mirrorTiling, setMirrorTiling] = useState(false);
  const [textureMedia, setTextureMedia] = useState<any>(null);
  const [sketchMedia, setSketchMedia] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<SupportedRatio>('3:4');
  const [showControls, setShowControls] = useState(true);
  const [provider, setProviderState] = useState<ImageProvider>('gemini');

  const [isDraggingSketch, setIsDraggingSketch] = useState(false);
  const [isDraggingTexture, setIsDraggingTexture] = useState(false);

  useEffect(() => {
    setProvider(provider);
  }, [provider]);

  useEffect(() => {
    const id = 'ios-design-system-v6';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .ios-glass { backdrop-filter: blur(40px) saturate(210%); -webkit-backdrop-filter: blur(40px) saturate(210%); background-color: rgba(20, 20, 22, 0.82); }
      .ios-card { background: rgba(44, 44, 46, 0.6); border: 0.5px solid rgba(255, 255, 255, 0.1); }
      .ios-shadow-lg { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
      .canvas-container { background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }

      @keyframes popIn { from { transform: scale(0.95) translateY(12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

      @keyframes pulse-soft { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.1; } }
      .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      @keyframes siri-blob-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -30px) scale(1.1); } 66% { transform: translate(-10px, 20px) scale(0.9); } }
      @keyframes siri-blob-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, 10px) scale(0.9); } 66% { transform: translate(20px, -20px) scale(1.2); } }
      @keyframes siri-blob-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(15px, 25px) scale(1.15); } 66% { transform: translate(-25px, -15px) scale(0.85); } }
      @keyframes siri-blob-4 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 50% { transform: translate(0, 0) scale(1.3); opacity: 0.8; } }
      .animate-siri-blob-1 { animation: siri-blob-1 8s infinite ease-in-out; }
      .animate-siri-blob-2 { animation: siri-blob-2 10s infinite ease-in-out; }
      .animate-siri-blob-3 { animation: siri-blob-3 12s infinite ease-in-out; }
      .animate-siri-blob-4 { animation: siri-blob-4 6s infinite ease-in-out; }
      html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 26px; width: 26px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 3px solid rgba(0,0,0,0.1); margin-top: -11px; }
      input[type=range]::-webkit-slider-runnable-track { height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; }
    `;
    document.head.appendChild(style);
  }, []);

  const getClosestRatio = (width: number, height: number): SupportedRatio => {
    const ratio = width / height;
    const targets: { ratio: number; value: SupportedRatio }[] = [
      { ratio: 1, value: '1:1' },
      { ratio: 16 / 9, value: '16:9' },
      { ratio: 9 / 16, value: '9:16' },
      { ratio: 4 / 3, value: '4:3' },
      { ratio: 3 / 4, value: '3:4' },
    ];
    return targets.reduce((prev, curr) =>
      Math.abs(curr.ratio - ratio) < Math.abs(prev.ratio - ratio) ? curr : prev
    ).value;
  };

  const detectRatioFromMedia = (media: any) => {
    const img = new Image();
    img.onload = () => {
      const detected = getClosestRatio(img.width, img.height);
      setAspectRatio(detected);
    };
    img.src = `data:${media.mimeType};base64,${media.base64}`;
  };

  const processDroppedFile = async (file: File, type: 'sketch' | 'texture') => {
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang didukung.');
      return;
    }
    setIsUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;
      try {
        const uploaded = await Flow.upload({ base64, mimeType, name: file.name });
        const mediaObj = { mediaId: uploaded.mediaId, base64, mimeType, type: 'image', name: file.name };
        if (type === 'sketch') {
          setSketchMedia(mediaObj);
          detectRatioFromMedia(mediaObj);
          setResult(null);
        } else {
          setTextureMedia(mediaObj);
        }
      } catch (err) {
        setError('Gagal mengunggah file ke galeri.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSketch = async () => {
    try {
      const media = await Flow.media.select({ filter: 'image' });
      setSketchMedia(media);
      detectRatioFromMedia(media);
      setResult(null);
    } catch (e) {
      console.log('Selection cancelled');
    }
  };

  const handleSelectTexture = async () => {
    try {
      const media = await Flow.media.select({ filter: 'image' });
      setTextureMedia(media);
    } catch (e) {
      console.log('Selection cancelled');
    }
  };

  const handleEnhancePrompt = async () => {
    if (!customPrompt.trim()) return;
    setIsEnhancing(true);
    try {
      const { text } = await Flow.generate.text(
        `Expand this fashion design idea into a more professional prompt for AI. 
        Focus on silhouette, stitching details, and fabric properties. 
        Keep it concise. Original idea: ${customPrompt}`,
        { systemInstruction: 'You are a professional fashion concept artist.' }
      );
      setCustomPrompt(text.trim());
    } catch (err) {
      console.error('Enhancement failed', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const processTiledTexture = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!textureMedia) return reject('No texture');
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas failed');
        const size = canvas.width / textureRepeat;
        for (let y = 0; y < textureRepeat; y++) {
          for (let x = 0; x < textureRepeat; x++) {
            ctx.save();
            ctx.translate(x * size, y * size);
            if (mirrorTiling) {
              const flipX = x % 2 === 1;
              const flipY = y % 2 === 1;
              ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
              ctx.drawImage(img, flipX ? -size : 0, flipY ? -size : 0, size, size);
            } else {
              ctx.drawImage(img, 0, 0, size, size);
            }
            ctx.restore();
          }
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.onerror = () => reject('Gagal memuat gambar tekstur');
      img.src = `data:${textureMedia.mimeType};base64,${textureMedia.base64}`;
    });
  };

  const handleGenerate = async () => {
    setError(null);
    if (!sketchMedia && !customPrompt.trim()) {
      return setError('Sediakan sketsa atau deskripsi desain.');
    }
    setIsGenerating(true);
    try {
      let referenceIds: string[] = [];
      if (sketchMedia) referenceIds.push(sketchMedia.mediaId);

      let textureInfo = '';
      if (textureMedia) {
        const processedBase64 = await processTiledTexture();
        const uploaded = await Flow.upload({
          base64: processedBase64,
          mimeType: 'image/jpeg',
          name: 'Reference Pattern',
        });
        referenceIds.push(uploaded.mediaId);
        textureInfo = `Utilizing the provided pattern reference.`;
      }

      const modePrefix = sketchMedia
        ? `Fashion photography, photorealistic studio render of a ${garmentType}. Strictly follow the layout of the reference sketch.`
        : `Studio fashion photography of a ${garmentType}. Professional model lighting.`;

      const finalPrompt = `${modePrefix} ${textureInfo} 8k, ultra-detailed fabric, professional studio setup. ${customPrompt}`;

      const res = await Flow.generate.image({
        prompt: finalPrompt,
        referenceImageMediaIds: referenceIds.length > 0 ? referenceIds : undefined,
        aspectRatio,
      });
      setResult(res);
      setShowControls(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan gambar.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#000] canvas-container relative">
      {/* Main Preview Area */}
      <div className="flex-1 h-full flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {result && !isGenerating ? (
            <div className="relative w-full h-full flex items-center justify-center animate-pop-in">
              <div
                className="ios-shadow-lg rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl max-w-full max-h-full flex items-center justify-center"
                style={{ aspectRatio: aspectRatio.replace(':', '/') }}
              >
                <img
                  src={`data:${result.mimeType};base64,${result.base64}`}
                  className="w-full h-full object-contain"
                  alt="Render Output"
                />
                <div className="absolute bottom-8 right-8 flex gap-3">
                  <button
                    onClick={() => setResult(null)}
                    className="w-14 h-14 rounded-full ios-glass border border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-white/10 text-white"
                  >
                    <span className="material-symbols-outlined text-[28px]">refresh</span>
                  </button>
                  <button
                    onClick={() =>
                      Flow.download({
                        base64: result.base64,
                        mimeType: result.mimeType,
                        filename: sanitizeFilename(
                          `render_${garmentType}`,
                          result.mimeType === 'image/jpeg' ? 'jpg' : 'png'
                        ),
                      })
                    }
                    className="px-8 h-14 rounded-full bg-white text-black font-bold shadow-xl active:scale-95 transition-all flex items-center gap-2 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined text-[24px]">download</span>
                    Unduh
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`relative w-full h-full flex items-center justify-center cursor-pointer group transition-all duration-300 ${
                isDraggingSketch ? 'scale-[1.01]' : ''
              }`}
              onClick={!isGenerating && !isUploading ? handleSelectSketch : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSketch(true);
              }}
              onDragLeave={() => setIsDraggingSketch(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSketch(false);
                const file = e.dataTransfer.files[0];
                if (file) processDroppedFile(file, 'sketch');
              }}
            >
              <div
                className={`ios-shadow-lg rounded-[2.5rem] overflow-hidden border border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-4 max-w-full max-h-full 
                  ${
                    sketchMedia
                      ? 'border-white/20 bg-black/20'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/10 w-full h-full lg:w-2/3 lg:h-3/4'
                  }
                  ${isDraggingSketch ? 'border-white/60 bg-white/5 ring-4 ring-white/5' : ''}
                  ${isUploading ? 'animate-pulse-soft border-white/40' : ''}
                `}
                style={sketchMedia ? { aspectRatio: aspectRatio.replace(':', '/') } : {}}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4 animate-pop-in">
                    <span className="material-symbols-outlined text-[48px] text-white animate-spin">sync</span>
                    <p className="text-[12px] font-bold text-white/40 uppercase tracking-[0.2em]">
                      Memproses sketsa...
                    </p>
                  </div>
                ) : sketchMedia ? (
                  <img
                    src={`data:${sketchMedia.mimeType};base64,${sketchMedia.base64}`}
                    className="w-full h-full object-contain"
                    alt="Design Sketch"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 animate-pop-in">
                    <div
                      className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${
                        isDraggingSketch ? 'scale-125 border-white/40' : ''
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[40px] transition-colors ${
                          isDraggingSketch ? 'text-white' : 'text-white/20'
                        }`}
                      >
                        {isDraggingSketch ? 'download' : 'add_photo_alternate'}
                      </span>
                    </div>
                    <div className="text-center px-8">
                      <p
                        className={`text-[18px] font-bold transition-colors ${
                          isDraggingSketch ? 'text-white' : 'text-white/40'
                        }`}
                      >
                        {isDraggingSketch ? 'Lepas untuk Mengunggah' : 'Unggah Sketsa Desain'}
                      </p>
                      <p className="text-[12px] text-white/20 font-medium tracking-wide mt-1">
                        Gunakan foto sketsa tangan atau render 3D
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 ios-glass z-50 flex flex-col items-center justify-center gap-8 rounded-[3rem] animate-pop-in overflow-hidden shadow-2xl">
              <SiriLoading />
              <div className="flex flex-col items-center gap-3 relative z-10 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[20px] font-bold tracking-tight text-white">Menghidupkan Konsep</span>
                  <div className="h-[2px] w-24 bg-white/10 my-3 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] max-w-[220px] leading-relaxed">
                  AI sedang memproses tekstur dan pencahayaan studio...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`fixed right-6 top-6 bottom-6 w-[360px] flex flex-col gap-4 z-40 transition-all duration-500 ease-in-out ${
          showControls
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex-1 ios-glass rounded-[2.5rem] border border-white/10 ios-shadow-lg p-7 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-[22px] font-bold tracking-tight text-white">Konfigurator</h1>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Studio Mode</span>
            </div>
            <button
              onClick={() => setShowControls(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <SectionLabel>Parameter Dasar</SectionLabel>
            <FieldDropdown
              label="Kategori Pakaian"
              value={GARMENT_LABELS[garmentType]}
              options={GARMENT_TYPES.map((t) => GARMENT_LABELS[t])}
              onChange={(v) => {
                const key = Object.keys(GARMENT_LABELS).find((k) => GARMENT_LABELS[k] === v);
                if (key) setGarmentType(key);
              }}
            />

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-white/25 tracking-[0.1em] uppercase px-1">
                {sketchMedia ? 'Rasio (Terkunci ke Sketsa)' : 'Pilih Rasio Aspek'}
              </p>
              <SegmentedToggle
                value={aspectRatio}
                onChange={(v) => !sketchMedia && setAspectRatio(v as SupportedRatio)}
                items={[
                  { value: '1:1', label: '1:1' },
                  { value: '3:4', label: '3:4' },
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-white/25 tracking-[0.1em] uppercase px-1">
                Model Gambar
              </p>
              <SegmentedToggle
                value={provider}
                onChange={(v) => setProviderState(v as ImageProvider)}
                items={[
                  { value: 'gemini', label: 'Nano Banana' },
                  { value: 'openai', label: 'GPT Image' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SectionLabel>Material & Tekstur</SectionLabel>
            <div
              onClick={!isUploading ? handleSelectTexture : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingTexture(true);
              }}
              onDragLeave={() => setIsDraggingTexture(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingTexture(false);
                const file = e.dataTransfer.files[0];
                if (file) processDroppedFile(file, 'texture');
              }}
              className={`group relative h-40 rounded-[2.2rem] border overflow-hidden transition-all
                ${textureMedia ? 'bg-black border-white/10' : 'bg-white/5 hover:bg-white/10 cursor-pointer border-white/10'}
                ${isDraggingTexture ? 'border-white/60 bg-white/10 scale-[1.02]' : ''}
                ${isUploading ? 'animate-pulse-soft' : ''}
              `}
            >
              {isUploading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-white animate-spin">sync</span>
                </div>
              ) : textureMedia ? (
                <div
                  className="w-full h-full opacity-80"
                  style={{
                    backgroundImage: `url(data:${textureMedia.mimeType};base64,${textureMedia.base64})`,
                    backgroundSize: `${100 / textureRepeat}%`,
                    backgroundRepeat: 'repeat',
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[32px] transition-colors ${
                      isDraggingTexture ? 'text-white' : 'text-white/20'
                    }`}
                  >
                    {isDraggingTexture ? 'download' : 'texture'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      isDraggingTexture ? 'text-white' : 'text-white/20'
                    }`}
                  >
                    Pilih Pola Kain
                  </span>
                </div>
              )}
              {textureMedia && !isUploading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <span className="material-symbols-outlined text-white text-[24px]">add_photo_alternate</span>
                </div>
              )}
            </div>

            {textureMedia && (
              <div className="flex flex-col gap-3 animate-pop-in">
                <RangeSlider label="Kerapatan Pola" value={textureRepeat} min={1} max={12} onChange={setTextureRepeat} />
                <button
                  onClick={() => setMirrorTiling(!mirrorTiling)}
                  className={`w-full h-[54px] rounded-[1.4rem] border transition-all flex items-center gap-3 px-5 font-bold text-[13px]
                    ${
                      mirrorTiling
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {mirrorTiling ? 'grid_view' : 'border_inner'}
                  </span>
                  Mirror Tiling
                </button>
                <button
                  onClick={() => setTextureMedia(null)}
                  className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest self-center pt-1"
                >
                  Hapus Tekstur
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pb-4">
            <div className="flex items-center justify-between px-1">
              <SectionLabel>Deskripsi Detail</SectionLabel>
              {customPrompt.length > 5 && (
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isEnhancing ? 'animate-spin' : ''}`}>
                    auto_awesome
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">AI Optimalkan</span>
                </button>
              )}
            </div>
            <TextInput
              value={customPrompt}
              onChange={setCustomPrompt}
              placeholder="Sutra halus, rincian bordir di kerah, potongan asimetris..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[12px] font-bold animate-pop-in">
              {error}
            </div>
          )}
        </div>

        <PillButton variant="solid" onClick={handleGenerate} disabled={isGenerating || isUploading}>
          {isGenerating ? 'Memproses...' : 'Render Sekarang'}
        </PillButton>
      </div>

      {!showControls && !isGenerating && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed right-6 top-6 w-14 h-14 ios-glass rounded-full border border-white/20 flex items-center justify-center shadow-xl animate-pop-in hover:bg-white/10 transition-colors text-white"
        >
          <span className="material-symbols-outlined text-[28px]">tune</span>
        </button>
      )}
    </div>
  );
}