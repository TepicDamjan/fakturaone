"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { DashboardNavContext } from "@/app/components/DashboardNavContext";
import { shouldHideDashboardSidebar } from "@/lib/dashboardNav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sidebarHidden = shouldHideDashboardSidebar(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <DashboardNavContext.Provider
      value={{
        sidebarHidden,
        mobileOpen,
        openMobileMenu: () => setMobileOpen(true),
        closeMobileMenu: () => setMobileOpen(false),
      }}
    >
      <div className="flex h-screen w-full min-h-0 bg-[#F8FAFC]">
        {!sidebarHidden ? (
          <DashboardSidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </DashboardNavContext.Provider>
  );
}
