import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/formatters";

const SeatTooltip = ({ seat, zone, position, isVisible }) => {
  if (!isVisible || !seat || !zone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute z-50 bg-white rounded-lg shadow-xl p-3 pointer-events-none"
        style={{
          left: position.x + 10,
          top: position.y - 60,
          transform: "translateX(-50%)",
        }}
      >
        <div className="text-sm font-medium text-gray-900 mb-1">
          {seat.identifier}
        </div>
        <div className="text-xs text-gray-600 mb-1">
          {zone.name}
        </div>
        <div className="text-sm font-semibold text-primary-600">
          {formatCurrency(zone.price)}
        </div>
        <div className="text-xs text-gray-500 mt-1 capitalize">
          {seat.status === "available" ? "Disponible" : seat.status}
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
      </motion.div>
    </AnimatePresence>
  );
};

export default SeatTooltip;