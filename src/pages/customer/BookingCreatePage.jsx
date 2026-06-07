import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { garageApi } from "../../api/garageApi";

const mockVehicles = [
  {
    id: 1,
    licensePlate: "51A-12345",
    name: "Toyota Vios",
    status: "ACTIVE",
  },
  {
    id: 2,
    licensePlate: "51B-67890",
    name: "Honda City",
    status: "ACTIVE",
  },
];

const mockServices = [
  {
    id: 1,
    name: "Basic Wash",
    duration: 30,
    price: 80000,
    description: "Rửa ngoài cơ bản, phù hợp cho nhu cầu nhanh.",
  },
  {
    id: 2,
    name: "Premium Wash",
    duration: 45,
    price: 120000,
    description: "Rửa ngoài, vệ sinh nội thất nhẹ và chăm sóc bề mặt.",
  },
  {
    id: 3,
    name: "Full Detailing",
    duration: 90,
    price: 250000,
    description: "Gói chăm sóc xe chuyên sâu, thời lượng dài hơn.",
  },
];

const mockSlots = [
  {
    id: 1,
    time: "08:00 - 08:30",
    available: true,
    capacityText: "Còn 3 chỗ",
  },
  {
    id: 2,
    time: "09:00 - 09:30",
    available: true,
    capacityText: "Còn 2 chỗ",
  },
  {
    id: 3,
    time: "10:00 - 10:30",
    available: false,
    capacityText: "Đã đầy",
  },
  {
    id: 4,
    time: "14:00 - 14:30",
    available: true,
    capacityText: "Còn 4 chỗ",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-bold text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function StepBadge({ number, title, active = false }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
          active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {number}
      </span>
      <span className="text-sm font-bold">{title}</span>
    </div>
  );
}

function InfoRow({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-950">{value}</p>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function BookingCreatePage() {
  const navigate = useNavigate();

  const [garages, setGarages] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);
  const [garageError, setGarageError] = useState("");

  const [garageId, setGarageId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchGarages() {
      try {
        setGarageLoading(true);
        setGarageError("");

        const data = await garageApi.getAll();
        setGarages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("GET GARAGES ERROR:", error);
        setGarageError(
          error?.message ||
            "Không tải được danh sách garage. Vui lòng kiểm tra BE.",
        );
      } finally {
        setGarageLoading(false);
      }
    }

    fetchGarages();
  }, []);

  const selectedGarage = useMemo(
    () => garages.find((garage) => garage.garageId === Number(garageId)),
    [garages, garageId],
  );

  const selectedVehicle = useMemo(
    () => mockVehicles.find((vehicle) => vehicle.id === Number(vehicleId)),
    [vehicleId],
  );

  const selectedService = useMemo(
    () => mockServices.find((service) => service.id === Number(serviceId)),
    [serviceId],
  );

  const selectedSlot = useMemo(
    () => mockSlots.find((slot) => slot.id === Number(slotId)),
    [slotId],
  );

  const discountAmount = promotionCode.trim() ? 10000 : 0;
  const totalAmount = selectedService?.price || 0;
  const finalAmount = Math.max(totalAmount - discountAmount, 0);

  const canSubmit =
    garageId &&
    vehicleId &&
    serviceId &&
    bookingDate &&
    slotId &&
    selectedSlot?.available;

  function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitted(true);
  }

  function goToPaymentPage() {
    navigate("/customer/bookings/1/payment");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-6 py-7 text-white md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                Advance Booking
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Tạo đặt lịch rửa xe
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Khách hàng chọn garage, phương tiện, gói dịch vụ và slot.
                Booking mới sẽ ở trạng thái PENDING và chỉ được CONFIRMED sau
                khi Payment PAID.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Core rule
              </p>
              <p className="mt-1 text-sm font-bold leading-6">
                Payment PAID → Booking CONFIRMED
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 bg-slate-50 p-4 md:grid-cols-4">
          <StepBadge number="1" title="Chọn thông tin" active />
          <StepBadge number="2" title="Tạo PENDING" active={submitted} />
          <StepBadge number="3" title="Thanh toán" />
          <StepBadge number="4" title="Xác nhận" />
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm leading-6 text-amber-900">
          <span className="font-black">Business Rule:</span> Không có Payment
          PAID thì không có Booking CONFIRMED. Hiện tại Garage lấy từ API thật,
          còn Vehicle / Service / Slot vẫn dùng mock cho tới khi BE bổ sung đủ
          endpoint.
        </p>
      </section>

      {garageError && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm font-bold text-rose-700">Lỗi tải garage</p>
          <p className="mt-1 text-sm text-rose-600">{garageError}</p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"
        >
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Thông tin đặt lịch
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Điền đủ các trường bắt buộc để tạo booking mock.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600">
              Status: PENDING
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <FieldLabel required>Garage</FieldLabel>
              <select
                value={garageId}
                onChange={(event) => {
                  setGarageId(event.target.value);
                  setSubmitted(false);
                }}
                disabled={garageLoading}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {garageLoading ? "Đang tải garage..." : "Chọn garage"}
                </option>

                {garages.map((garage) => (
                  <option key={garage.garageId} value={garage.garageId}>
                    {garage.name} - {garage.address}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Dữ liệu garage đang lấy từ BE: GET /api/v1/garages.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel required>Vehicle</FieldLabel>
                <select
                  value={vehicleId}
                  onChange={(event) => {
                    setVehicleId(event.target.value);
                    setSubmitted(false);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Chọn xe</option>

                  {mockVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel required>Service Package</FieldLabel>
                <select
                  value={serviceId}
                  onChange={(event) => {
                    setServiceId(event.target.value);
                    setSubmitted(false);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Chọn gói rửa xe</option>

                  {mockServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)} -{" "}
                      {service.duration} phút
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedService && (
              <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-sm font-bold text-sky-900">
                  {selectedService.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-sky-700">
                  {selectedService.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel required>Booking Date</FieldLabel>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(event) => {
                    setBookingDate(event.target.value);
                    setSubmitted(false);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <FieldLabel required>Time Slot</FieldLabel>
                <select
                  value={slotId}
                  onChange={(event) => {
                    setSlotId(event.target.value);
                    setSubmitted(false);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Chọn slot</option>

                  {mockSlots.map((slot) => (
                    <option
                      key={slot.id}
                      value={slot.id}
                      disabled={!slot.available}
                    >
                      {slot.time} - {slot.capacityText}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>Promotion Code</FieldLabel>
              <input
                value={promotionCode}
                onChange={(event) => {
                  setPromotionCode(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="Nhập mã nếu có, ví dụ: WASH10"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <p className="mt-2 text-xs text-slate-500">
                Mock hiện tại: nhập bất kỳ mã nào sẽ giảm 10.000đ.
              </p>
            </div>

            <div>
              <FieldLabel>Booking Note</FieldLabel>
              <textarea
                value={bookingNote}
                onChange={(event) => setBookingNote(event.target.value)}
                rows="4"
                placeholder="Ghi chú thêm cho garage nếu có"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-13 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Create Booking PENDING
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <div className="sticky top-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                  Summary
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Booking Preview
                </h2>
              </div>

              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                PENDING
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow
                label="Garage"
                value={selectedGarage?.name || "Chưa chọn"}
                hint={selectedGarage?.address}
              />

              <InfoRow
                label="Vehicle"
                value={
                  selectedVehicle
                    ? `${selectedVehicle.licensePlate} - ${selectedVehicle.name}`
                    : "Chưa chọn"
                }
              />

              <InfoRow
                label="Service"
                value={selectedService?.name || "Chưa chọn"}
                hint={
                  selectedService
                    ? `${selectedService.duration} phút`
                    : undefined
                }
              />

              <InfoRow
                label="Date & Slot"
                value={
                  bookingDate
                    ? `${bookingDate}${selectedSlot ? ` • ${selectedSlot.time}` : ""}`
                    : "Chưa chọn ngày"
                }
                hint={selectedSlot?.capacityText}
              />
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-slate-950">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-bold text-emerald-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-black text-slate-950">
                      Final Amount
                    </span>
                    <span className="text-2xl font-black text-slate-950">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">Booking</p>
                <p className="mt-1 font-black text-amber-800">PENDING</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">Payment</p>
                <p className="mt-1 font-black text-amber-800">PENDING</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {submitted && (
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                Booking mock created
              </p>
              <h2 className="mt-2 text-2xl font-black text-emerald-950">
                Booking đã được tạo ở trạng thái PENDING
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-800">
                Tiếp theo cần chuyển sang trang Payment để mock thanh toán. Chỉ
                sau khi Payment PAID thì Booking mới được CONFIRMED.
              </p>
            </div>

            <button
              type="button"
              onClick={goToPaymentPage}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800"
            >
              Go to Payment Page
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default BookingCreatePage;
