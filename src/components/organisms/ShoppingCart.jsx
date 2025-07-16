import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clearCart } from "@/store/slices/cartSlice";
import CartItem from "@/components/molecules/CartItem";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency } from "@/utils/formatters";

const ShoppingCart = ({ className = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 card-shadow ${className}`}>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Carrito de Compras
        </h3>
        
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-full p-6 inline-block mb-4">
            <ApperIcon name="ShoppingCart" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <p className="text-sm text-gray-500">
            Selecciona asientos del mapa para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 card-shadow ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Carrito de Compras
        </h3>
        <Button
          onClick={handleClearCart}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>

      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {items.map((item) => (
            <CartItem key={item.seat.Id} item={item} />
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-display font-semibold text-gray-900">
            Total:
          </span>
          <span className="text-2xl font-display font-bold gradient-text">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Comisión de servicio:</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA (21%):</span>
            <span>{formatCurrency(total * 0.21)}</span>
          </div>
        </div>

        <motion.div className="mt-6">
          <Button
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="CreditCard" className="w-5 h-5 mr-2" />
            Proceder al Pago
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ShoppingCart;