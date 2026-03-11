export default function InputField({
  label,
  type = 'text',
  inputMode,
  value,
  onChange,
  placeholder,
  className = '',
  error,
  ...props
}) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-400">{label}</label>}
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-12 w-full rounded-lg border px-4 text-base transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${error ? 'border-red-500' : 'border-white/10'} bg-white/[0.04] text-white placeholder-slate-600 ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}
