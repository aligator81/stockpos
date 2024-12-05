type NotificationType = 'success' | 'error' | 'info';

class Notification {
  private static instance: Notification;
  private notifications: {
    id: string;
    message: string;
    type: NotificationType;
    duration: number;
  }[] = [];
  private listeners: ((notifications: any[]) => void)[] = [];

  private constructor() {}

  static getInstance(): Notification {
    if (!Notification.instance) {
      Notification.instance = new Notification();
    }
    return Notification.instance;
  }

  subscribe(listener: (notifications: any[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(message: string, type: NotificationType = 'info', duration: number = 3000) {
    const id = Math.random().toString(36).substring(7);
    this.notifications.push({ id, message, type, duration });
    this.listeners.forEach(listener => listener([...this.notifications]));
    
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.listeners.forEach(listener => listener([...this.notifications]));
    }, duration);
  }

  success(message: string, duration?: number) {
    this.notify(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.notify(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.notify(message, 'info', duration);
  }
}

export const notify = Notification.getInstance();