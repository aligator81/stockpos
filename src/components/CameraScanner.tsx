import React, { useState, useEffect } from 'react';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { XCircle, Camera, RotateCw } from 'lucide-react';

interface CameraScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  const codeReader = useState(() => new BrowserMultiFormatReader());
  const videoRef = useState<HTMLVideoElement | null>(null);
  const streamRef = useState<MediaStream | null>(null);

  useEffect(() => {
    // Initialize the code reader with improved settings
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    
    codeReader[0].hints = hints;

    // Request camera permission
    requestCameraPermission();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    try {
      if (streamRef[0]) {
        streamRef[0].getTracks().forEach(track => track.stop());
        streamRef[0] = null;
      }
      if (codeReader[0]) {
        codeReader[0].reset();
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  const requestCameraPermission = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in your browser');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      setHasPermission(true);
      await setupScanner();
    } catch (err) {
      console.error('Camera permission error:', err);
      setHasPermission(false);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to access camera. Please ensure you have granted camera permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setupScanner = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!codeReader[0]) {
        throw new Error('Scanner not initialized');
      }

      // Get available cameras
      const devices = await codeReader[0].listVideoInputDevices();
      setAvailableCameras(devices);

      // Prefer back camera on mobile devices
      const backCamera = devices.find(device => 
        /(back|rear)/i.test(device.label)
      );
      const defaultCamera = backCamera || devices[0];

      if (!defaultCamera) {
        throw new Error('No camera found');
      }

      setSelectedCamera(defaultCamera.deviceId);

      // Setup video constraints optimized for barcode scanning
      const constraints = {
        video: {
          deviceId: defaultCamera.deviceId,
          facingMode: backCamera ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.7777777778 },
          frameRate: { ideal: 30 }
        }
      };

      // Start decoding
      await codeReader[0].decodeFromConstraints(
        constraints,
        videoRef[0]!,
        (result, error) => {
          if (result) {
            const text = result.getText();
            // Validate barcode format
            if (/^[0-9A-Z_-]{4,}$/i.test(text)) {
              cleanup();
              onScan(text);
              onClose();
            }
          }
        }
      );

      setIsLoading(false);
    } catch (err) {
      console.error('Scanner setup error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to initialize camera'
      );
      setIsLoading(false);
    }
  };

  const switchCamera = async () => {
    const currentIndex = availableCameras.findIndex(
      camera => camera.deviceId === selectedCamera
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    cleanup();
    setSelectedCamera(nextCamera.deviceId);
    await setupScanner();
  };

  const retrySetup = async () => {
    cleanup();
    await requestCameraPermission();
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Camera Access Required</h2>
          <p className="text-gray-600 mb-6">
            Please allow camera access to scan barcodes. You may need to reset permissions in your browser settings.
          </p>
          <div className="flex gap-3">
            <button
              onClick={retrySetup}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={() => {
            cleanup();
            onClose();
          }}
          className="absolute -top-12 right-0 text-white hover:text-gray-300"
        >
          <XCircle size={24} />
        </button>

        {/* Main content */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Video preview */}
          <div className="relative aspect-[16/9]">
            <video
              ref={videoRef[1]}
              className="w-full h-full object-cover"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-2" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {/* Scanning animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-[20%] border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500 animate-scan" />
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75">
              <div className="bg-white rounded-lg p-6 m-4 max-w-sm">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={retrySetup}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera switch button */}
          {availableCameras.length > 1 && !isLoading && !error && (
            <button
              onClick={switchCamera}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75"
            >
              <Camera size={24} />
            </button>
          )}
        </div>

        {/* Instructions */}
        <p className="text-white text-center mt-4 text-sm">
          Position the barcode within the frame to scan
        </p>
      </div>
    </div>
  );
};

export default CameraScanner;