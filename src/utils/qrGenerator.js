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

export const generateTicketPDF = async (ticketData) => {
  try {
    // Generate QR code as data URL for embedding
    const qrDataURL = await generateQRDataURL(ticketData.qrCode);
    
    // Create PDF content as HTML (to be converted to PDF)
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .ticket { border: 2px solid #333; padding: 20px; max-width: 400px; text-align: center; }
          .qr-code { margin: 15px 0; }
          .info { margin: 10px 0; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h2>Boleto Digital</h2>
          <div class="info">
            <span class="label">Evento:</span> ${ticketData.event}
          </div>
          <div class="info">
            <span class="label">Asiento:</span> ${ticketData.seat}
          </div>
          <div class="info">
            <span class="label">Zona:</span> ${ticketData.zone}
          </div>
          <div class="qr-code">
            <img src="${qrDataURL}" width="200" height="200" alt="QR Code" />
          </div>
          <p><small>Presenta este código QR en la entrada del evento</small></p>
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML to PDF blob (simplified approach)
    const blob = new Blob([pdfContent], { type: 'text/html' });
    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

export const generateTicketImage = async (ticketData) => {
  try {
    // Create canvas for ticket image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Text styling
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    // Title
    ctx.fillText('Boleto Digital', canvas.width / 2, 50);
    
    // Event info
    ctx.font = '16px Arial';
    ctx.fillText(`Evento: ${ticketData.event}`, canvas.width / 2, 90);
    ctx.fillText(`Asiento: ${ticketData.seat}`, canvas.width / 2, 120);
    ctx.fillText(`Zona: ${ticketData.zone}`, canvas.width / 2, 150);
    
    // Generate QR code and add to canvas
    const qrDataURL = await generateQRDataURL(ticketData.qrCode);
    if (qrDataURL) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, (canvas.width - 200) / 2, 180, 200, 200);
        
        // Instructions
        ctx.font = '12px Arial';
        ctx.fillText('Presenta este código QR en la entrada del evento', canvas.width / 2, 420);
      };
      img.src = qrDataURL;
    }
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateTicketDataForDownload = (ticket, event, seat, zone) => {
  return {
    event: event?.name || 'Evento',
    seat: seat?.identifier || 'N/A',
    zone: zone?.name || 'N/A',
    qrCode: ticket.qrCode || ticket.qr_code,
    ticketId: ticket.Id
  };
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