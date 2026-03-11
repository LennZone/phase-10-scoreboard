const variants = {
  primary:
    'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold shadow-sm shadow-violet-900/20',
  secondary: 'bg-white/5 hover:bg-white/10 active:bg-white/15 text-white border border-white/10',
  success:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-sm shadow-emerald-900/20',
  ghost: 'bg-transparent hover:bg-white/5 active:bg-white/10 text-slate-400 border border-white/10',
  danger:
    'bg-red-900/20 hover:bg-red-900/40 active:bg-red-900/60 text-red-400 border border-red-700/40',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-5 text-sm font-medium',
  lg: 'h-12 px-6 text-sm font-medium',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
