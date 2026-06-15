import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const icons = { mail: Mail, lock: Lock, user: User, phone: Phone, shield: ShieldCheck };

export function Field({ id, label, type = "text", placeholder, icon, autoComplete, required = true, ...props }) {
  const Icon = icon ? icons[icon] : null;
  const [show, setShow] = useState(false);
  const password = type === "password";
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />}
        <Input id={id} name={id} type={password && show ? "text" : type} placeholder={placeholder} autoComplete={autoComplete} required={required} className={cn("h-12 rounded-xl border-border bg-card text-[15px] shadow-sm focus-visible:ring-primary/30", Icon && "pl-11", password && "pr-11")} {...props} />
        {password && <button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}</button>}
      </div>
    </div>
  );
}
