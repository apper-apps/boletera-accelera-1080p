import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { eventService } from "@/services/api/eventService";
import { zoneService } from "@/services/api/zoneService";
import { ticketService } from "@/services/api/ticketService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency } from "@/utils/formatters";

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [zones, setZones] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    validTickets: 0,
    usedTickets: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [eventsData, zonesData, ticketsData] = await Promise.all([
        eventService.getAll(),
        zoneService.getAll(),
        ticketService.getAll(),
      ]);
      
      setEvents(eventsData);
      setZones(zonesData);
      setTickets(ticketsData);
      
      // Calculate stats
      const totalRevenue = ticketsData.reduce((sum, ticket) => sum + ticket.price, 0);
      const validTickets = ticketsData.filter(t => t.status === "valid").length;
      const usedTickets = ticketsData.filter(t => t.status === "used").length;
      
      setStats({
        totalEvents: eventsData.length,
        totalTickets: ticketsData.length,
        totalRevenue,
        validTickets,
        usedTickets,
      });
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Panel de <span className="gradient-text">Administración</span>
        </h1>
        <p className="text-lg text-gray-600">
          Gestiona eventos, zonas y visualiza estadísticas de ventas
        </p>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.totalEvents}
          </div>
          <div className="text-sm text-gray-600">
            Eventos Totales
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Ticket" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.totalTickets}
          </div>
          <div className="text-sm text-gray-600">
            Boletos Vendidos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            Ingresos Totales
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.validTickets}
          </div>
          <div className="text-sm text-gray-600">
            Boletos Válidos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="UserCheck" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {stats.usedTickets}
          </div>
          <div className="text-sm text-gray-600">
            Boletos Usados
          </div>
        </div>
      </motion.div>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl card-shadow mb-8"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-display font-semibold text-gray-900">
            Eventos
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boletos Vendidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => {
                const eventTickets = tickets.filter(t => t.eventId === event.Id);
                const soldTickets = eventTickets.length;
                const percentage = (soldTickets / event.capacity) * 100;
                
                return (
                  <tr key={event.Id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.venue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.capacity.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {soldTickets} ({percentage.toFixed(1)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.isPublic
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {event.isPublic ? "Público" : "Privado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl card-shadow"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-display font-semibold text-gray-900">
            Boletos Recientes
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.slice(0, 10).map((ticket) => {
                const event = events.find(e => e.Id === ticket.eventId);
                
                return (
                  <tr key={ticket.Id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{ticket.Id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(ticket.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === "valid"
                          ? "bg-green-100 text-green-800"
                          : ticket.status === "used"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(ticket.purchasedAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;