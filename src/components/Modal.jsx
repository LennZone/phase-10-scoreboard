import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 z-50 mx-auto max-w-md rounded-2xl"
            style={{ top: '50%' }}
            initial={{ opacity: 0, scale: 0.92, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, y: '-40%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Card background */}
            <div className="absolute inset-0 rounded-2xl bg-[#0d0d1b]/95 backdrop-blur-xl" />

            {/*
              mix-blend-plus-lighter border — the Laravel Cloud effect.
              The div extends 1px beyond the card (-inset-px). Its white border
              adds brightness to whatever is painted below it within the stacking
              context, creating a glowing ring on the dark card background.
            */}
            <div
              className="pointer-events-none absolute -inset-px isolate rounded-[17px] border border-white/[0.18] mix-blend-plus-lighter"
              aria-hidden="true"
            />

            {/* Content sits above all absolute layers */}
            <div className="relative p-6">
              {title && <h2 className="mb-5 text-lg font-semibold text-white">{title}</h2>}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
