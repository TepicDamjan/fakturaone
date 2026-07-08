"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ToastContainer from "@/app/components/toast/ToastContainer";

export type ToastTip = "uspeh" | "greska" | "info";

export type Toast = {
  id: string;
  tip: ToastTip;
  poruka: string;
};

type ToastContextValue = {
  prikaziToast: (toast: { tip: ToastTip; poruka: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TRAJANJE_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const ukloniToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }, []);

  const prikaziToast = useCallback(
    ({ tip, poruka }: { tip: ToastTip; poruka: string }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, tip, poruka }]);
      timeouts.current.set(
        id,
        setTimeout(() => ukloniToast(id), TOAST_TRAJANJE_MS)
      );
    },
    [ukloniToast]
  );

  return (
    <ToastContext.Provider value={{ prikaziToast }}>
      {children}
      <ToastContainer toasts={toasts} onUkloni={ukloniToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast se mora koristiti unutar ToastProvider-a.");
  }
  return ctx;
}
