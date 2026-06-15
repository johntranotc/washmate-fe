import { CreditCard } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function PaymentInvoicePage() {
  return (
    <PlaceholderPageContent
      title="Thanh toán & Hóa đơn"
      description="Theo dõi thanh toán, xem hóa đơn chi tiết và lịch sử giao dịch của bạn."
      icon={<CreditCard size={48} />}
      note="Tính năng thanh toán và hóa đơn sẽ được hoàn thiện ở Prompt 5."
    />
  );
}
