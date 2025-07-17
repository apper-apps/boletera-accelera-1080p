import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { items } = useSelector(state => state.cart);
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { logout } = useContext(AuthContext);

  const navigation = [
    { name: "Eventos", href: "/", icon: "Calendar" },
    { name: "Mis Boletos", href: "/my-tickets", icon: "Ticket" },
  ];

  // Add role-based navigation
  if (user?.emailAddress === "admin@boletera.com") {
    navigation.push({ name: "Admin", href: "/admin", icon: "Settings" });
  }

  if (user?.emailAddress === "staff@boletera.com") {
    navigation.push({ name: "Scanner", href: "/scanner", icon: "Scan" });
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg p-2">
              <ApperIcon name="Ticket" className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              Boletera Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <ApperIcon name={item.icon} className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cart, User Info and Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link to="/checkout" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ApperIcon name="ShoppingCart" className="w-5 h-5" />
                {items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {items.length}
                  </Badge>
                )}
              </Button>
</Link>

            {/* User Info and Logout */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.firstName || user.emailAddress}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ApperIcon name="LogIn" className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            )}
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <ApperIcon name={isMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ApperIcon name={item.icon} className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
{/* Mobile User Actions */}
            {isAuthenticated && user ? (
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">
                  {user.firstName || user.emailAddress}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="border-t pt-2 mt-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ApperIcon name="LogIn" className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Link>
              </div>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;