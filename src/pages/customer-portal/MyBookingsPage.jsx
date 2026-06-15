import { Calendar } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function MyBookingsPage() {
  return (
    <PlaceholderPageContent
      title="Lịch đặt của tôi"
      description="Xem và quản lý toàn bộ lịch rửa xe của bạn tại SparkleAI / WashMate."
      icon={<Calendar size={48} />}
      note="Tính năng đang được hoàn thiện trong bước tiếp theo."
    />
  );
}
