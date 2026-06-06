import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockGarages = [
  {
    id: 1,
    name: "AutoWash Garage Quận 1",
    address: "123 Nguyễn Huệ, Quận 1",
  },
  {
    id: 2,
    name: "AutoWash Garage Thủ Đức",
    address: "45 Võ Văn Ngân, Thủ Đức",
  },
];

const mockVehicles = [
  {
    id: 1,
    licensePlate: "51A-12345",
    name: "Toyota Vios",
  },
  {
    id: 2,
    licensePlate: "51B-67890",
    name: "Honda City",
  },
];

const mockServices = [
  {
    id: 1,
    name: "Basic Wash",
    duration: 30,
    price: 80000,
  },
  {
    id: 2,
    name: "Premium Wash",
    duration: 45,
    price: 120000,
  },
  {
    id: 3,
    name: "Full Detailing",
    duration: 90,
    price: 250000,
  },
];

const mockSlots = [
  {
    id: 1,
    time: "08:00 - 08:30",
    available: true,
  },
  {
    id: 2,
    time: "09:00 - 09:30",
    available: true,
  },
  {
    id: 3,
    time: "10:00 - 10:30",
    available: false,
  },
  {
    id: 4,
    time: "14:00 - 14:30",
    available: true,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function BookingCreatePage() {
  const navigate = useNavigate();

  const [garageId, setGarageId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedGarage = mockGarages.find(
    (garage) => garage.id === Number(garageId),
  );
  const selectedVehicle = mockVehicles.find(
    (vehicle) => vehicle.id === Number(vehicleId),
  );
  const selectedService = mockServices.find(
    (service) => service.id === Number(serviceId),
  );
  const selectedSlot = mockSlots.find((slot) => slot.id === Number(slotId));

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Booking</h1>
        <p className="mt-2 text-slate-500">
          Tạo booking mới. Booking sẽ ở trạng thái PENDING cho đến khi payment
          PAID.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Business Rule:</strong> Không có Payment PAID thì không có
        Booking CONFIRMED.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Garage
            </label>
            <select
              value={garageId}
              onChange={(event) => setGarageId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            >
              <option value="">Chọn garage</option>
              {mockGarages.map((garage) => (
                <option key={garage.id} value={garage.id}>
                  {garage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
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
            <label className="block text-sm font-medium text-slate-700">
              Service Package
            </label>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Time Slot
              </label>
              <select
                value={slotId}
                onChange={(event) => setSlotId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              >
                <option value="">Chọn slot</option>
                {mockSlots.map((slot) => (
                  <option
                    key={slot.id}
                    value={slot.id}
                    disabled={!slot.available}
                  >
                    {slot.time} {slot.available ? "" : "- Full"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Promotion Code
            </label>
            <input
              value={promotionCode}
              onChange={(event) => setPromotionCode(event.target.value)}
              placeholder="Nhập mã nếu có, ví dụ: WASH10"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Mock hiện tại: nhập bất kỳ mã nào sẽ giảm 10.000đ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Booking Note
            </label>
            <textarea
              value={bookingNote}
              onChange={(event) => setBookingNote(event.target.value)}
              rows="3"
              placeholder="Ghi chú thêm cho garage nếu có"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Create Booking PENDING
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Garage</p>
              <p className="font-medium text-slate-900">
                {selectedGarage?.name || "Chưa chọn"}
              </p>
              {selectedGarage && (
                <p className="text-xs text-slate-500">
                  {selectedGarage.address}
                </p>
              )}
            </div>

            <div>
              <p className="text-slate-500">Vehicle</p>
              <p className="font-medium text-slate-900">
                {selectedVehicle
                  ? `${selectedVehicle.licensePlate} - ${selectedVehicle.name}`
                  : "Chưa chọn"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Service</p>
              <p className="font-medium text-slate-900">
                {selectedService?.name || "Chưa chọn"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Date & Slot</p>
              <p className="font-medium text-slate-900">
                {bookingDate || "Chưa chọn ngày"}{" "}
                {selectedSlot ? `• ${selectedSlot.time}` : ""}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Final Amount</span>
                <span>{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs text-slate-500">Initial Status</p>
              <p className="mt-1 font-bold text-amber-600">Booking: PENDING</p>
              <p className="font-bold text-amber-600">Payment: PENDING</p>
            </div>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-lg font-bold text-green-800">
            Booking mock created successfully
          </h2>
          <p className="mt-1 text-green-700">
            Booking đang ở trạng thái PENDING. Vui lòng chuyển sang trang
            Payment để xác nhận thanh toán.
          </p>

          <button
            onClick={goToPaymentPage}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
          >
            Go to Payment Page
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingCreatePage;
