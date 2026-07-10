// Chuẩn hoá + logic hiển thị cho trang "Xe của tôi".
// Nguồn dữ liệu THẬT: vehicleApi.getMyVehicles() (VehicleResponse) + bookingApi.getMyBookings().
// BE Vehicle chỉ có: vehicleId, licensePlate, brand, model, color, status, createdAt, updatedAt.
// KHÔNG có: isDefault, type/bodyType, imageUrl, lastServiceDate, totalBookings → không bịa.

import { asList } from "./booking-flow";

export const VEHICLE_STATUS_LABELS = {
  ACTIVE: "Đang sử dụng",
  INACTIVE: "Tạm ẩn",
  DELETED: "Đã xóa",
};

export const VEHICLE_STATUS_TONES = {
  ACTIVE: "bg-success-container text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  DELETED: "bg-muted text-muted-foreground",
};

// Field lõi để một xe được xem là "đủ thông tin". Thiếu bất kỳ field nào → cần cập nhật.
export const CORE_FIELDS = ["licensePlate", "brand", "model", "color"];

const EMPTY_MARKS = ["", "chưa cập nhật", "chua cap nhat", "n/a", "-", "—"];

function isBlank(value) {
  if (value === null || value === undefined) return true;
  const s = String(value).trim().toLowerCase();
  return EMPTY_MARKS.includes(s);
}

/** Chuẩn hoá một bản ghi xe từ BE — không thêm dữ liệu giả. */
export function normalizeVehicleRecord(raw) {
  const v = raw || {};
  return {
    id: v.vehicleId ?? v.id ?? null,
    licensePlate: isBlank(v.licensePlate) ? "" : String(v.licensePlate).trim().toUpperCase(),
    brand: isBlank(v.brand) ? "" : String(v.brand).trim(),
    model: isBlank(v.model) ? "" : String(v.model).trim(),
    color: isBlank(v.color) ? "" : String(v.color).trim(),
    status: v.status || "ACTIVE",
    createdAt: v.createdAt || v.created_at || "",
    updatedAt: v.updatedAt || v.updated_at || "",
  };
}

export function normalizeVehicleList(value) {
  return asList(value).map(normalizeVehicleRecord);
}

/** Tên xe hiển thị tự nhiên: "Honda City" | "Honda" | fallback rõ ràng. */
export function vehicleDisplayName(v) {
  const brand = v?.brand?.trim();
  const model = v?.model?.trim();
  if (brand && model) return `${brand} ${model}`;
  if (brand) return brand;
  if (model) return model;
  return "Xe chưa cập nhật tên";
}

/** Danh sách field lõi đang thiếu (để gợi ý cập nhật). */
export function missingCoreFields(v) {
  const LABEL = { licensePlate: "biển số", brand: "hãng xe", model: "dòng xe", color: "màu sơn" };
  return CORE_FIELDS.filter((f) => isBlank(v?.[f])).map((f) => LABEL[f]);
}

export const vehicleNeedsUpdate = (v) => missingCoreFields(v).length > 0;
export const isActiveVehicle = (v) => (v?.status || "ACTIVE") === "ACTIVE";

// ---- Enrich từ booking THẬT (khớp theo biển số) ----

function bookingPlate(b) {
  return (b?.plate || b?.vehicle?.licensePlate || b?.licensePlate || "").toString().trim().toUpperCase();
}

function dateValue(b) {
  const raw = b?.bookingDate ? String(b.bookingDate).slice(0, 10) : "";
  if (!raw) return 0;
  const ms = new Date(`${raw}T${/^\d{2}:\d{2}/.test(b?.slotTime || "") ? b.slotTime : "00:00"}:00`).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Gắn thống kê chăm sóc cho từng xe từ danh sách booking đã chuẩn hoá.
 * Trả về map theo id xe: { totalBookings, lastService, recentBookings }.
 * Không có dữ liệu → totalBookings 0, lastService null (UI hiển thị "Chưa có").
 */
export function buildVehicleStats(vehicles, bookings) {
  const list = Array.isArray(bookings) ? bookings : [];
  const stats = {};
  for (const v of vehicles) {
    if (!v.licensePlate) {
      stats[v.id] = { totalBookings: 0, lastService: null, recentBookings: [] };
      continue;
    }
    const mine = list
      .filter((b) => bookingPlate(b) === v.licensePlate)
      .sort((a, b) => dateValue(b) - dateValue(a));
    const completed = mine.filter((b) => b.bookingStatus === "COMPLETED");
    const last = completed[0] || null;
    stats[v.id] = {
      totalBookings: mine.length,
      lastService: last
        ? { date: last.bookingDate, serviceName: last.serviceName, garageName: last.garageName }
        : null,
      recentBookings: mine.slice(0, 3),
    };
  }
  return stats;
}
