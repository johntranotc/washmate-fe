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

function StatusBadge({ status }) {
  const statusClass =
    status === "PAID" || status === "CONFIRMED" || status === "COMPLETED"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "CHECKED_IN" || status === "WASHING"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : status === "CANCELLED" || status === "NO_SHOW"
          ? "bg-red-100 text-red-700 border-red-200"
          : status === "NOT_ISSUED"
            ? "bg-slate-100 text-slate-700 border-slate-200"
            : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
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
        <strong>Quy tắc nghiệp vụ:</strong> Staff chỉ được xử lý workflow khi
        booking đã CONFIRMED và payment đã PAID.
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Danh sách booking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tìm thấy {filteredBookings.length} booking phù hợp.
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Không tìm thấy booking phù hợp
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử tìm bằng mã booking, biển số xe hoặc số điện thoại khác.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredBookings.map((booking) => {
              const allowWorkflow = canProcessWorkflow(booking);

              return (
                <div
                  key={booking.bookingId}
                  className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {booking.bookingCode}
                      </h3>
                      <StatusBadge status={booking.bookingStatus} />
                    </div>

                    <p className="mt-2 font-semibold text-slate-900">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-slate-500">
                      SĐT: {booking.phone}
                    </p>
                    <p className="text-sm text-slate-500">
                      Xe: {booking.licensePlate} - {booking.vehicleName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Lịch hẹn</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {booking.bookingDate}
                    </p>
                    <p className="text-sm text-slate-500">{booking.slotTime}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {booking.garageName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Thanh toán</p>
                    <div className="mt-2">
                      <StatusBadge status={booking.paymentStatus} />
                    </div>
                    <p className="mt-2 font-bold text-slate-900">
                      {formatCurrency(booking.finalAmount)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Hóa đơn: {getStatusLabel(booking.invoiceStatus)}
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToWorkflow(booking.bookingId)}
                      disabled={!allowWorkflow}
                      className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Xử lý workflow
                    </button>

                    {!allowWorkflow && (
                      <p className="max-w-[180px] text-center text-xs text-red-500">
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
