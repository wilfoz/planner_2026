import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };

    this.toasts.update(current => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  success(message: string, title?: string, duration = 5000) {
    this.show({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration = 5000) {
    this.show({ type: 'error', message, title, duration });
  }

  info(message: string, title?: string, duration = 5000) {
    this.show({ type: 'info', message, title, duration });
  }

  warning(message: string, title?: string, duration = 5000) {
    this.show({ type: 'warning', message, title, duration });
  }
}
