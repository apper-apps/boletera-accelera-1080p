import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ticketService } from "@/services/api/ticketService";
import { eventService } from "@/services/api/eventService";
import { zoneService } from "@/services/api/zoneService";
import { seatService } from "@/services/api/seatService";
import QRDisplay from "@/components/molecules/QRDisplay";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock user email for demo
  const userEmail = "user@example.com";

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [ticketsData, eventsData, zonesData, seatsData] = await Promise.all([
        ticketService.getByUser(userEmail),
        eventService.getAll(),
        zoneService.getAll(),
        seatService.getAll(),
      ]);
      
      setTickets(ticketsData);
      setEvents(eventsData);
      setZones(zonesData);
      setSeats(seatsData);
    } catch (err) {
      setError(err.message || "Error al cargar boletos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const getTicketDetails = (ticket) => {
    const event = events.find(e => e.Id === ticket.eventId);
    const seat = seats.find(s => s.Id === ticket.seatId);
    const zone = zones.find(z => z.Id === ticket.zoneId);
    
    return {
      event,
      seat,
      zone,
      ticketInfo: {
        seatIdentifier: seat?.identifier || "N/A",
        zoneName: zone?.name || "N/A",
        price: formatCurrency(ticket.price),
      },
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "valid":
        return <Badge variant="success">Válido</Badge>;
      case "used":
        return <Badge variant="default">Usado</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadTickets} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Mis <span className="gradient-text">Boletos</span>
        </h1>
        <p className="text-lg text-gray-600">
          Gestiona y accede a todos tus boletos digitales
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
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Ticket" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {tickets.length}
          </div>
          <div className="text-sm text-gray-600">
            Total Boletos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {tickets.filter(t => t.status === "valid").length}
          </div>
          <div className="text-sm text-gray-600">
            Válidos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {new Set(tickets.map(t => t.eventId)).size}
          </div>
          <div className="text-sm text-gray-600">
            Eventos
          </div>
        </div>
      </motion.div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Empty
          icon="Ticket"
          title="No tienes boletos"
          message="Aún no has comprado ningún boleto. ¡Explora nuestros eventos disponibles!"
          actionText="Ver Eventos"
          onAction={() => window.location.href = "/"}
        />
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket, index) => {
            const { event, seat, zone, ticketInfo } = getTicketDetails(ticket);
            
            return (
              <motion.div
                key={ticket.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Event Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                          {event?.name || "Evento no encontrado"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {event ? formatDateTime(event.date) : "Fecha no disponible"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {event?.venue || "Venue no disponible"}
                        </p>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Asiento:</span>
                        <div className="font-medium">{ticketInfo.seatIdentifier}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Zona:</span>
                        <div className="font-medium">{ticketInfo.zoneName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Precio:</span>
                        <div className="font-medium">{ticketInfo.price}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Comprado:</span>
                        <div className="font-medium">
                          {new Date(ticket.purchasedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="lg:col-span-2">
                    <QRDisplay
                      qrData={ticket.qrCode}
                      ticketInfo={ticketInfo}
                      onDownload={() => {
                        const ticketData = {
                          id: ticket.Id,
                          event: event?.name,
                          seat: ticketInfo.seatIdentifier,
                          zone: ticketInfo.zoneName,
                          qr: ticket.qrCode,
                        };

                        const blob = new Blob([JSON.stringify(ticketData, null, 2)], {
                          type: "application/json",
                        });

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `ticket-${ticket.Id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;