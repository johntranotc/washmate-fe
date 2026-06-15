import { Gift } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function PromotionsPage() {
  return (
    <PlaceholderPageContent
      title="Ưu đãi"
      description="Khám phá các ưu đãi độc quyền dành cho thành viên SparkleAI / WashMate."
      icon={<Gift size={48} />}
      note="Tính năng ưu đãi và khuyến mãi sẽ được hoàn thiện ở Prompt 6."
    />
  );
}
