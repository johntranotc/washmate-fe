import { Loader2 } from "lucide-react";
import "./ui.css";

export default function Loading({
  label = "Đang tải...",
  fullScreen = false,
  size = 28,
  className = "",
}) {
  return (
    <div
      className={[
        "ui-loading",
        fullScreen ? "ui-loading-fullscreen" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Loader2 className="ui-spin" size={size} />
      {label && <span>{label}</span>}
    </div>
  );
}
