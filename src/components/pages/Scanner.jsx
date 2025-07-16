import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import QRScanner from "@/components/organisms/QRScanner";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { formatDateTime } from "@/utils/formatters";

const Scanner = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    validScans: 0,
    invalidScans: 0,
  });

  const handleValidation = (ticket, isValid) => {
    const scanRecord = {
      id: Date.now(),
      ticket,
      isValid,
      timestamp: new Date().toISOString(),
    };

    setScanHistory(prev => [scanRecord, ...prev.slice(0, 9)]);
    
    setStats(prev => ({
      totalScans: prev.totalScans + 1,
      validScans: prev.validScans + (isValid ? 1 : 0),
      invalidScans: prev.invalidScans + (isValid ? 0 : 1),
    }));
  };

  const clearHistory = () => {
    setScanHistory([]);
    setStats({
      totalScans: 0,
      validScans: 0,
      invalidScans: 0,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Escáner de <span className="gradient-text">Boletos</span>
        </h1>
        <p className="text-lg text-gray-600">
          Valida boletos digitales en tiempo real
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Scan" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.totalScans}
          </div>
          <div className="text-sm text-gray-600">
            Total Escaneados
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.validScans}
          </div>
          <div className="text-sm text-gray-600">
            Válidos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="XCircle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.invalidScans}
          </div>
          <div className="text-sm text-gray-600">
            Inválidos
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QRScanner onValidation={handleValidation} />
        </motion.div>

        {/* Scan History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl card-shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-gray-900">
                Historial de Escaneos
              </h3>
              {scanHistory.length > 0 && (
                <Button
                  onClick={clearHistory}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full p-6 inline-block mb-4">
                  <ApperIcon name="History" className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  No hay escaneos recientes
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Los escaneos aparecerán aquí en tiempo real
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {scanHistory.map((scan) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      scan.isValid
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ApperIcon
                          name={scan.isValid ? "CheckCircle" : "XCircle"}
                          className={`w-5 h-5 ${
                            scan.isValid ? "text-green-600" : "text-red-600"
                          }`}
                        />
                        <Badge
                          variant={scan.isValid ? "success" : "error"}
                        >
                          {scan.isValid ? "Válido" : "Inválido"}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(scan.timestamp)}
                      </span>
                    </div>
                    
                    {scan.ticket && (
                      <div className="text-sm">
                        <p className="text-gray-700">
                          Boleto ID: {scan.ticket.Id || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Evento: {scan.ticket.eventId || "N/A"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-blue-50 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              Instrucciones de Uso
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Haz clic en "Iniciar" para activar la cámara</li>
              <li>• Apunta la cámara hacia el código QR del boleto</li>
              <li>• El sistema validará automáticamente el boleto</li>
              <li>• Verde = boleto válido, Rojo = boleto inválido</li>
              <li>• Usa el botón "Demo" para probar la funcionalidad</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Scanner;