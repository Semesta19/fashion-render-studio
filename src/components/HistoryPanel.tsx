import React from 'react';
import type { HistoryMeta } from '../lib/history';

const PROVIDER_LABEL: Record<string, string> = { gemini: 'Nano Banana', openai: 'GPT Image' };

export const HistoryPanel: React.FC<{
  open: boolean;
  items: HistoryMeta[];
  activeId: string | null;
  garmentLabels: Record<string, string>;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}> = ({ open, items, activeId, garmentLabels, onClose, onSelect, onDelete, onClear }) => (
  <div
    className={`fixed z-50 flex flex-col gap-4 ios-glass border border-white/10 ios-shadow-lg rounded-[2rem] p-5
      transition-all duration-500 ease-in-out
      inset-x-3 bottom-3 max-h-[75dvh]
      lg:inset-x-auto lg:left-6 lg:top-6 lg:bottom-6 lg:w-[340px] lg:max-h-none
      ${
        open
          ? 'translate-y-0 lg:translate-x-0 opacity-100'
          : 'translate-y-[calc(100%+24px)] lg:translate-y-0 lg:-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
      }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-[20px] font-bold tracking-tight text-white">Riwayat</h2>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          {items.length} gambar tersimpan
        </span>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>

    {items.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="material-symbols-outlined text-[40px] text-white/20">history</span>
        <p className="text-[13px] font-bold text-white/30">Belum ada riwayat render</p>
      </div>
    ) : (
      <>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3 content-start">
          {items.map((it) => (
            <div key={it.id} className="group relative">
              <button
                onClick={() => onSelect(it.id)}
                className={`w-full rounded-[1.4rem] overflow-hidden border transition-all active:scale-[0.97] text-left bg-black/40
                  ${activeId === it.id ? 'border-white ring-2 ring-white/30' : 'border-white/10 hover:border-white/40'}`}
              >
                <div className="w-full aspect-[3/4] bg-black flex items-center justify-center">
                  <img
                    src={`data:image/jpeg;base64,${it.thumb}`}
                    className="w-full h-full object-cover"
                    alt="Riwayat render"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[12px] font-bold text-white truncate">
                    {garmentLabels[it.garmentType] || it.garmentType}
                  </p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wide truncate">
                    {PROVIDER_LABEL[it.provider]} ·{' '}
                    {new Date(it.createdAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </button>
              <button
                onClick={() => onDelete(it.id)}
                aria-label="Hapus"
                className="absolute top-2 right-2 w-8 h-8 rounded-full ios-glass border border-white/20 flex items-center justify-center text-white/70 hover:text-red-400 transition-all lg:opacity-0 lg:group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.confirm('Hapus semua riwayat?') && onClear()}
          className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest self-center"
        >
          Hapus Semua Riwayat
        </button>
      </>
    )}
  </div>
);