import { useState, useEffect, useRef } from "react";

export const useQRScanner = (onScan, onError) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setHasPermission(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera permission denied:", error);
        setHasPermission(false);
        onError?.(error);
      }
    };

    if (isScanning) {
      requestCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isScanning, onError]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const simulateQRScan = (qrData) => {
    // Simulate QR scan for demo purposes
    setTimeout(() => {
      onScan?.(qrData);
    }, 1000);
  };

  return {
    isScanning,
    hasPermission,
    videoRef,
    startScanning,
    stopScanning,
    simulateQRScan,
  };
};