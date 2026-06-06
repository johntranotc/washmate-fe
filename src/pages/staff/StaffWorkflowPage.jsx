import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialBooking = {
  bookingId: 1,
  bookingCode: "BK-0001",
  customerName: "Nguyễn Văn A",
  phone: "0900000000",
  garageName: "AutoWash Garage Thủ Đức",
  vehicle: "51A-12345 - Toyota Vios",
  serviceName: "Premium Wash",
  bookingDate: "2026-06-06",
  slotTime: "09:00 - 09:30",
  finalAmount: 110000,
  paymentStatus: "PAID",
  bookingStatus: "CONFIRMED",
  invoiceStatus: "PAID",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = {
    CONFIRMED: "CONFIRMED - Đã xác nhận",
    CHECKED_IN: "CHECKED_IN - Đã check-in",
    WASHING: "WASHING - Đang rửa xe",
    COMPLETED: "COMPLETED - Hoàn tất",
    PAID: "PAID - Đã thanh toán",
  };

  return labels[status] || status;
}

function StatusBadge({ status }) {
  const statusClass =
    status === "COMPLETED"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "WASHING"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : status === "CHECKED_IN"
          ? "bg-purple-100 text-purple-700 border-purple-200"
          : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function TimelineStep({ title, description, time, active }) {
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

function StaffWorkflowPage() {
  const navigate = useNavigate();

  const [bookingStatus, setBookingStatus] = useState(
    initialBooking.bookingStatus,
  );
  const [checkinTime, setCheckinTime] = useState("");
  const [serviceStartTime, setServiceStartTime] = useState("");
  const [completedTime, setCompletedTime] = useState("");
  const [incidentNote, setIncidentNote] = useState("");
  const [staffNote, setStaffNote] = useState("");

  const canCheckIn =
    bookingStatus === "CONFIRMED" && initialBooking.paymentStatus === "PAID";

  const canStartWashing = bookingStatus === "CHECKED_IN";

  const canComplete = bookingStatus === "WASHING";

  const isCompleted = bookingStatus === "COMPLETED";

  function getNow() {
    return new Date().toLocaleString("vi-VN");
  }

  function handleCheckIn() {
    setBookingStatus("CHECKED_IN");
    setCheckinTime(getNow());
  }

  function handleStartWashing() {
    setBookingStatus("WASHING");
    setServiceStartTime(getNow());
  }

  function handleCompleteService() {
    setBookingStatus("COMPLETED");
    setCompletedTime(getNow());
  }

  function goToBookingDetail() {
    navigate(`/customer/bookings/${initialBooking.bookingId}`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Quy trình xử lý dịch vụ
        </h1>
        <p className="mt-2 text-slate-500">
          Staff chỉ được check-in khi Booking CONFIRMED và Payment PAID.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-800">
        <strong>Quy tắc nghiệp vụ:</strong> Không được check-in booking nếu chưa
        CONFIRMED hoặc payment chưa PAID.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {initialBooking.bookingCode}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Booking đã thanh toán và đang chờ staff xử lý.
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Trạng thái hiện tại</p>
                <div className="mt-2">
                  <StatusBadge status={bookingStatus} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khách hàng</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.customerName}
                </p>
                <p className="text-sm text-slate-500">{initialBooking.phone}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Cửa hàng</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.garageName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Phương tiện</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.vehicle}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Gói dịch vụ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.serviceName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ngày đặt lịch</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.bookingDate}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Khung giờ</p>
                <p className="mt-1 font-bold text-slate-900">
                  {initialBooking.slotTime}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Thao tác của nhân viên
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={!canCheckIn}
                className="rounded-xl bg-purple-700 px-4 py-3 font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Check-in khách
              </button>

              <button
                type="button"
                onClick={handleStartWashing}
                disabled={!canStartWashing}
                className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Bắt đầu rửa xe
              </button>

              <button
                type="button"
                onClick={handleCompleteService}
                disabled={!canComplete}
                className="rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Hoàn tất dịch vụ
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Ghi chú của nhân viên
              </p>
              <textarea
                value={staffNote}
                onChange={(event) => setStaffNote(event.target.value)}
                rows="3"
                placeholder="Ví dụ: Khách đến đúng giờ, xe cần vệ sinh kỹ phần nội thất..."
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Ghi nhận sự cố nếu có
              </p>
              <textarea
                value={incidentNote}
                onChange={(event) => setIncidentNote(event.target.value)}
                rows="3"
                placeholder="Ví dụ: Xe có vết trầy trước khi rửa, khách yêu cầu xử lý thêm..."
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            {isCompleted && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <h3 className="font-bold text-green-800">
                  Dịch vụ đã hoàn tất
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Booking đã COMPLETED và Payment đã PAID. Hệ thống có thể kích
                  hoạt Loyalty Earn cho khách hàng.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Timeline xử lý</h2>

            <div className="mt-6">
              <TimelineStep
                title="Booking đã xác nhận"
                description="Booking được CONFIRMED sau khi payment PAID."
                time="06/06/2026 09:36"
                active
              />

              <TimelineStep
                title="Check-in khách"
                description="Nhân viên xác nhận khách đã đến garage."
                time={checkinTime}
                active={Boolean(checkinTime)}
              />

              <TimelineStep
                title="Bắt đầu rửa xe"
                description="Nhân viên chuyển booking sang WASHING."
                time={serviceStartTime}
                active={Boolean(serviceStartTime)}
              />

              <TimelineStep
                title="Hoàn tất dịch vụ"
                description="Nhân viên hoàn tất dịch vụ, booking chuyển sang COMPLETED."
                time={completedTime}
                active={Boolean(completedTime)}
              />

              <TimelineStep
                title="Xét cộng điểm loyalty"
                description="Chỉ xét cộng điểm khi booking COMPLETED và payment PAID."
                time={isCompleted ? completedTime : ""}
                active={isCompleted}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Kiểm tra điều kiện
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Booking
                </span>
                <StatusBadge status={bookingStatus} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Payment
                </span>
                <StatusBadge status={initialBooking.paymentStatus} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-600">
                  Invoice
                </span>
                <StatusBadge status={initialBooking.invoiceStatus} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Thanh toán
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền đã thanh toán</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(initialBooking.finalAmount)}
                </span>
              </div>

              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-sm text-green-700">
                  Payment đã PAID nên Staff được phép xử lý workflow.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Hành động tiếp theo
            </h2>

            {!isCompleted ? (
              <p className="mt-3 text-sm text-slate-500">
                Thực hiện lần lượt: Check-in khách → Bắt đầu rửa xe → Hoàn tất
                dịch vụ.
              </p>
            ) : (
              <p className="mt-3 text-sm text-green-700">
                Booking đã hoàn tất. Có thể quay lại chi tiết đặt lịch để kiểm
                tra trạng thái.
              </p>
            )}

            <button
              type="button"
              onClick={goToBookingDetail}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Quay lại chi tiết đặt lịch
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default StaffWorkflowPage;
