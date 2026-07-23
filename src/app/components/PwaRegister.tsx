"use client";

import { useEffect } from "react";

/** Registruje service worker za PWA (samo u production browseru). */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* tiho — SW nije kritičan za funkcionisanje */
    });
  }, []);

  return null;
}
