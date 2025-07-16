import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Ha ocurrido un error", 
  onRetry = null,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6 mb-6">
        <ApperIcon 
          name="AlertCircle" 
          className="w-12 h-12 text-red-500" 
        />
      </div>
      
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
        ¡Ups! Algo salió mal
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="btn-gradient text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          <span>Intentar de nuevo</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default Error;