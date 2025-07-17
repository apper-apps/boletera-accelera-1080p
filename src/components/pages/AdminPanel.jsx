import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { eventService } from "@/services/api/eventService";
import { zoneService } from "@/services/api/zoneService";
import { ticketService } from "@/services/api/ticketService";
import { login, logout } from "@/store/slices/userSlice";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import { formatCurrency } from "@/utils/formatters";

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector(state => state.user);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [zones, setZones] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    venue: "",
    description: "",
    capacity: "",
    imageUrl: "",
    isPublic: true
  });
  const [mapZones, setMapZones] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: "",
    color: "#3B82F6",
    price: "",
    type: "rectangular" // rectangular or circular
  });
  const [rectangularConfig, setRectangularConfig] = useState({
    rows: 5,
    seatsPerRow: 10,
    x: 100,
    y: 100,
    width: 200,
    height: 100
  });
  const [circularConfig, setCircularConfig] = useState({
    centerX: 400,
    centerY: 300,
    innerRadius: 100,
    outerRadius: 200,
    startAngle: 0,
    endAngle: 180,
    rings: 3,
    seatsPerRing: 20
  });
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      dispatch(login(loginForm));
      toast.success("Acceso autorizado");
      loadData(); // Load data after successful login
    } catch (error) {
      toast.error("Credenciales inválidas");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Sesión cerrada");
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      loadData();
    }
  }, [isAuthenticated, role]);

  // Show login form if not authenticated as admin
  if (!isAuthenticated || role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 card-shadow"
        >
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-full p-3 inline-block mb-4">
              <ApperIcon name="Shield" className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
              Acceso <span className="gradient-text">Administrativo</span>
            </h1>
            <p className="text-gray-600">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ingresa tu email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ApperIcon name="LogIn" className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </div>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }
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

const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const newEvent = await eventService.create({
        ...eventForm,
        capacity: parseInt(eventForm.capacity),
        mapSvg: generateMapSvg()
      });
      setEvents(prev => [...prev, newEvent]);
      setEventForm({
        name: "",
        date: "",
        venue: "",
        description: "",
        capacity: "",
        imageUrl: "",
        isPublic: true
      });
      setMapZones([]);
      toast.success("Evento creado exitosamente");
      setActiveTab("dashboard");
    } catch (error) {
      toast.error("Error al crear evento");
    }
  };

  const generateMapSvg = () => {
    const svgElements = mapZones.map(zone => {
      if (zone.type === "rectangular") {
        return `<rect x="${zone.x}" y="${zone.y}" width="${zone.width}" height="${zone.height}" fill="${zone.color}" opacity="0.7" stroke="#000" stroke-width="1"/>`;
      } else {
        const path = generateCircularPath(zone);
        return `<path d="${path}" fill="${zone.color}" opacity="0.7" stroke="#000" stroke-width="1"/>`;
      }
    }).join("");
    
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#f3f4f6"/>
      ${svgElements}
      <rect x="300" y="50" width="200" height="100" fill="#1f2937" rx="10"/>
      <text x="400" y="105" text-anchor="middle" fill="white" font-size="16">ESCENARIO</text>
    </svg>`;
  };

  const generateCircularPath = (zone) => {
    const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = zone;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + innerRadius * Math.cos(startRad);
    const y1 = centerY + innerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(startRad);
    const y2 = centerY + outerRadius * Math.sin(startRad);
    const x3 = centerX + outerRadius * Math.cos(endRad);
    const y3 = centerY + outerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(endRad);
    const y4 = centerY + innerRadius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`;
  };

  const generateRectangularSeats = (zone, config) => {
    const seats = [];
    const { rows, seatsPerRow, x, y, width, height } = config;
    const seatSpacingX = width / (seatsPerRow + 1);
    const seatSpacingY = height / (rows + 1);
    
    for (let row = 0; row < rows; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        seats.push({
          identifier: `${zone.name}-${String.fromCharCode(65 + row)}${seat + 1}`,
          coordinates: {
            x: x + (seat + 1) * seatSpacingX,
            y: y + (row + 1) * seatSpacingY
          },
          status: "available"
        });
      }
    }
    return seats;
  };

  const generateCircularSeats = (zone, config) => {
    const seats = [];
    const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, rings, seatsPerRing } = config;
    const radiusStep = (outerRadius - innerRadius) / rings;
    const angleRange = endAngle - startAngle;
    const angleStep = angleRange / seatsPerRing;
    
    for (let ring = 0; ring < rings; ring++) {
      const radius = innerRadius + (ring + 0.5) * radiusStep;
      for (let seat = 0; seat < seatsPerRing; seat++) {
        const angle = startAngle + seat * angleStep;
        const radian = (angle * Math.PI) / 180;
        seats.push({
          identifier: `${zone.name}-R${ring + 1}S${seat + 1}`,
          coordinates: {
            x: centerX + radius * Math.cos(radian),
            y: centerY + radius * Math.sin(radian)
          },
          status: "available"
        });
      }
    }
    return seats;
  };

  const handleAddZone = () => {
    if (!zoneForm.name || !zoneForm.price) {
      toast.error("Complete todos los campos de la zona");
      return;
    }

    const newZone = {
      Id: Date.now(),
      ...zoneForm,
      price: parseFloat(zoneForm.price),
      type: zoneForm.type,
      ...(zoneForm.type === "rectangular" ? rectangularConfig : circularConfig)
    };

    setMapZones(prev => [...prev, newZone]);
    setZoneForm({
      name: "",
      color: "#3B82F6",
      price: "",
      type: "rectangular"
    });
    toast.success("Zona agregada al mapa");
  };

  const renderTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
      {[
        { id: "dashboard", label: "Dashboard", icon: "BarChart3" },
        { id: "events", label: "Gestión de Eventos", icon: "Calendar" },
        { id: "mapBuilder", label: "Constructor de Mapas", icon: "Map" }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            activeTab === tab.id
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
          {tab.label}
        </button>
      ))}
    </div>
  );

return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Panel de <span className="gradient-text">Administración</span>
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona eventos, zonas y visualiza estadísticas de ventas
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="secondary"
          className="flex items-center"
        >
          <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </motion.div>

      {/* Tabs */}
      {renderTabs()}
{/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
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
        </>
      )}

      {/* Events Management Tab */}
      {activeTab === "events" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 card-shadow"
        >
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
            Crear Nuevo Evento
          </h2>
          
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="eventName">Nombre del Evento</Label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Concierto de Rock 2024"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventDate">Fecha y Hora</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventVenue">Venue</Label>
                <Input
                  id="eventVenue"
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Ej: Estadio Nacional"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventCapacity">Capacidad Total</Label>
                <Input
                  id="eventCapacity"
                  type="number"
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Ej: 5000"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="eventDescription">Descripción</Label>
                <textarea
                  id="eventDescription"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el evento..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventImage">URL de Imagen</Label>
                <Input
                  id="eventImage"
                  type="url"
                  value={eventForm.imageUrl}
                  onChange={(e) => setEventForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  id="eventPublic"
                  type="checkbox"
                  checked={eventForm.isPublic}
                  onChange={(e) => setEventForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <Label htmlFor="eventPublic">Evento Público</Label>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Zonas configuradas: {mapZones.length}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEventForm({
                        name: "",
                        date: "",
                        venue: "",
                        description: "",
                        capacity: "",
                        imageUrl: "",
                        isPublic: true
                      });
                      setMapZones([]);
                    }}
                  >
                    <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                  <Button type="submit" className="btn-gradient">
                    <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Map Builder Tab */}
      {activeTab === "mapBuilder" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 card-shadow"
          >
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Configuración de Zonas
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="zoneName">Nombre de la Zona</Label>
                <Input
                  id="zoneName"
                  type="text"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: VIP, Platea, General"
                />
              </div>
              
              <div>
                <Label htmlFor="zoneColor">Color</Label>
                <Input
                  id="zoneColor"
                  type="color"
                  value={zoneForm.color}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="zonePrice">Precio</Label>
                <Input
                  id="zonePrice"
                  type="number"
                  step="0.01"
                  value={zoneForm.price}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label>Tipo de Zona</Label>
                <div className="flex space-x-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setZoneForm(prev => ({ ...prev, type: "rectangular" }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      zoneForm.type === "rectangular"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ApperIcon name="Square" className="w-4 h-4 mr-2 inline" />
                    Rectangular
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoneForm(prev => ({ ...prev, type: "circular" }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      zoneForm.type === "circular"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ApperIcon name="Circle" className="w-4 h-4 mr-2 inline" />
                    Circular
                  </button>
                </div>
              </div>
              
              {/* Rectangular Configuration */}
              {zoneForm.type === "rectangular" && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Configuración Rectangular</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rectRows">Filas</Label>
                      <Input
                        id="rectRows"
                        type="number"
                        value={rectangularConfig.rows}
                        onChange={(e) => setRectangularConfig(prev => ({ 
                          ...prev, 
                          rows: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rectSeats">Asientos/Fila</Label>
                      <Input
                        id="rectSeats"
                        type="number"
                        value={rectangularConfig.seatsPerRow}
                        onChange={(e) => setRectangularConfig(prev => ({ 
                          ...prev, 
                          seatsPerRow: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Circular Configuration */}
              {zoneForm.type === "circular" && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Configuración Circular</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="circRings">Anillos</Label>
                      <Input
                        id="circRings"
                        type="number"
                        value={circularConfig.rings}
                        onChange={(e) => setCircularConfig(prev => ({ 
                          ...prev, 
                          rings: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="circSeats">Asientos/Anillo</Label>
                      <Input
                        id="circSeats"
                        type="number"
                        value={circularConfig.seatsPerRing}
                        onChange={(e) => setCircularConfig(prev => ({ 
                          ...prev, 
                          seatsPerRing: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="circStart">Ángulo Inicio</Label>
                      <Input
                        id="circStart"
                        type="number"
                        value={circularConfig.startAngle}
                        onChange={(e) => setCircularConfig(prev => ({ 
                          ...prev, 
                          startAngle: parseInt(e.target.value) || 0 
                        }))}
                        min="0"
                        max="360"
                      />
                    </div>
                    <div>
                      <Label htmlFor="circEnd">Ángulo Fin</Label>
                      <Input
                        id="circEnd"
                        type="number"
                        value={circularConfig.endAngle}
                        onChange={(e) => setCircularConfig(prev => ({ 
                          ...prev, 
                          endAngle: parseInt(e.target.value) || 180 
                        }))}
                        min="0"
                        max="360"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleAddZone}
                className="w-full btn-gradient"
                disabled={!zoneForm.name || !zoneForm.price}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Agregar Zona
              </Button>
            </div>
          </motion.div>
          
          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 card-shadow"
          >
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              Vista Previa del Mapa
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
              <svg
                className="w-full h-full"
                viewBox="0 0 800 600"
                style={{ minHeight: "500px" }}
              >
                {/* Background */}
                <rect width="800" height="600" fill="#f3f4f6" />
                
                {/* Stage */}
                <rect x="300" y="50" width="200" height="100" fill="#1f2937" rx="10" />
                <text x="400" y="105" textAnchor="middle" fill="white" fontSize="16">
                  ESCENARIO
                </text>
                
                {/* Zones */}
                {mapZones.map((zone, index) => (
                  <g key={index}>
                    {zone.type === "rectangular" ? (
                      <rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        fill={zone.color}
                        opacity="0.7"
                        stroke="#000"
                        strokeWidth="1"
                      />
                    ) : (
                      <path
                        d={generateCircularPath(zone)}
                        fill={zone.color}
                        opacity="0.7"
                        stroke="#000"
                        strokeWidth="1"
                      />
                    )}
                    <text
                      x={zone.type === "rectangular" ? zone.x + zone.width/2 : zone.centerX}
                      y={zone.type === "rectangular" ? zone.y + zone.height/2 : zone.centerY}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {zone.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Zone List */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Zonas Configuradas</h4>
              <div className="space-y-2">
                {mapZones.map((zone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-sm text-gray-500">
                        ({zone.type === "rectangular" 
                          ? `${zone.rows}x${zone.seatsPerRow}` 
                          : `${zone.rings} anillos`})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{formatCurrency(zone.price)}</span>
                      <button
                        onClick={() => setMapZones(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;