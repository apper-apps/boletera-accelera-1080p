import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg p-2">
                <ApperIcon name="Ticket" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                Boletera Pro
              </span>
            </Link>
            <p className="text-gray-600 text-sm max-w-md">
              La plataforma profesional para la venta de boletos con mapas interactivos 
              y validación QR. Perfecta para eventos de cualquier tamaño.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-gray-900 mb-4">
              Enlaces Rápidos
            </h3>
            <nav className="space-y-2">
              <Link to="/" className="block text-sm text-gray-600 hover:text-gray-900">
                Eventos
              </Link>
              <Link to="/my-tickets" className="block text-sm text-gray-600 hover:text-gray-900">
                Mis Boletos
              </Link>
              <Link to="/scanner" className="block text-sm text-gray-600 hover:text-gray-900">
                Scanner
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-gray-900 mb-4">
              Contacto
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Mail" className="w-4 h-4" />
                <span>info@boleteraPro.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Phone" className="w-4 h-4" />
                <span>+34 900 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="MapPin" className="w-4 h-4" />
                <span>Madrid, España</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © 2024 Boletera Pro. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900">
              Términos de Uso
            </Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900">
              Privacidad
            </Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900">
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;