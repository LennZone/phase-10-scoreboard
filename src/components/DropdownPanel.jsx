/**
 * Opaque dark dropdown panel — use for any floating menu/popover.
 */
export default function DropdownPanel({ children, className = '' }) {
  return (
    <div
      className={`border border-white/[0.18] bg-[#0d0d1b]/80 shadow-2xl shadow-black/60 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
