import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/formatters";

const ZoneFilter = ({ zones, selectedZone, onZoneChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        onClick={() => onZoneChange(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          selectedZone === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Todas las zonas
      </motion.button>
      
      {zones.map((zone) => (
        <motion.button
          key={zone.Id}
          onClick={() => onZoneChange(zone.Id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedZone === zone.Id
              ? "text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={{
            backgroundColor: selectedZone === zone.Id ? zone.color : undefined,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {zone.name} • {formatCurrency(zone.price)}
        </motion.button>
      ))}
    </div>
  );
};

export default ZoneFilter;