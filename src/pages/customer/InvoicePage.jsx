import { useNavigate } from "react-router-dom";

const mockInvoice = {
  invoiceId: 1,
  invoiceCode: "INV-0001",
  bookingId: 1,
  bookingCode: "BK-0001",
  garageName: "AutoWash Garage Thủ Đức",
  garageAddress: "45 Võ Văn Ngân, Thủ Đức",
  customerName: "Nguyễn Văn A",
  vehicle: "51A-12345 - Toyota Vios",
  serviceName: "Premium Wash",
  bookingDate: "2026-06-06",
  slotTime: "09:00 - 09:30",
  paymentMethod: "CASH",
  paymentStatus: "PAID",
  invoiceStatus: "PAID",
  issuedAt: "06/06/2026 09:35",
  paidAt: "06/06/2026 09:36",
  subtotal: 120000,
  discount: 10000,
  penaltyTotal: 0,
  totalAmount: 110000,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = {
    PAID: "PAID - Đã thanh toán",
    ISSUED: "ISSUED - Đã phát hành",
    CANCELLED: "CANCELLED - Đã hủy",
    REFUNDED: "REFUNDED - Đã hoàn tiền",
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
    status === "PAID"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "REFUNDED"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function InvoicePage() {
  const navigate = useNavigate();

  function goToBookingDetail() {
    navigate(`/customer/bookings/${mockInvoice.bookingId}`);
  }

  function goToPayment() {
    navigate(`/customer/bookings/${mockInvoice.bookingId}/payment`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Hóa đơn thanh toán
        </h1>
        <p className="mt-2 text-slate-500">
          Hóa đơn được phát hành sau khi payment PAID và booking được xác nhận.
        </p>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
        <strong>Trạng thái hợp lệ:</strong> Invoice PAID chỉ được tạo từ payment
        cùng booking và cùng garage.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  AutoWash Pro
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mockInvoice.garageName}
                </p>
                <p className="text-sm text-slate-500">
                  {mockInvoice.garageAddress}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Mã hóa đơn</p>
                <p className="text-xl font-bold text-slate-900">
                  {mockInvoice.invoiceCode}
                </p>
                <div className="mt-2">
                  <StatusBadge status={mockInvoice.invoiceStatus} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khách hàng</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.customerName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Phương tiện</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.vehicle}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Mã đặt lịch</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.bookingCode}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Gói dịch vụ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.serviceName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ngày đặt lịch</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.bookingDate}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khung giờ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {mockInvoice.slotTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Chi tiết thanh toán
            </h2>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      Tạm tính dịch vụ
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(mockInvoice.subtotal)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      Giảm giá / khuyến mãi
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      -{formatCurrency(mockInvoice.discount)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      Phí phát sinh
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(mockInvoice.penaltyTotal)}
                    </td>
                  </tr>

                  <tr className="bg-slate-50">
                    <td className="px-4 py-4 text-lg font-bold text-slate-900">
                      Tổng thanh toán
                    </td>
                    <td className="px-4 py-4 text-right text-lg font-bold text-slate-900">
                      {formatCurrency(mockInvoice.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Công thức: Tổng thanh toán = Tạm tính - Giảm giá + Phí phát sinh.
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Tóm tắt hóa đơn
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trạng thái hóa đơn</span>
                <StatusBadge status={mockInvoice.invoiceStatus} />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trạng thái thanh toán</span>
                <StatusBadge status={mockInvoice.paymentStatus} />
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phương thức</span>
                <span className="font-bold text-slate-900">
                  {getPaymentMethodLabel(mockInvoice.paymentMethod)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Đã thanh toán</span>
                  <span>{formatCurrency(mockInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Mốc thời gian
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Thời điểm phát hành</p>
                <p className="font-bold text-slate-900">
                  {mockInvoice.issuedAt}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Thời điểm thanh toán</p>
                <p className="font-bold text-slate-900">{mockInvoice.paidAt}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Hành động tiếp theo
            </h2>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={goToBookingDetail}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
              >
                Xem chi tiết đặt lịch
              </button>

              <button
                type="button"
                onClick={goToPayment}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Quay lại thanh toán
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default InvoicePage;
