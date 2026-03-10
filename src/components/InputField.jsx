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
      {label && (
        <label className="block text-sm font-semibold text-gray-400 mb-1.5">{label}</label>
      )}
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'
          } text-white rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-600 ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
