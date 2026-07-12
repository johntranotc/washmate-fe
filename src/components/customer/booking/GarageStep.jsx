import { useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGarageId } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { key: "distance", label: "Gần nhất" },
  { key: "rating", label: "Đánh giá cao" },
  { key: "slots", label: "Còn slot hôm nay" },
  { key: "open", label: "Đang mở cửa" },
];

// Fake map pin positions (top%, left%) for up to 5 garages
const PIN_POSITIONS = [
  { top: "38%", left: "46%" },
  { top: "22%", left: "66%" },
  { top: "56%", left: "28%" },
  { top: "28%", left: "38%" },
  { top: "48%", left: "62%" },
];

export function GarageStep({ garages, selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  function requestGeolocation() {
    if (!navigator.geolocation) {
      setGeoError("Trình duyệt không hỗ trợ định vị vị trí.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("distance");
        setGeoLoading(false);
      },
      () => {
        setGeoError("Không thể lấy vị trí. Hãy tìm theo tên quận/huyện.");
        setGeoLoading(false);
      },
    );
  }

  const processed = useMemo(() => {
    let list = [...garages];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.address?.toLowerCase().includes(q) ||
          g.district?.toLowerCase().includes(q),
      );
    }
    if (sortBy === "distance") {
      list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "slots") {
      list = list.filter((g) => g.availableSlots > 0).sort((a, b) => b.availableSlots - a.availableSlots);
    } else if (sortBy === "open") {
      list = list.filter((g) => g.isOpen);
    }
    return list;
  }, [garages, search, sortBy]);

  if (!garages.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <MapPin className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-xl font-extrabold text-foreground">Không có gara</h2>
        <p className="mt-2 text-sm text-muted-foreground">Không tìm thấy gara nào đang hoạt động.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left column */}
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên gara, địa chỉ, quận/huyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-10 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(sortBy === key ? null : key)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold transition",
                sortBy === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {label}
            </button>
          ))}
          {(search || sortBy) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSortBy(null); }}
              className="rounded-full border border-dashed border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Count */}
        <p className="text-xs font-semibold text-muted-foreground">
          Tìm thấy{" "}
          <strong className="text-foreground">{processed.length}</strong> gara
          {search && ` cho "${search}"`}
        </p>

        {/* List */}
        {processed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <MapPin className="mx-auto size-9 text-muted-foreground/50" />
            <p className="mt-3 font-bold text-foreground">Không tìm thấy gara</p>
            <p className="mt-1 text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {processed.map((garage) => {
              const gid = getGarageId(garage);
              return (
                <GarageCard
                  key={gid ?? garage.name}
                  garage={garage}
                  selected={String(selectedId) === String(gid)}
                  onSelect={() => onSelect(garage)}
                  onHover={() => setHoveredId(gid)}
                  onLeave={() => setHoveredId(null)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Right column — map panel */}
      <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
        <MapPreviewPanel
          garages={processed}
          allGarages={garages}
          selectedId={selectedId}
          hoveredId={hoveredId}
          userLocation={userLocation}
          geoLoading={geoLoading}
          geoError={geoError}
          onRequestLocation={requestGeolocation}
          onSelectGarage={onSelect}
        />
      </aside>
    </div>
  );
}

function GarageCard({ garage, selected, onSelect, onHover, onLeave }) {
  const slotsInfo =
    garage.availableSlots === 0
      ? { label: "Hết slot hôm nay", color: "text-critical" }
      : garage.availableSlots <= 2
        ? { label: `${garage.availableSlots} slot còn trống — sắp đầy`, color: "text-warning" }
        : { label: `${garage.availableSlots} slot còn trống`, color: "text-success" };

  return (
    <article
      className={cn(
        "cursor-pointer rounded-2xl border-2 bg-card p-5 shadow-sm transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-cta"
          : "border-border hover:border-primary/40 hover:shadow-card",
        !garage.isOpen && !selected && "opacity-60",
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <GarageIcon selected={selected} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-extrabold text-foreground">{garage.name}</h3>
            <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
              Mã gara: {garage.id ?? garage.garageId ?? "?"}
            </span>
            {!garage.isOpen && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                Tạm đóng
              </span>
            )}
          </div>
          {garage.badges?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {garage.badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-extrabold",
                    badge === "Gần bạn nhất" && "bg-primary-container text-primary-strong",
                    badge === "Đề xuất" && "bg-success-container text-success",
                    badge === "Đang mở cửa" && "bg-teal/60 text-accent-cyan",
                    badge === "Đánh giá cao" && "bg-warning-container text-warning",
                    !["Gần bạn nhất", "Đề xuất", "Đang mở cửa", "Đánh giá cao"].includes(badge) &&
                      "bg-primary/10 text-primary",
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex shrink-0 items-center gap-1">
          <Star size={14} className="fill-gold text-gold" />
          <span className="text-sm font-extrabold text-foreground">
            {garage.rating?.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({garage.reviewCount})
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p className="flex items-start gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
          <span>{garage.address}</span>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {garage.distanceKm != null && (
            <p className="flex items-center gap-1.5 font-semibold text-primary">
              <Navigation size={14} /> {garage.distanceKm} km
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Clock3 size={14} className="text-primary" /> {garage.openingHours}
          </p>
          {garage.phone && (
            <p className="flex items-center gap-1.5">
              <Phone size={14} className="text-primary" /> {garage.phone}
            </p>
          )}
        </div>
        <p className={cn("flex items-center gap-1.5 font-bold", slotsInfo.color)}>
          <Calendar size={14} /> {slotsInfo.label}
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onSelect}
        disabled={!garage.isOpen && !selected}
        className={cn(
          "mt-5 w-full rounded-2xl px-4 py-2.5 text-sm font-bold transition",
          selected
            ? "bg-primary text-primary-foreground"
            : !garage.isOpen
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-muted text-primary hover:bg-primary/10",
        )}
      >
        {selected ? "✓ Đã chọn gara" : !garage.isOpen ? "Gara tạm đóng" : "Chọn gara này"}
      </button>
    </article>
  );
}

function MapPreviewPanel({
  garages,
  allGarages,
  selectedId,
  hoveredId,
  userLocation,
  geoLoading,
  geoError,
  onRequestLocation,
  onSelectGarage,
}) {
  // Use allGarages for stable pin positions
  const pinGarages = allGarages.slice(0, PIN_POSITIONS.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Map area */}
      <div className="relative h-72 overflow-hidden bg-[#e9eef4]">
        {/* Nền bản đồ minh họa kiểu thành phố: đất, công viên, sông, mạng lưới đường lớn–nhỏ */}
        <svg
          viewBox="0 0 400 288"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Đất nền + vài mảng khối phố khác sắc nhẹ */}
          <rect width="400" height="288" fill="#e9eef4" />
          <rect x="14" y="14" width="130" height="70" fill="#eef2f8" />
          <rect x="312" y="150" width="80" height="120" fill="#eef2f8" />
          {/* Công viên */}
          <rect x="250" y="24" width="120" height="82" rx="12" fill="#d8ecd0" />
          <rect x="250" y="24" width="120" height="82" rx="12" fill="none" stroke="#c3ddb8" strokeWidth="1.5" />
          {/* Sông uốn lượn phía dưới */}
          <path d="M-20 214 C 70 196 120 252 214 236 S 360 214 430 252 L 430 300 L -20 300 Z" fill="#c3e2f6" />
          <path d="M-20 214 C 70 196 120 252 214 236 S 360 214 430 252" fill="none" stroke="#a9d3ef" strokeWidth="2" />
          {/* Casing (mép đường) xám nhạt */}
          <g stroke="#cdd7e4" fill="none" strokeLinecap="round">
            <line x1="-10" y1="100" x2="410" y2="100" strokeWidth="14" />
            <line x1="-10" y1="196" x2="410" y2="196" strokeWidth="11" />
            <line x1="164" y1="-10" x2="164" y2="298" strokeWidth="13" />
            <line x1="300" y1="-10" x2="300" y2="298" strokeWidth="10" />
            <line x1="-10" y1="18" x2="410" y2="182" strokeWidth="9" />
          </g>
          {/* Lòng đường trắng — trục chính dày, đường phụ mảnh */}
          <g stroke="#ffffff" fill="none" strokeLinecap="round">
            <line x1="-10" y1="100" x2="410" y2="100" strokeWidth="9" />
            <line x1="-10" y1="196" x2="410" y2="196" strokeWidth="7" />
            <line x1="164" y1="-10" x2="164" y2="298" strokeWidth="8" />
            <line x1="300" y1="-10" x2="300" y2="298" strokeWidth="6" />
            <line x1="-10" y1="18" x2="410" y2="182" strokeWidth="5.5" />
          </g>
          <g stroke="#ffffff" fill="none" strokeLinecap="round" opacity="0.9">
            <line x1="72" y1="-10" x2="72" y2="298" strokeWidth="3" />
            <line x1="234" y1="-10" x2="234" y2="298" strokeWidth="3" />
            <line x1="-10" y1="150" x2="410" y2="150" strokeWidth="3" />
            <line x1="-10" y1="248" x2="410" y2="248" strokeWidth="3" />
          </g>
        </svg>

        {/* Radius circle (shows when location found) */}
        {userLocation && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-28 rounded-full border-2 border-primary/50 bg-primary-container/20" />
        )}

        {/* Garage pins */}
        {pinGarages.map((garage, index) => {
          const gid = getGarageId(garage);
          const isSelected = String(selectedId) === String(gid);
          const isHovered = String(hoveredId) === String(gid);
          const pos = PIN_POSITIONS[index];
          const isFiltered = garages.some((g) => String(getGarageId(g)) === String(gid));
          return (
            <button
              key={gid ?? index}
              type="button"
              onClick={() => isFiltered && onSelectGarage(garage)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-full transition-all duration-200",
                !isFiltered && "opacity-30",
              )}
              style={pos}
              title={garage.name}
            >
              <div
                className={cn(
                  "flex flex-col items-center",
                  (isSelected || isHovered) && "scale-125",
                )}
              >
                <span
                  className={cn(
                    "mb-1 rounded-full px-2 py-0.5 text-xs font-extrabold whitespace-nowrap shadow-card",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-card text-foreground border border-border",
                  )}
                >
                  {garage.name.replace("WashMate ", "")}
                </span>
                <span
                  className={cn(
                    "size-4 rounded-full border-2 border-white shadow-card",
                    isSelected
                      ? "bg-primary"
                      : !garage.isOpen
                        ? "bg-neutral-muted"
                        : "bg-success",
                  )}
                />
              </div>
            </button>
          );
        })}

        {/* User location dot */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            !userLocation && "opacity-30",
          )}
        >
          <div className="relative">
            <div className="size-3.5 rounded-full border-2 border-white bg-primary" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 space-y-1 rounded-xl bg-card px-3 py-2 text-xs shadow-sm">
          <p className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" /> Mở cửa
          </p>
          <p className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-neutral-muted" /> Tạm đóng
          </p>
          <p className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> Bạn
          </p>
        </div>

        {/* "Map simulation" label */}
        <div className="absolute left-2 top-2 rounded-lg bg-card px-2 py-1 text-xs font-semibold text-muted-foreground">
          Bản đồ minh họa
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 p-4">
        <Button
          variant="outline"
          onClick={onRequestLocation}
          disabled={geoLoading}
          className="w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
        >
          <Navigation />
          {geoLoading ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
        </Button>
        {geoError && (
          <p className="text-center text-xs text-warning">{geoError}</p>
        )}
        {userLocation && !geoError && (
          <p className="text-center text-xs font-semibold text-success">
            Đã lấy vị trí. Gara được sắp xếp theo khoảng cách.
          </p>
        )}
      </div>
    </div>
  );
}

// Icon thẻ gara: dùng ảnh /images/icons/garage.png; thiếu file thì về icon MapPin cũ.
function GarageIcon({ selected }) {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      <img
        src="/images/icons/garage.png"
        alt=""
        className="size-11 shrink-0 rounded-2xl object-contain"
        onError={() => setOk(false)}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl",
        selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
      )}
    >
      <MapPin size={20} />
    </span>
  );
}
