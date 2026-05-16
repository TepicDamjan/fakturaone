"use client";

import { createContext, useContext } from "react";

type DashboardNavContextValue = {
  sidebarHidden: boolean;
  mobileOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
};

export const DashboardNavContext = createContext<DashboardNavContextValue | null>(
  null
);

export function useDashboardNav() {
  return useContext(DashboardNavContext);
}
