import { useState } from "react";
import { EyeOff, Phone, ShieldCheck, User } from "lucide-react";
import { AuthIcon } from "@/components/auth/auth-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// mail/lock dùng SVG asset trong /images/auth/icons; các icon chưa có asset giữ lucide.
const assetIcons = new Set(["mail", "lock"]);
const lucideIcons = { user: User, phone: Phone, shield: ShieldCheck };

function FieldIcon({ icon, className }) {
  if (assetIcons.has(icon)) return <AuthIcon name={icon} className={className} />;
  const Icon = lucideIcons[icon];
  return Icon ? <Icon className={className} /> : null;
}

export function Field({ id, label, type = "text", placeholder, icon, autoComplete, required = true, ...props }) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="relative">
        {icon && <FieldIcon icon={icon} className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />}
        <Input id={id} name={id} type={password && show ? "text" : type} placeholder={placeholder} autoComplete={autoComplete} required={required} className={cn("h-12 rounded-xl border-border bg-card text-sm shadow-sm focus-visible:ring-primary/30", icon && "pl-11", password && "pr-11")} {...props} />
        {password && (
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {show ? <EyeOff className="size-4.5" /> : <AuthIcon name="eye" className="size-4.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
