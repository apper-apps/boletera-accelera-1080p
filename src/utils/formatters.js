import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return format(new Date(date), "PPP", { locale: es });
};

export const formatTime = (date) => {
  return format(new Date(date), "HH:mm", { locale: es });
};

export const formatDateTime = (date) => {
  return format(new Date(date), "PPP 'a las' HH:mm", { locale: es });
};

export const formatShortDate = (date) => {
  return format(new Date(date), "dd/MM/yyyy");
};

export const formatDayMonth = (date) => {
  return format(new Date(date), "dd MMM", { locale: es });
};