import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const QRDisplay = ({ qrData, ticketInfo, onDownload }) => {
  return (
    <motion.div
      className="bg-white rounded-lg p-6 card-shadow text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="mb-4">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-3 inline-block mb-3">
          <ApperIcon name="QrCode" className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Tu Boleto Digital
        </h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <QRCode
          value={qrData}
          size={200}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>

      {ticketInfo && (
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Asiento:</span>
            <span className="font-medium">{ticketInfo.seatIdentifier}</span>
          </div>
          <div className="flex justify-between">
            <span>Zona:</span>
            <span className="font-medium">{ticketInfo.zoneName}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio:</span>
            <span className="font-medium">{ticketInfo.price}</span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mb-4">
        Presenta este código QR en la entrada del evento
      </div>

      {onDownload && (
        <Button
          onClick={onDownload}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ApperIcon name="Download" className="w-4 h-4 mr-2" />
          Descargar Boleto
        </Button>
      )}
    </motion.div>
  );
};

export default QRDisplay;