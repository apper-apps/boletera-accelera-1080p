import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { clearCart } from "@/store/slices/cartSlice";
import { ticketService } from "@/services/api/ticketService";
import { eventService } from "@/services/api/eventService";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency } from "@/utils/formatters";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, eventId } = useSelector(state => state.cart);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate Stripe payment
      const paymentData = {
        amount: total * 121, // Include tax
        currency: "eur",
        customer: customerInfo,
        items: items.map(item => ({
          seatId: item.seat.Id,
          zoneId: item.zone.Id,
          price: item.price,
        })),
      };

      const payment = await ticketService.processPayment(paymentData);
      
      // Create tickets
      const tickets = await ticketService.createTicketsFromCart(
        items.map(item => ({
          ...item,
          eventId: eventId,
        })),
        payment.id,
        customerInfo.email
      );

      // Clear cart
      dispatch(clearCart());

      // Navigate to confirmation
      navigate("/confirmation", {
        state: {
          tickets,
          customerInfo,
          payment,
          eventId,
        },
      });

      toast.success("¡Compra realizada con éxito!");
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Empty
          icon="ShoppingCart"
          title="Carrito vacío"
          message="No tienes asientos seleccionados para comprar"
          actionText="Ver Eventos"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 card-shadow"
      >
        <div className="flex items-center mb-8">
          <ApperIcon name="CreditCard" className="w-8 h-8 text-primary-500 mr-3" />
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-lg font-display font-semibold text-gray-900 mb-6">
              Información del Cliente
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Payment Method */}
              <div className="pt-6 border-t">
                <h3 className="text-md font-display font-semibold text-gray-900 mb-4">
                  Método de Pago
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="CreditCard" className="w-6 h-6 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Tarjeta de Crédito/Débito
                      </div>
                      <div className="text-sm text-gray-600">
                        Procesado de forma segura por Stripe
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Lock" className="w-5 h-5 mr-2" />
                      Pagar {formatCurrency(total * 1.21)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-display font-semibold text-gray-900 mb-6">
              Resumen del Pedido
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.seat.Id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.seat.identifier}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.zone.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (21%):</span>
                  <span>{formatCurrency(total * 0.21)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total * 1.21)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Shield" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Compra segura</div>
                  <div className="text-blue-700">
                    Tus datos están protegidos con encriptación SSL y procesamiento seguro de pagos.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;