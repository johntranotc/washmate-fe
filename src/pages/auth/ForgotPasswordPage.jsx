import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Field } from "@/components/auth/field";

export default function ForgotPasswordPage() {
  return (
    <div>
      <AuthHeading
        title="Quên mật khẩu?"
        description="Nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu."
      />

      <form className="flex flex-col gap-5">
        <Field id="email" label="Email" type="email" placeholder="ban@email.com" icon="mail" autoComplete="email" />

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,0.75)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          Gửi liên kết đặt lại
        </button>
      </form>

      <Link
        to="/login"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
