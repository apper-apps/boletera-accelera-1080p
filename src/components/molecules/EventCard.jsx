import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { formatDate, formatTime, formatCurrency } from "@/utils/formatters";

const EventCard = ({ event, zones = [] }) => {
  const navigate = useNavigate();
  
  const minPrice = zones.length > 0 ? Math.min(...zones.map(z => z.price)) : 0;

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden card-shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Price Badge */}
        {minPrice > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-gray-900">
              Desde {formatCurrency(minPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {formatDate(event.date)} • {formatTime(event.date)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ApperIcon name="Users" className="w-4 h-4 mr-2" />
            <span className="text-sm">Capacidad: {event.capacity.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        <Button
          onClick={() => navigate(`/events/${event.Id}`)}
          className="w-full"
          variant="primary"
        >
          <ApperIcon name="Ticket" className="w-4 h-4 mr-2" />
          Comprar Boletos
        </Button>
      </div>
    </motion.div>
  );
};

export default EventCard;