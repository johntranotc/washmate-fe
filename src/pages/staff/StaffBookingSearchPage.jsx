import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useNavigate } from "react-router-dom";
import { staffApi } from "@/api/staffApi";
import { normalizeBookingList, normalizeStaffBooking } from "@/lib/staff-booking-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = {
    PENDING: "PENDING - Chờ xử lý",
    CONFIRMED: "CONFIRMED - Đã xác nhận",
    CHECKED_IN: "CHECKED_IN - Đã check-in",
    WASHING: "WASHING - Đang rửa xe",
    COMPLETED: "COMPLETED - Hoàn tất",
    CANCELLED: "CANCELLED - Đã hủy",
    NO_SHOW: "NO_SHOW - Không đến",
    PAID: "PAID - Đã thanh toán",
    NOT_ISSUED: "NOT_ISSUED - Chưa phát hành",
  };

  return labels[status] || status;
}

function StaffBookingSearchPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    staffApi.getTodayBookings()
      .then((data) => {
        setAllBookings(normalizeBookingList(data).map(normalizeStaffBooking));
      })
      .catch((error) => console.error("Failed to fetch search bookings:", error));
  }, []);

  const filteredBookings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return allBookings.filter((booking) => {
      const matchesKeyword =
        !normalizedKeyword ||
        (booking.code || "").toLowerCase().includes(normalizedKeyword) ||
        (booking.customerName || "").toLowerCase().includes(normalizedKeyword) ||
        (booking.phone || "").toLowerCase().includes(normalizedKeyword) ||
        (booking.plate || "").toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === "ALL" || booking.bookingStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, statusFilter, allBookings]);

  function goToWorkflow(bookingId) {
    navigate(`/staff/bookings/${bookingId}/workflow`);
  }

  function canProcessWorkflow(booking) {
    return (
      booking.paymentStatus === "PAID" &&
      ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(booking.bookingStatus)
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vận hành hôm nay"
        title="Tra cứu đặt lịch"
        description="Nhân viên tra cứu booking bằng mã đặt lịch, biển số xe hoặc số điện thoại."
      />

      <div className="rounded-xl border border-primary/20 bg-primary-container p-4 text-center text-sm text-primary-strong">
        <strong>Quy tắc nghiệp vụ:</strong> Staff chỉ được xử lý workflow khi
        booking đã CONFIRMED và payment đã PAID.
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-ink-soft">
              Từ khóa tra cứu
            </label>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập mã booking, biển số xe, số điện thoại hoặc tên khách hàng"
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft">
              Lọc theo trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-foreground"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">PENDING - Chờ xử lý</option>
              <option value="CONFIRMED">CONFIRMED - Đã xác nhận</option>
              <option value="CHECKED_IN">CHECKED_IN - Đã check-in</option>
              <option value="WASHING">WASHING - Đang rửa xe</option>
              <option value="COMPLETED">COMPLETED - Hoàn tất</option>
              <option value="CANCELLED">CANCELLED - Đã hủy</option>
              <option value="NO_SHOW">NO_SHOW - Không đến</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-surface p-4 text-center">
            <p className="text-sm text-muted-foreground">Tổng booking</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {allBookings.length}
            </p>
          </div>

          <div className="rounded-xl bg-success-container p-4 text-center">
            <p className="text-sm text-success">Đã thanh toán</p>
            <p className="mt-1 text-2xl font-bold text-success">
              {
                allBookings.filter(
                  (booking) => booking.paymentStatus === "PAID",
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-primary-container p-4 text-center">
            <p className="text-sm text-primary-strong">Đang xử lý</p>
            <p className="mt-1 text-2xl font-bold text-primary-strong">
              {
                allBookings.filter((booking) =>
                  ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(
                    booking.bookingStatus,
                  ),
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-warning-container p-4 text-center">
            <p className="text-sm text-warning">Chờ thanh toán</p>
            <p className="mt-1 text-2xl font-bold text-warning">
              {
                allBookings.filter(
                  (booking) => booking.paymentStatus === "PENDING",
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-bold text-foreground">
            Danh sách booking
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tìm thấy {filteredBookings.length} booking phù hợp.
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-lg font-bold text-foreground">
              Không tìm thấy booking phù hợp
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hãy thử tìm bằng mã booking, biển số xe hoặc số điện thoại khác.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBookings.map((booking) => {
              const allowWorkflow = canProcessWorkflow(booking);

              return (
                <div
                  key={booking.id}
                  className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {booking.code}
                      </h3>
                      <StatusBadge status={booking.bookingStatus} type="booking" size="sm" />
                    </div>

                    <p className="mt-2 font-semibold text-foreground">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      SĐT: {booking.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Xe: {booking.plate} - {booking.vehicle}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Lịch hẹn</p>
                    <p className="mt-1 font-bold text-foreground">
                      {booking.bookingDate}
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.slotTime}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {booking.garageName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Thanh toán</p>
                    <div className="mt-2">
                      <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />
                    </div>
                    <p className="mt-2 font-bold text-foreground">
                      {formatCurrency(booking.finalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hóa đơn: {getStatusLabel(booking.invoiceStatus)}
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-3">
                    <Button
                      onClick={() => goToWorkflow(booking.id)}
                      disabled={!allowWorkflow}
                    >
                      Xử lý workflow
                    </Button>

                    {!allowWorkflow && (
                      <p className="max-w-[180px] text-center text-xs text-critical">
                        Chỉ xử lý khi booking đã xác nhận và payment đã PAID.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffBookingSearchPage;
