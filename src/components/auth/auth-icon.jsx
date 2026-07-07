import { cn } from "@/lib/utils";

/**
 * Render một SVG trong /public/images/auth/icons qua CSS mask để icon
 * nhuộm được màu bằng currentColor (text-* token), thay vì <img> cố định màu đen.
 */
export function AuthIcon({ name, className }) {
  const url = `url('/images/auth/icons/${name}.svg')`;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
