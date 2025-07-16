import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { removeSeat } from "@/store/slices/cartSlice";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { formatCurrency } from "@/utils/formatters";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeSeat(item.seat.id));
  };

  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: item.zone.color }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {item.seat.identifier}
            </div>
            <div className="text-sm text-gray-600">
              {item.zone.name}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-gray-900">
          {formatCurrency(item.price)}
        </span>
        
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default CartItem;