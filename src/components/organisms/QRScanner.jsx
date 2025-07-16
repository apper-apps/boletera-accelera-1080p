import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useQRScanner } from "@/hooks/useQRScanner";
import { ticketService } from "@/services/api/ticketService";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const QRScanner = ({ onValidation }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  const handleScan = async (qrData) => {
    // Prevent rapid scanning
    const now = Date.now();
    if (now - lastScanTime < 2000) return;
    setLastScanTime(now);

    setIsValidating(true);
    
    try {
      const parsedData = JSON.parse(qrData);
      const ticket = await ticketService.validateTicket(parsedData.ticketId);
      
      if (ticket.valid) {
        await ticketService.useTicket(parsedData.ticketId, "staff-user");
        toast.success("¡Boleto válido! Acceso permitido");
        onValidation?.(ticket, true);
      } else {
        toast.error("Boleto inválido o ya utilizado");
        onValidation?.(ticket, false);
      }
    } catch (error) {
      console.error("Error validating ticket:", error);
      toast.error("Error al validar el boleto");
      onValidation?.(null, false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner error:", error);
    toast.error("Error al acceder a la cámara");
  };

  const {
    isScanning,
    hasPermission,
    videoRef,
    startScanning,
    stopScanning,
    simulateQRScan,
  } = useQRScanner(handleScan, handleError);

  // Demo function for testing
  const handleDemoScan = () => {
    const demoQRData = JSON.stringify({
      ticketId: 1,
      eventId: 1,
      seatId: 3,
      userId: "user@example.com",
      timestamp: "2024-03-01T10:00:00.000Z",
      signature: "1-1-3",
    });
    simulateQRScan(demoQRData);
  };

  return (
    <div className="bg-white rounded-xl card-shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Escáner QR
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "outline" : "primary"}
              size="sm"
            >
              <ApperIcon 
                name={isScanning ? "Square" : "Play"} 
                className="w-4 h-4 mr-2" 
              />
              {isScanning ? "Detener" : "Iniciar"}
            </Button>
            <Button
              onClick={handleDemoScan}
              variant="secondary"
              size="sm"
            >
              <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
              Demo
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        {isScanning && hasPermission ? (
          <div className="qr-scanner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <div className="qr-scanner-overlay">
              <div className="qr-scanner-frame">
                <div className="absolute inset-0 border-2 border-white rounded-lg animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
                Apunta la cámara hacia el código QR
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-gray-50 rounded-full p-8 mb-4">
              <ApperIcon name="QrCode" className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Escáner QR Listo
            </h4>
            <p className="text-gray-600 mb-4">
              {hasPermission
                ? "Haz clic en 'Iniciar' para comenzar a escanear"
                : "Se requiere permiso de cámara para escanear códigos QR"
              }
            </p>
            {!hasPermission && (
              <Button onClick={startScanning} variant="primary">
                <ApperIcon name="Camera" className="w-4 h-4 mr-2" />
                Permitir Cámara
              </Button>
            )}
          </div>
        )}

        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
              <span className="text-gray-900 font-medium">
                Validando boleto...
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;