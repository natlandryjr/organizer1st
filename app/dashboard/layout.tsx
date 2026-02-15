import { DashboardNav } from "./DashboardNav";
import { DashboardTour } from "@/components/DashboardTour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <DashboardTour />
      <DashboardNav />
      {children}
    </div>
  );
}
