import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockBookings = [
  {
    bookingId: 1,
    bookingCode: "BK-0001",
    customerName: "Nguyễn Văn A",
    phone: "0900000000",
    licensePlate: "51A-12345",
    vehicleName: "Toyota Vios",
    garageName: "AutoWash Garage Thủ Đức",
    serviceName: "Premium Wash",
    bookingDate: "2026-06-06",
    slotTime: "09:00 - 09:30",
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    invoiceStatus: "PAID",
    finalAmount: 110000,
  },
  {
    bookingId: 2,
    bookingCode: "BK-0002",
    customerName: "Trần Minh B",
    phone: "0911111111",
    licensePlate: "59C-88888",
    vehicleName: "Honda City",
    garageName: "AutoWash Garage Thủ Đức",
    serviceName: "Basic Wash",
    bookingDate: "2026-06-06",
    slotTime: "10:00 - 10:30",
    bookingStatus: "PENDING",
    paymentStatus: "PENDING",
    invoiceStatus: "NOT_ISSUED",
    finalAmount: 80000,
  },
  {
    bookingId: 3,
    bookingCode: "BK-0003",
    customerName: "Lê Hoàng C",
    phone: "0922222222",
    licensePlate: "60A-99999",
    vehicleName: "Mazda 3",
    garageName: "AutoWash Garage Quận 1",
    serviceName: "Full Detailing",
    bookingDate: "2026-06-06",
    slotTime: "14:00 - 15:30",
    bookingStatus: "WASHING",
    paymentStatus: "PAID",
    invoiceStatus: "PAID",
    finalAmount: 250000,
  },
  {
    bookingId: 4,
    bookingCode: "BK-0004",
    customerName: "Phạm Quốc D",
    phone: "0933333333",
    licensePlate: "51B-67890",
    vehicleName: "Kia K3",
    garageName: "AutoWash Garage Thủ Đức",
    serviceName: "Premium Wash",
    bookingDate: "2026-06-06",
    slotTime: "15:00 - 15:45",
    bookingStatus: "COMPLETED",
    paymentStatus: "PAID",
    invoiceStatus: "PAID",
    finalAmount: 120000,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã check-in",
    WASHING: "Đang rửa xe",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
    PAID: "Đã thanh toán",
    NOT_ISSUED: "Chưa phát hành",
  };

  return labels[status] || status;
}

function StatusBadge({ status }) {
  const statusClass =
    status === "PAID" || status === "CONFIRMED" || status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "CHECKED_IN" || status === "WASHING"
        ? "bg-blue-100 text-blue-700"
        : status === "CANCELLED" || status === "NO_SHOW"
          ? "bg-rose-100 text-rose-700"
          : status === "NOT_ISSUED"
            ? "bg-slate-100 text-slate-600"
            : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1.5 text-[10px] font-extrabold ${statusClass}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function StaffBookingSearchPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBookings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return mockBookings.filter((booking) => {
      const matchesKeyword =
        !normalizedKeyword ||
        booking.bookingCode.toLowerCase().includes(normalizedKeyword) ||
        booking.customerName.toLowerCase().includes(normalizedKeyword) ||
        booking.phone.toLowerCase().includes(normalizedKeyword) ||
        booking.licensePlate.toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === "ALL" || booking.bookingStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, statusFilter]);

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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Tra cứu đặt lịch</h1>
        <p className="mt-2 text-slate-500">
          Nhân viên tra cứu booking bằng mã đặt lịch, biển số xe hoặc số điện
          thoại.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-800">
        <strong>Quy tắc nghiệp vụ:</strong> Chỉ được xử lý quy trình khi lịch đã được xác nhận và đã thanh toán.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Từ khóa tra cứu
            </label>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập mã booking, biển số xe, số điện thoại hoặc tên khách hàng"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Lọc theo trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="WASHING">Đang rửa xe</option>
              <option value="COMPLETED">Hoàn tất</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="NO_SHOW">Không đến</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">Tổng booking</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {mockBookings.length}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700">Đã thanh toán</p>
            <p className="mt-1 text-2xl font-bold text-green-800">
              {
                mockBookings.filter(
                  (booking) => booking.paymentStatus === "PAID",
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-700">Đang xử lý</p>
            <p className="mt-1 text-2xl font-bold text-blue-800">
              {
                mockBookings.filter((booking) =>
                  ["CONFIRMED", "CHECKED_IN", "WASHING"].includes(
                    booking.bookingStatus,
                  ),
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-700">Chờ thanh toán</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {
                mockBookings.filter(
                  (booking) => booking.paymentStatus === "PENDING",
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="border-b border-slate-200 p-5 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">
            Danh sách booking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tìm thấy {filteredBookings.length} booking phù hợp.
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Không tìm thấy booking phù hợp
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử tìm bằng mã booking, biển số xe hoặc số điện thoại khác.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="hidden sm:grid text-[11px] uppercase font-bold text-slate-400 tracking-wider sm:grid-cols-[1.7fr_1.1fr_1.2fr_1.2fr_1.2fr] divide-x divide-slate-100 px-2">
              <span className="px-4 py-3">Booking / Khách</span>
              <span className="px-4 py-3 text-center">Lịch hẹn</span>
              <span className="px-4 py-3 text-center">Thanh toán</span>
              <span className="px-4 py-3 text-center">Gara</span>
              <span className="px-4 py-3 text-center">Thao tác</span>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {filteredBookings.map((booking) => {
                const allowWorkflow = canProcessWorkflow(booking);

                return (
                  <article
                    key={booking.bookingId}
                    className="grid sm:grid-cols-[1.7fr_1.1fr_1.2fr_1.2fr_1.2fr] items-stretch bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 min-w-0 flex flex-col">
                      <b className="text-sm text-blue-600 block mb-1">{booking.bookingCode}</b>
                      <p className="text-sm font-bold truncate">{booking.customerName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{booking.phone}</p>
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {booking.vehicleName} · {booking.licensePlate}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{booking.serviceName}</p>
                    </div>

                    <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Lịch hẹn</p>
                      <p className="font-bold text-sm">{booking.bookingDate}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{booking.slotTime}</p>
                    </div>

                    <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Thanh toán</p>
                      <div>
                        <StatusBadge status={booking.paymentStatus} />
                      </div>
                      <p className="text-sm font-bold mt-1.5">{formatCurrency(booking.finalAmount)}</p>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">HĐ: {getStatusLabel(booking.invoiceStatus)}</p>
                    </div>

                    <div className="p-4 sm:p-5 min-w-0 flex flex-col items-center text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 sm:hidden">Gara</p>
                      <div>
                        <StatusBadge status={booking.bookingStatus} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 truncate">{booking.garageName}</p>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col items-center text-center">
                      <button
                        type="button"
                        onClick={() => goToWorkflow(booking.bookingId)}
                        disabled={!allowWorkflow}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
                      >
                        Xử lý quy trình
                      </button>

                      {!allowWorkflow && (
                        <p className="w-full text-center text-[10px] text-amber-600 leading-tight mt-2 px-1">
                          Chỉ xử lý khi lịch đã xác nhận và đã thanh toán.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffBookingSearchPage;
