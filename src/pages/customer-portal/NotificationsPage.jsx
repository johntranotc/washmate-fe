import { Bell } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function NotificationsPage() {
  return (
    <PlaceholderPageContent
      title="Thông báo"
      description="Xem toàn bộ các thông báo về lịch đặt, điểm thưởng, ưu đãi và cập nhật từ WashMate."
      icon={<Bell size={48} />}
      note="Tính năng thông báo chi tiết sẽ được hoàn thiện ở Prompt 6."
    />
  );
}
