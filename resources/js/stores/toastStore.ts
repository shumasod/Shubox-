import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  duration: number;
}

interface ToastStore {
  toasts:  Toast[];
  add:     (toast: Omit<Toast, 'id'>) => string;
  remove:  (id: string) => void;
  clear:   () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  remove: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  clear:  ()  => set({ toasts: [] }),
}));

// Convenience helpers
export const toast = {
  success: (title: string, message?: string, duration = 4000) =>
    useToastStore.getState().add({ type: 'success', title, message, duration }),
  error:   (title: string, message?: string, duration = 6000) =>
    useToastStore.getState().add({ type: 'error',   title, message, duration }),
  warning: (title: string, message?: string, duration = 5000) =>
    useToastStore.getState().add({ type: 'warning', title, message, duration }),
  info:    (title: string, message?: string, duration = 4000) =>
    useToastStore.getState().add({ type: 'info',    title, message, duration }),
};
