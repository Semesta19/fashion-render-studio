import React, { useRef, useState } from 'react';
import type { Img } from '../lib/image';

export const IMG_SIZE_CLASS =
  'block w-auto h-auto max-w-full max-h-[calc(100dvh-6.5rem)] lg:max-h-[calc(100dvh-8.5rem)]';

export const CompareSlider: React.FC<{
  before: Img;
  after: Img;
  beforeLabel?: string;
  afterLabel?: string;
}> = ({ before, after, beforeLabel = 'Sketsa', afterLabel = 'Hasil' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);

  const update = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Bandingkan sketsa dan hasil"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      className="relative block w-fit max-w-full overflow-hidden select-none touch-none cursor-ew-resize outline-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
      }}
    >
      {/* Hasil (dasar, menentukan ukuran) */}
      <img
        src={`data:${after.mimeType};base64,${after.base64}`}
        className={`${IMG_SIZE_CLASS} pointer-events-none`}
        draggable={false}
        alt="Hasil render"
      />

      {/* Sketsa (di atas, dipotong sampai garis pemisah) */}
      <img
        src={`data:${before.mimeType};base64,${before.base64}`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none bg-black"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        alt="Sketsa desain"
      />

      {/* Label */}
      <span className="absolute top-3 left-3 px-3 py-1 rounded-full ios-glass border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-widest pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 px-3 py-1 rounded-full ios-glass border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-widest pointer-events-none">
        {afterLabel}
      </span>

      {/* Garis pemisah + pegangan */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-1px)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
          <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
        </div>
      </div>
    </div>
  );
};