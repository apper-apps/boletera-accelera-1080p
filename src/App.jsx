import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import EventList from "@/components/pages/EventList";
import EventDetail from "@/components/pages/EventDetail";
import Checkout from "@/components/pages/Checkout";
import TicketConfirmation from "@/components/pages/TicketConfirmation";
import MyTickets from "@/components/pages/MyTickets";
import Scanner from "@/components/pages/Scanner";
import AdminPanel from "@/components/pages/AdminPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EventList />} />
          <Route path="events/:eventId" element={<EventDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation" element={<TicketConfirmation />} />
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="z-[9999]"
      />
    </div>
  );
}

export default App;