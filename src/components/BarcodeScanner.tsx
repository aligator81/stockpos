import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
  onOpenCamera?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function BarcodeScanner({
  onScan,
  onError,
  onOpenCamera,
  placeholder = "Scan barcode or enter product code",
  autoFocus = true
}: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [buffer, setBuffer] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const successAudioRef = useRef<HTMLAudioElement>();
  const errorAudioRef = useRef<HTMLAudioElement>();

  // Initialize audio elements
  useEffect(() => {
    successAudioRef.current = new Audio('/beep-success.mp3');
    errorAudioRef.current = new Audio('/beep-error.mp3');

    return () => {
      successAudioRef.current?.remove();
      errorAudioRef.current?.remove();
    };
  }, []);

  // Play audio feedback
  const playAudio = (success: boolean) => {
    const audio = success ? successAudioRef.current : errorAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Ignore audio play errors
    }
  };

  // Process scanned barcode
  const processScan = useCallback((barcode: string) => {
    const now = Date.now();
    // Prevent duplicate scans within 1 second
    if (barcode === lastScan && now - lastScanTime < 1000) {
      return;
    }

    // Validate barcode format (adjust regex based on your barcode format)
    const isValidBarcode = /^[0-9A-Z_-]{4,}$/i.test(barcode);
    
    try {
      if (!isValidBarcode) {
        throw new Error('Invalid barcode format');
      }
      onScan(barcode);
      setLastScan(barcode);
      setLastScanTime(now);
      playAudio(true);
    } catch (error) {
      onError?.(error as Error);
      playAudio(false);
    }
  }, [onScan, onError, lastScan, lastScanTime]);

  // Handle keyboard input for barcode scanner
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const keyPressDelay = 30; // Typical barcode scanner delay between characters

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not typing in another input field
      if (
        document.activeElement?.tagName === 'INPUT' &&
        (document.activeElement as HTMLInputElement).id !== 'barcode-input'
      ) {
        return;
      }

      // Clear buffer after delay (for manual typing vs scanner)
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (buffer) {
          processScan(buffer);
          setBuffer('');
        }
      }, keyPressDelay);

      // Handle Enter key
      if (e.key === 'Enter') {
        e.preventDefault();
        if (buffer) {
          processScan(buffer);
          setBuffer('');
        } else if (manualInput) {
          processScan(manualInput);
          setManualInput('');
        }
        return;
      }

      // Add character to buffer if it's a valid character
      if (e.key.length === 1 && /[\w\d-_]/.test(e.key)) {
        setBuffer(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [processScan, manualInput, buffer]);

  // Auto-focus input on mount
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleCameraClick = () => {
    if (onOpenCamera) {
      onOpenCamera();
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            id="barcode-input"
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
            autoFocus={autoFocus}
          />
        </div>
        {onOpenCamera && (
          <button
            type="button"
            onClick={handleCameraClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Camera size={20} />
            <span className="hidden sm:inline">Scan</span>
          </button>
        )}
      </form>
    </div>
  );
}