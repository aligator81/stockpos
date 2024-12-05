type EventCallback = () => void;

class EventEmitter {
    private listeners: { [key: string]: EventCallback[] } = {};

    subscribe(event: string, callback: EventCallback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    emit(event: string) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback());
        }
    }
}

export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
    SALE_COMPLETED: 'SALE_COMPLETED',
    DATA_UPDATED: 'DATA_UPDATED'
} as const;
