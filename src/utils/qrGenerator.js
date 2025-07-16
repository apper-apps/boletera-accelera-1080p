import QRCode from "qrcode";

export const generateQRCode = async (data) => {
  try {
    const qrString = await QRCode.toString(data, {
      type: "svg",
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrString;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

export const generateQRDataURL = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error("Error generating QR data URL:", error);
    return null;
  }
};

export const createTicketQRData = (ticket) => {
  return JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    seatId: ticket.seatId,
    userId: ticket.userId,
    timestamp: ticket.purchasedAt,
    signature: `${ticket.id}-${ticket.eventId}-${ticket.seatId}`,
  });
};