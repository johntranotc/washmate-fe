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
    <div className="p-8">
      <DashboardHero />
      <DashboardStatsGrid />
      <QuickActions />
      <UpcomingBookings />
      <MyVehicles />
      <MembershipSummary />
      <CareTips />
      <RecentNotifications />
    </div>
  );
}
