import { Loader2 } from "lucide-react";
import "./ui.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  icon: Icon,
  iconPosition = "left",
  className = "",
  ...props
}) {
  const classes = [
    "ui-btn",
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    fullWidth ? "ui-btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="ui-spin" size={18} />
      ) : (
        Icon && iconPosition === "left" && <Icon size={18} />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
}
