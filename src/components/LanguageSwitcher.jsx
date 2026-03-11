import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from './Icons';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'bg', flag: '🇧🇬', label: 'Български' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm transition-colors hover:bg-white/10"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="text-xs font-medium text-slate-300">{currentLang.code.toUpperCase()}</span>
        <ChevronDownIcon className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <div className="glass-card absolute right-0 z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                lang.code === i18n.resolvedLanguage ? 'font-semibold text-white' : 'text-slate-300'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
