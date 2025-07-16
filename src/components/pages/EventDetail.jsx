import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { eventService } from "@/services/api/eventService";
import SeatMap from "@/components/organisms/SeatMap";
import ShoppingCart from "@/components/organisms/ShoppingCart";
import ZoneFilter from "@/components/molecules/ZoneFilter";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { formatDate, formatTime } from "@/utils/formatters";

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const eventData = await eventService.getEventWithDetails(eventId);
      setEvent(eventData);
      setZones(eventData.zones || []);
      setSeats(eventData.seats || []);
    } catch (err) {
      setError(err.message || "Error al cargar detalles del evento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

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
        <Error message={error} onRetry={loadEventDetails} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message="Evento no encontrado" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 card-shadow mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
              {event.name}
            </h1>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <ApperIcon name="Calendar" className="w-5 h-5 mr-3" />
                <span>{formatDate(event.date)} • {formatTime(event.date)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <ApperIcon name="MapPin" className="w-5 h-5 mr-3" />
                <span>{event.venue}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <ApperIcon name="Users" className="w-5 h-5 mr-3" />
                <span>Capacidad: {event.capacity.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Zone Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 card-shadow mb-8"
      >
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Filtrar por Zona
        </h3>
        <ZoneFilter
          zones={zones}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <SeatMap
            event={event}
            zones={zones}
            seats={seats}
            selectedZone={selectedZone}
          />
        </motion.div>

        {/* Shopping Cart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <ShoppingCart className="sticky top-8" />
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;