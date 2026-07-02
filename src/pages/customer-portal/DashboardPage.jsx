import { DashboardHero } from "@/components/customer-portal/dashboard-hero";
import { DashboardStatsGrid } from "@/components/customer-portal/stats-grid";
import { QuickActions } from "@/components/customer-portal/quick-actions";
import { UpcomingBookings } from "@/components/customer-portal/upcoming-bookings";
import { MyVehicles } from "@/components/customer-portal/my-vehicles";
import { MembershipSummary } from "@/components/customer-portal/membership-summary";
import { CareTips } from "@/components/customer-portal/care-tips";
import { RecentNotifications } from "@/components/customer-portal/recent-notifications";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 p-4 sm:p-8 pb-32">
      <DashboardHero />
      <DashboardStatsGrid />
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingBookings />
        <MyVehicles />
      </div>
      <QuickActions />
      <div className="grid gap-6 lg:grid-cols-2">
        <MembershipSummary />
        <RecentNotifications />
      </div>
      <CareTips />
    </div>
  );
}
