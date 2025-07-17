import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { eventService } from "@/services/api/eventService";
import { zoneService } from "@/services/api/zoneService";
import { seatService } from "@/services/api/seatService";
import QRDisplay from "@/components/molecules/QRDisplay";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const TicketConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const { tickets, customerInfo, payment, eventId } = location.state || {};

  useEffect(() => {
    if (!tickets || !eventId) {
      navigate("/");
      return;
    }

    const loadEventData = async () => {
      try {
        const [eventData, zonesData, seatsData] = await Promise.all([
          eventService.getById(eventId),
          zoneService.getByEvent(eventId),
          seatService.getAll(),
        ]);

        setEvent(eventData);
        setZones(zonesData);
        setSeats(seatsData);
      } catch (error) {
        console.error("Error loading event data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [tickets, eventId, navigate]);

  const getTicketInfo = (ticket) => {
    const seat = seats.find(s => s.Id === ticket.seatId);
    const zone = zones.find(z => z.Id === ticket.zoneId);
    
    return {
      seatIdentifier: seat?.identifier || "N/A",
      zoneName: zone?.name || "N/A",
      price: formatCurrency(ticket.price),
    };
  };

const handleDownloadTicket = async (ticket, format = 'pdf') => {
    try {
      const ticketInfo = getTicketInfo(ticket);
      const ticketData = {
        event: event.name,
        seat: ticketInfo.seatIdentifier,
        zone: ticketInfo.zoneName,
        qrCode: ticket.qrCode || ticket.qr_code,
        ticketId: ticket.Id
      };

      let blob;
      let fileName;
      let mimeType;

      if (format === 'pdf') {
        // Generate optimized PDF
        const { generateTicketPDF } = await import('@/utils/qrGenerator');
        blob = await generateTicketPDF(ticketData);
        fileName = `boleto-${ticket.Id}.pdf`;
        mimeType = 'application/pdf';
      } else if (format === 'jpg') {
        // Generate optimized JPG image
        const { generateTicketImage } = await import('@/utils/qrGenerator');
        blob = await generateTicketImage(ticketData);
        fileName = `boleto-${ticket.Id}.jpg`;
        mimeType = 'image/jpeg';
      } else {
        // Fallback to optimized JSON (much smaller than before)
        const optimizedData = {
          evento: ticketData.event,
          asiento: ticketData.seat,
          zona: ticketData.zone,
          qr: ticketData.qrCode
        };
        blob = new Blob([JSON.stringify(optimizedData)], { type: 'application/json' });
        fileName = `boleto-${ticket.Id}.json`;
        mimeType = 'application/json';
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading ticket:", error);
      // Fallback to basic download
      handleDownloadTicket(ticket, 'json');
    }
  };
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading />
      </div>
    );
  }

  if (!tickets || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Confirmación no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo encontrar la información de tu compra.
          </p>
          <Button onClick={() => navigate("/")} variant="primary">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-6 inline-block mb-4">
          <ApperIcon name="CheckCircle" className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          ¡Compra Exitosa!
        </h1>
        <p className="text-lg text-gray-600">
          Tu compra ha sido procesada correctamente. Revisa tu email para más detalles.
        </p>
      </motion.div>

      {/* Purchase Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 card-shadow mb-8"
      >
        <h2 className="text-xl font-display font-semibold text-gray-900 mb-4">
          Resumen de la Compra
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Evento</h3>
            <p className="text-gray-600">{event.name}</p>
            <p className="text-sm text-gray-500">
              {formatDateTime(event.date)} • {event.venue}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Cliente</h3>
            <p className="text-gray-600">{customerInfo.name}</p>
            <p className="text-sm text-gray-500">{customerInfo.email}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              Total Pagado:
            </span>
            <span className="text-2xl font-display font-bold gradient-text">
              {formatCurrency(payment.amount / 100)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ID de Pago: {payment.id}
          </p>
        </div>
      </motion.div>

      {/* QR Codes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
          Tus Boletos Digitales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <QRDisplay
                qrData={ticket.qrCode}
                ticketInfo={getTicketInfo(ticket)}
                onDownload={() => handleDownloadTicket(ticket)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 rounded-xl p-6 mb-8"
      >
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              Instrucciones Importantes
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Presenta tu código QR en la entrada del evento</li>
              <li>• Cada boleto tiene un código único e intransferible</li>
              <li>• Llega al evento con suficiente tiempo de antelación</li>
              <li>• Guarda una copia de respaldo en tu teléfono</li>
              <li>• Revisa tu email para recibir los boletos</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={() => navigate("/my-tickets")}
          variant="primary"
          size="lg"
        >
          <ApperIcon name="Ticket" className="w-5 h-5 mr-2" />
          Ver Mis Boletos
        </Button>
        
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          size="lg"
        >
          <ApperIcon name="Home" className="w-5 h-5 mr-2" />
          Volver al Inicio
        </Button>
      </motion.div>
    </div>
  );
};

export default TicketConfirmation;