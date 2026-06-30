import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-trade-card w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-5 border-b border-trade-border">
            <h2 className="text-xl font-bold text-trade-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-trade-muted hover:text-trade-text hover:bg-trade-primary/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
