import { cn } from "@/lib/utils";

const VARIANTS = {
  admin: "max-w-[1600px]", // Admin + Staff
  customer: "max-w-7xl", // Customer portal
  narrow: "max-w-5xl", // public/auth/form đơn
};

/** Khung page chuẩn: bề rộng theo portal + padding + nhịp dọc thống nhất. */
export function PageContainer({ variant = "admin", className, children }) {
  return (
    <div className={cn("mx-auto space-y-6 p-4 sm:p-6 lg:p-8", VARIANTS[variant] || VARIANTS.admin, className)}>
      {children}
    </div>
  );
}

export default PageContainer;
