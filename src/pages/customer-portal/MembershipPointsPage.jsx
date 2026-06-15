import { Star } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function MembershipPointsPage() {
  return (
    <PlaceholderPageContent
      title="Điểm thành viên"
      description="Kiểm tra điểm hiện tại, hạng thành viên, tiến độ nâng cấp và các quyền lợi độc quyền."
      icon={<Star size={48} />}
      note="Tính năng quản lý điểm thành viên chi tiết sẽ được hoàn thiện ở Prompt 6."
    />
  );
}
