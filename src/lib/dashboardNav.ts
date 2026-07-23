export function shouldHideDashboardSidebar(pathname: string): boolean {
  if (pathname === "/dashboard/fakture/novafakturaforma") return true;
  if (pathname === "/dashboard/fakture/pregled") return true;
  if (/^\/dashboard\/fakture\/[^/]+\/pregled$/.test(pathname)) return true;
  return false;
}
