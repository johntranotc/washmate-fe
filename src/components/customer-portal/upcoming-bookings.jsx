import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Calendar, Plus } from "lucide-react";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { formatBookingDate, formatMoney } from "@/lib/customer-booking-data";

const statusColors = {
  "Chờ thanh toán": "bg-yellow-100 text-yellow-800",
  "PENDING_STAFF_CONFIRMATION": "bg-yellow-100 text-yellow-800",
  "PENDING": "bg-yellow-100 text-yellow-800",
  "Đã xác nhận": "bg-blue-100 text-blue-800",
  "CONFIRMED": "bg-blue-100 text-blue-800",
  "Đã check-in": "bg-teal-100 text-teal-800",
  "CHECKED_IN": "bg-teal-100 text-teal-800",
  "Đang rửa xe": "bg-purple-100 text-purple-800",
  "IN_PROGRESS": "bg-purple-100 text-purple-800",
  "Đã hoàn tất": "bg-green-100 text-green-800",
  "COMPLETED": "bg-green-100 text-green-800",
  "Đã hủy": "bg-red-100 text-red-800",
  "CANCELLED": "bg-red-100 text-red-800",
  "REJECTED": "bg-red-100 text-red-800",
};

const statusLabels = {
  "PENDING_STAFF_CONFIRMATION": "Chờ xác nhận",
  "PENDING": "Chờ xử lý",
  "CONFIRMED": "Đã xác nhận",
  "CHECKED_IN": "Đã đến gara",
  "IN_PROGRESS": "Đang rửa xe",
  "COMPLETED": "Hoàn tất",
  "CANCELLED": "Đã hủy",
  "REJECTED": "Từ chối",
};

export function UpcomingBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { bookings: list } = await loadCustomerBookingList();
        // Lấy tối đa 3 lịch mới nhất
        setBookings((list || []).slice(0, 3));
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Lịch đặt sắp tới</h2>
          <p className="font-medium text-muted-foreground">
            Theo dõi các lịch rửa xe gần nhất và trạng thái xử lý của bạn.
          </p>
        </div>
        <Button
          onClick={() => navigate("/khach-hang/dat-lich-moi")}
          className="rounded-xl bg-primary px-4 py-2 font-bold text-white shadow-md hover:bg-primary/90"
        >
          <Plus size={18} className="mr-1" /> Đặt lịch mới
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-muted-foreground">
          Đang tải lịch đặt...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <Calendar size={36} className="mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="font-semibold text-foreground">Bạn chưa có lịch đặt nào</p>
          <Button
            variant="link"
            onClick={() => navigate("/khach-hang/dat-lich-moi")}
            className="mt-1 text-primary font-bold"
          >
            Đặt lịch rửa xe ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking, idx) => {
            if (!booking || typeof booking !== "object") return null;
            const rawStatus = booking.bookingStatus || booking.status || "PENDING";
            const label = statusLabels[rawStatus] || rawStatus;
            const color = statusColors[rawStatus] || "bg-gray-100 text-gray-800";

            const renderStr = (val, fb) => {
              if (typeof val === "string") return val;
              if (val && typeof val === "object") {
                return val.name || `${val.brand || ""} ${val.model || ""}`.trim() || val.licensePlate || val.title || val.garageName || fb;
              }
              return fb || "";
            };

            const srvText = renderStr(booking.serviceName || booking.service, "Dịch vụ rửa xe");
            const vehText = renderStr(booking.vehicle, "Xe khách hàng");
            const plateText = renderStr(booking.plate, "");
            const garText = renderStr(booking.garageName || booking.garage, "Gara WashMate");

            return (
              <Card key={booking.id || booking.bookingId || idx} className="rounded-2xl border border-border p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold leading-tight text-foreground">
                      {srvText}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                      <span className="font-semibold">{vehText} {plateText && plateText !== "Chưa cập nhật" ? `– ${plateText}` : ""}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {garText}
                      </div>
                    </div>
                  </div>
                  <Badge className={color}>{label}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Thời gian</p>
                    <p className="font-semibold leading-tight text-foreground">
                      {booking.bookingDate ? `${formatBookingDate(booking.bookingDate)} – ${booking.slotTime || ""}` : booking.dateTime || "Đang cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Thanh toán</p>
                    <p className="font-semibold leading-tight text-foreground">
                      {booking.finalAmount != null ? formatMoney(booking.finalAmount) : booking.amount || "0đ"}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/khach-hang/lich-dat/${booking.id || booking.bookingId}`)}
                      className="font-semibold text-primary hover:bg-secondary"
                    >
                      Xem chi tiết <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
