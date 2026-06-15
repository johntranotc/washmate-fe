import { User } from "lucide-react";
import { PlaceholderPageContent } from "@/components/customer-portal/placeholder-page";

export default function AccountPage() {
  return (
    <PlaceholderPageContent
      title="Tài khoản"
      description="Quản lý thông tin cá nhân, mật khẩu, địa chỉ, liên hệ và các cài đặt bảo mật."
      icon={<User size={48} />}
      note="Tính năng tài khoản sẽ được hoàn thiện ở các Prompt tiếp theo."
    />
  );
}
