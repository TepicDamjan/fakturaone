"use client";

import { useState } from "react";
import FeatureDashboardCard from "@/app/components/FeatureCardDashboard";
import DashboardFaktureModal, {
  type DashboardFakturaRow,
  type DashboardKarticaTip,
} from "@/app/components/DashboardFaktureModal";

type DashboardStatKarticeProps = {
  ukupnoTekst: string;
  brojPlacenih: number;
  brojKasnih: number;
  fakture: DashboardFakturaRow[];
};

export default function DashboardStatKartice({
  ukupnoTekst,
  brojPlacenih,
  brojKasnih,
  fakture,
}: DashboardStatKarticeProps) {
  const [modalTip, setModalTip] = useState<DashboardKarticaTip | null>(null);

  const otvori = (tip: DashboardKarticaTip) => setModalTip(tip);
  const zatvori = () => setModalTip(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
        <FeatureDashboardCard
          title={ukupnoTekst}
          description="Ukupno fakturisano (sve fakture)"
          onClick={() => otvori("ukupno")}
          icon={
            <svg
              width="46"
              height="40"
              viewBox="0 0 46 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect width="46" height="40" rx="8" fill="#EFF6FF" />
              <path
                d="M25 21C24.1667 21 23.4583 20.7083 22.875 20.125C22.2917 19.5417 22 18.8333 22 18C22 17.1667 22.2917 16.4583 22.875 15.875C23.4583 15.2917 24.1667 15 25 15C25.8333 15 26.5417 15.2917 27.125 15.875C27.7083 16.4583 28 17.1667 28 18C28 18.8333 27.7083 19.5417 27.125 20.125C26.5417 20.7083 25.8333 21 25 21ZM18 24C17.45 24 16.9792 23.8042 16.5875 23.4125C16.1958 23.0208 16 22.55 16 22V14C16 13.45 16.1958 12.9792 16.5875 12.5875C16.9792 12.1958 17.45 12 18 12H32C32.55 12 33.0208 12.1958 33.4125 12.5875C33.8042 12.9792 34 13.45 34 14V22C34 22.55 33.8042 23.0208 33.4125 23.4125C33.0208 23.8042 32.55 24 32 24H18ZM20 22H30C30 21.45 30.1958 20.9792 30.5875 20.5875C30.9792 20.1958 31.45 20 32 20V16C31.45 16 30.9792 15.8042 30.5875 15.4125C30.1958 15.0208 30 14.55 30 14H20C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16V20C18.55 20 19.0208 20.1958 19.4125 20.5875C19.8042 20.9792 20 21.45 20 22ZM31 28H14C13.45 28 12.9792 27.8042 12.5875 27.4125C12.1958 27.0208 12 26.55 12 26V15H14V26H31V28ZM18 22V14V22Z"
                fill="#137FEC"
              />
            </svg>
          }
        />
        <FeatureDashboardCard
          title={String(brojPlacenih)}
          description="Plaćene fakture"
          onClick={() => otvori("placeno")}
          icon={
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect width="40" height="40" rx="20" fill="#DCFCE7" />
              <path
                d="M17.5501 26.0125L11.8501 20.3125L13.2751 18.8875L17.5501 23.1625L26.7251 13.9875L28.1501 15.4125L17.5501 26.0125V26.0125"
                fill="#16A34A"
              />
            </svg>
          }
        />
        <FeatureDashboardCard
          title={String(brojKasnih)}
          description="Fakture koje kasne"
          onClick={() => otvori("kasni")}
          icon={
            <svg
              width="46"
              height="43"
              viewBox="0 0 46 43"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect width="46" height="43" rx="8" fill="#FEF2F2" />
              <path
                d="M12 31L23 12L34 31H12ZM15.45 29H30.55L23 16L15.45 29ZM23 28C23.2833 28 23.5208 27.9042 23.7125 27.7125C23.9042 27.5208 24 27.2833 24 27C24 26.7167 23.9042 26.4792 23.7125 26.2875C23.5208 26.0958 23.2833 26 23 26C22.7167 26 22.4792 26.0958 22.2875 26.2875C22.0958 26.4792 22 26.7167 22 27C22 27.2833 22.0958 27.5208 22.2875 27.7125C22.4792 27.9042 22.7167 28 23 28ZM22 25H24V20H22V25Z"
                fill="#DC2626"
              />
            </svg>
          }
        />
      </div>

      <DashboardFaktureModal
        otvoren={modalTip !== null}
        tip={modalTip}
        fakture={fakture}
        onClose={zatvori}
      />
    </>
  );
}
