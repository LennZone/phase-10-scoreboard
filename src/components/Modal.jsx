import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 max-w-md mx-auto"
            style={{ top: '50%' }}
            initial={{ opacity: 0, scale: 0.92, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, y: '-40%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {title && (
              <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
