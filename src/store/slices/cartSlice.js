import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  total: 0,
  eventId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addSeat: (state, action) => {
      const { seat, zone, eventId } = action.payload;
      
      // Clear cart if different event
      if (state.eventId && state.eventId !== eventId) {
        state.items = [];
        state.total = 0;
      }
      
state.eventId = eventId;
      
      // Check if seat already in cart
      const existingItem = state.items.find(item => item.seat.Id === seat.Id);
      if (!existingItem) {
        state.items.push({
          seat,
          zone,
          price: zone.price,
        });
        state.total += zone.price;
      }
    },
removeSeat: (state, action) => {
      const seatId = action.payload;
      const itemIndex = state.items.findIndex(item => item.seat.Id === seatId);
      
      if (itemIndex >= 0) {
        state.total -= state.items[itemIndex].price;
        state.items.splice(itemIndex, 1);
      }
        
      // Clear eventId if cart is empty
      if (state.items.length === 0) {
        state.eventId = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.eventId = null;
    },
  },
});

export const { addSeat, removeSeat, clearCart } = cartSlice.actions;
export default cartSlice.reducer;