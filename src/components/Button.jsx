const variants = {
  primary: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold',
  secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white',
  success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold',
  ghost: 'bg-transparent hover:bg-gray-800 active:bg-gray-700 text-gray-300 border border-gray-600',
  danger: 'bg-red-900 hover:bg-red-800 active:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-4 text-lg',
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
      className={`rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
