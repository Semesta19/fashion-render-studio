import React, { useState, useRef, useEffect } from 'react';

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center px-1">
    <span className="text-[11px] font-extrabold text-white/25 tracking-[0.15em] uppercase">
      {children}
    </span>
  </div>
);

export const PillButton: React.FC<{
  children: React.ReactNode;
  variant?: 'filled' | 'outline' | 'solid';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, variant = 'filled', onClick, disabled }) => {
  const base =
    'flex items-center gap-2 justify-center w-full h-[62px] rounded-[1.95rem] font-bold tracking-tight transition-all active:scale-[0.97] disabled:opacity-30 cursor-pointer select-none';
  const variants: Record<string, string> = {
    filled: 'bg-white/10 text-white backdrop-blur-md',
    outline: 'border border-white/20 text-white',
    solid: 'bg-white text-black shadow-2xl',
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
      <span className="text-[17px]">{children}</span>
    </button>
  );
};

export const FieldDropdown: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all rounded-[1.6rem] flex flex-col justify-center h-[68px] px-6 focus:outline-none"
      >
        <p className="text-[10px] font-bold text-white/25 tracking-[0.1em] uppercase mb-0.5">{label}</p>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-white">{value}</span>
          <span
            className={`material-symbols-outlined text-[22px] text-white/30 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            keyboard_arrow_down
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full ios-glass border border-white/10 rounded-[1.6rem] overflow-hidden shadow-2xl animate-pop-in origin-top">
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-4 text-[15px] font-bold transition-colors ${
                  value === opt ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SegmentedToggle: React.FC<{
  value: string;
  items: { value: string; label: string }[];
  onChange: (val: string) => void;
}> = ({ value, items, onChange }) => (
  <div className="flex w-full items-center bg-white/5 border border-white/10 rounded-[1.4rem] overflow-hidden p-1">
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onChange(item.value)}
        className={`flex-1 h-[42px] rounded-[1rem] text-[13px] font-bold tracking-tight transition-all
          ${value === item.value ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white/60'}
        `}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export const RangeSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-[1.8rem] border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-white/25 tracking-[0.1em] uppercase">{label}</span>
      <span className="text-[14px] font-extrabold text-white/80">{value}x</span>
    </div>
    <div className="px-1 flex items-center h-4">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
      />
    </div>
  </div>
);

export const TextInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="bg-white/5 border border-white/5 hover:border-white/10 focus:border-white/30 focus:bg-white/10 rounded-[1.8rem] w-full h-[120px] px-6 py-5 resize-none text-[15px] font-medium text-white placeholder-white/20 focus:outline-none transition-all duration-300 shadow-inner"
  />
);