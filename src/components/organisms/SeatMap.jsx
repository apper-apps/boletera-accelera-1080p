import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addSeat } from "@/store/slices/cartSlice";
import SeatTooltip from "@/components/molecules/SeatTooltip";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SeatMap = ({ event, zones, seats, selectedZone }) => {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  const filteredSeats = selectedZone 
    ? seats.filter(seat => {
        const zone = zones.find(z => z.Id === seat.zoneId);
        return zone && zone.Id === selectedZone;
      })
    : seats;

  const handleSeatClick = (seat) => {
    if (seat.status !== "available") {
      toast.error("Este asiento no está disponible");
      return;
    }

    const zone = zones.find(z => z.Id === seat.zoneId);
    if (!zone) return;

    const isInCart = items.some(item => item.seat.Id === seat.Id);
    if (isInCart) {
      toast.info("Este asiento ya está en tu carrito");
      return;
    }

    dispatch(addSeat({
      seat,
      zone,
      eventId: event.Id,
    }));

    toast.success(`Asiento ${seat.identifier} agregado al carrito`);
  };

  const handleSeatHover = (seat, event) => {
    setHoveredSeat(seat);
    const rect = mapRef.current.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const getSeatColor = (seat) => {
    const zone = zones.find(z => z.Id === seat.zoneId);
    if (!zone) return "#gray-400";

    const isInCart = items.some(item => item.seat.Id === seat.Id);
    if (isInCart) return "#EC4899";

    switch (seat.status) {
      case "available":
        return zone.color;
      case "reserved":
        return "#FCD34D";
      case "sold":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getSeatClassName = (seat) => {
    const baseClass = "transition-all duration-200";
    
    switch (seat.status) {
      case "available":
        return `${baseClass} seat-available`;
      case "reserved":
        return `${baseClass} seat-reserved`;
      case "sold":
        return `${baseClass} seat-sold`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Mapa de Asientos
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Reservado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span>Vendido</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-accent-500 rounded-full"></div>
            <span>En carrito</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4 min-h-[400px]">
        <div
          ref={mapRef}
          className="relative w-full h-full seat-map"
          style={{ minHeight: "400px" }}
        >
          {/* Stage */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Music" className="w-5 h-5" />
              <span className="font-medium">ESCENARIO</span>
            </div>
          </div>

          {/* Seats */}
          {filteredSeats.map((seat) => (
            <motion.circle
              key={seat.Id}
              cx={seat.coordinates.x}
              cy={seat.coordinates.y}
              r="8"
              fill={getSeatColor(seat)}
              className={getSeatClassName(seat)}
              onClick={() => handleSeatClick(seat)}
              onMouseEnter={(e) => handleSeatHover(seat, e)}
              onMouseLeave={() => setHoveredSeat(null)}
              whileHover={seat.status === "available" ? { scale: 1.2 } : {}}
              whileTap={seat.status === "available" ? { scale: 0.95 } : {}}
            />
          ))}

          {/* Tooltip */}
          {hoveredSeat && (
            <SeatTooltip
              seat={hoveredSeat}
              zone={zones.find(z => z.Id === hoveredSeat.zoneId)}
              position={tooltipPosition}
              isVisible={true}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Instrucciones:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Haz clic en un asiento disponible para agregarlo al carrito</li>
              <li>• Pasa el cursor sobre los asientos para ver detalles</li>
              <li>• Usa los filtros de zona para encontrar asientos específicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;