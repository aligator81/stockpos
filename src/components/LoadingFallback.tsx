import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingFallbackProps {
  error?: Error | null;
  retry?: () => void;
  timeout?: number;
}

export default function LoadingFallback({ error, retry, timeout = 30000 }: LoadingFallbackProps) {
  // Show timeout message if it's been longer than the timeout period
  const isTimeout = error?.message.includes('504') || error?.message.includes('timeout');

  if (error) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            {isTimeout ? (
              <p className="text-lg">Connection timed out</p>
            ) : (
              <p className="text-lg">Failed to load</p>
            )}
          </div>
          <p className="text-gray-600 mb-4 max-w-md">
            {isTimeout
              ? "The server is taking too long to respond. This could be due to network issues or server load."
              : "There was a problem loading the content. This might be due to network issues or the server might be unavailable."}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}