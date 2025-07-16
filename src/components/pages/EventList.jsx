import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { eventService } from "@/services/api/eventService";
import { zoneService } from "@/services/api/zoneService";
import EventCard from "@/components/molecules/EventCard";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [eventsData, zonesData] = await Promise.all([
        eventService.getPublicEvents(),
        zoneService.getAll()
      ]);
      
      setEvents(eventsData);
      setZones(zonesData);
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadEvents();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const results = await eventService.searchEvents(query);
      setEvents(results);
    } catch (err) {
      setError(err.message || "Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const getEventZones = (eventId) => {
    return zones.filter(zone => zone.eventId === eventId);
  };

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
        <Error message={error} onRetry={loadEvents} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-gray-900 mb-4"
        >
          Eventos <span className="gradient-text">Disponibles</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Descubre los mejores eventos y compra tus boletos con nuestro sistema 
          de selección de asientos interactivo
        </motion.p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto mb-8"
      >
        <SearchBar
          onSearch={handleSearch}
          placeholder="Buscar eventos por nombre, lugar o descripción..."
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {events.length}
          </div>
          <div className="text-sm text-gray-600">
            Eventos Disponibles
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="MapPin" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {new Set(events.map(e => e.venue)).size}
          </div>
          <div className="text-sm text-gray-600">
            Venues Únicos
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow text-center">
          <div className="bg-gradient-to-r from-accent-500 to-secondary-500 rounded-full p-3 inline-block mb-3">
            <ApperIcon name="Users" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-display font-bold text-gray-900">
            {events.reduce((sum, e) => sum + e.capacity, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Capacidad Total
          </div>
        </div>
      </motion.div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Empty
          icon="Calendar"
          title="No hay eventos disponibles"
          message={searchQuery 
            ? `No se encontraron eventos que coincidan con "${searchQuery}"`
            : "No hay eventos publicados en este momento"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EventCard
                event={event}
                zones={getEventZones(event.Id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;