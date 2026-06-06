import { useNavigate } from "react-router-dom";

const mockBookingDetail = {
  bookingId: 1,
  bookingCode: "BK-0001",

  customerName: "Nguyễn Văn A",
  phone: "0900000000",

  garageName: "AutoWash Garage Thủ Đức",
  garageAddress: "45 Võ Văn Ngân, Thủ Đức",

  vehicle: "51A-12345 - Toyota Vios",
  serviceName: "Premium Wash",
  bookingDate: "2026-06-06",
  slotTime: "09:00 - 09:30",

  totalAmount: 120000,
  discountAmount: 10000,
  finalAmount: 110000,

  bookingStatus: "CONFIRMED",
  paymentStatus: "PAID",
  invoiceStatus: "PAID",
  serviceStatus: "WAITING_CHECK_IN",

  createdAt: "06/06/2026 09:20",
  confirmedAt: "06/06/2026 09:36",
  checkinTime: null,
  serviceStartTime: null,
  completedTime: null,

  paymentMethod: "CASH",
  transactionCode: "TXN-1750000000000",
  invoiceCode: "INV-0001",
};

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
    WAITING_CHECK_IN: "WAITING_CHECK_IN - Chờ check-in",
  };

  return labels[status] || status;
}

function getPaymentMethodLabel(method) {
  const labels = {
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản",
    CARD: "Thẻ ngân hàng",
    MOMO: "MoMo",
    VNPAY: "VNPay",
  };

  return labels[method] || method;
}

function StatusBadge({ status }) {
  const statusClass =
    status === "PAID" || status === "CONFIRMED" || status === "COMPLETED"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "CHECKED_IN" || status === "WASHING"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : status === "WAITING_CHECK_IN"
          ? "bg-purple-100 text-purple-700 border-purple-200"
          : status === "CANCELLED" || status === "NO_SHOW"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function TimelineItem({ title, time, active, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`h-4 w-4 rounded-full border ${
            active
              ? "border-green-600 bg-green-600"
              : "border-slate-300 bg-white"
          }`}
        />
        <div className="h-full w-px bg-slate-200" />
      </div>

      <div className="pb-5">
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {time || "Chưa ghi nhận"}
        </p>
      </div>
    </div>
  );
}

function BookingDetailPage() {
  const navigate = useNavigate();

  function goToPayment() {
    navigate(`/customer/bookings/${mockBookingDetail.bookingId}/payment`);
  }

  function goToInvoice() {
    navigate(`/customer/bookings/${mockBookingDetail.bookingId}/invoice`);
  }

  function goToStaffWorkflowDemo() {
    navigate(`/staff/bookings/${mockBookingDetail.bookingId}/workflow`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Chi tiết đặt lịch</h1>
        <p className="mt-2 text-slate-500">
          Theo dõi trạng thái booking, thanh toán, hóa đơn và tiến trình rửa xe.
        </p>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
        <strong>Luồng hiện tại:</strong> Payment đã PAID nên Booking đã được
        CONFIRMED. Bước tiếp theo là Staff check-in và xử lý dịch vụ.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {mockBookingDetail.bookingCode}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mã đặt lịch của khách hàng
                </p>
              </div>

              <div className="space-y-2 text-left md:text-right">
                <p className="text-sm text-slate-500">Trạng thái đặt lịch</p>
                <StatusBadge status={mockBookingDetail.bookingStatus} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khách hàng</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.customerName}
                </p>
                <p className="text-sm text-slate-500">
                  {mockBookingDetail.phone}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Cửa hàng</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.garageName}
                </p>
                <p className="text-sm text-slate-500">
                  {mockBookingDetail.garageAddress}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Phương tiện</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.vehicle}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Gói dịch vụ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.serviceName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ngày đặt lịch</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.bookingDate}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khung giờ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockBookingDetail.slotTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Tiến trình dịch vụ
            </h2>

            <div className="mt-6">
              <TimelineItem
                title="Tạo booking"
                description="Khách hàng tạo booking ở trạng thái PENDING."
                time={mockBookingDetail.createdAt}
                active
              />

              <TimelineItem
                title="Thanh toán thành công"
                description="Payment chuyển sang PAID."
                time={mockBookingDetail.confirmedAt}
                active
              />

              <TimelineItem
                title="Booking được xác nhận"
                description="Booking chuyển từ PENDING sang CONFIRMED sau khi payment PAID."
                time={mockBookingDetail.confirmedAt}
                active
              />

              <TimelineItem
                title="Check-in tại garage"
                description="Staff chỉ được check-in khi booking CONFIRMED và payment PAID."
                time={mockBookingDetail.checkinTime}
                active={Boolean(mockBookingDetail.checkinTime)}
              />

              <TimelineItem
                title="Bắt đầu rửa xe"
                description="Staff chuyển trạng thái sang WASHING khi bắt đầu dịch vụ."
                time={mockBookingDetail.serviceStartTime}
                active={Boolean(mockBookingDetail.serviceStartTime)}
              />

              <TimelineItem
                title="Hoàn tất dịch vụ"
                description="Sau khi COMPLETED, hệ thống mới xét cộng điểm loyalty nếu payment PAID."
                time={mockBookingDetail.completedTime}
                active={Boolean(mockBookingDetail.completedTime)}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Tổng quan trạng thái
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Đặt lịch
                </span>
                <StatusBadge status={mockBookingDetail.bookingStatus} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Thanh toán
                </span>
                <StatusBadge status={mockBookingDetail.paymentStatus} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Hóa đơn
                </span>
                <StatusBadge status={mockBookingDetail.invoiceStatus} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Dịch vụ
                </span>
                <StatusBadge status={mockBookingDetail.serviceStatus} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Tóm tắt thanh toán
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium">
                  {formatCurrency(mockBookingDetail.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Giảm giá</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(mockBookingDetail.discountAmount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Đã thanh toán</span>
                  <span>{formatCurrency(mockBookingDetail.finalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Phương thức</p>
              <p className="mt-1 font-bold text-slate-900">
                {getPaymentMethodLabel(mockBookingDetail.paymentMethod)}
              </p>

              <p className="mt-3 text-slate-500">Mã giao dịch</p>
              <p className="mt-1 font-bold text-slate-900">
                {mockBookingDetail.transactionCode}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Hành động tiếp theo
            </h2>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={goToInvoice}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
              >
                Xem hóa đơn
              </button>

              <button
                type="button"
                onClick={goToPayment}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Quay lại thanh toán
              </button>

              <button
                type="button"
                onClick={goToStaffWorkflowDemo}
                className="w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
              >
                Xem demo Staff Workflow
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BookingDetailPage;
