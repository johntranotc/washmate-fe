import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { garageApi } from "../../api/garageApi";
import { useAppStore } from "../../state/AppStore";

const vehicles = [
  { id: 1, name: "BMW X5", plate: "51A-12345" },
  { id: 2, name: "Toyota Vios", plate: "51B-67890" },
];

const services = [
  { id: 1, name: "Rửa xe cơ bản", price: 80000, duration: 30 },
  { id: 2, name: "Rửa xe cao cấp", price: 120000, duration: 45 },
  { id: 3, name: "Chăm sóc xe toàn diện", price: 250000, duration: 90 },
];

const slots = [
  { id: 1, time: "09:00", state: "CÒN CHỖ", note: "Còn 4/4 chỗ" },
  { id: 2, time: "10:30", state: "SẮP ĐẦY", note: "Còn 1/4 chỗ" },
  { id: 3, time: "12:00", state: "ĐÃ ĐẦY", note: "Còn 0/4 chỗ" },
  { id: 4, time: "13:30", state: "CÒN CHỖ", note: "Còn 3/4 chỗ" },
  { id: 5, time: "15:00", state: "CÒN CHỖ", note: "Còn 4/4 chỗ" },
  { id: 6, time: "16:30", state: "CÒN CHỖ", note: "Còn 2/4 chỗ" },
  { id: 7, time: "18:00", state: "CÒN CHỖ", note: "Còn 4/4 chỗ" },
  { id: 8, time: "19:30", state: "CÒN CHỖ", note: "Còn 4/4 chỗ" },
];

const days = [
  { label: "T2", day: 12 },
  { label: "T3", day: 13 },
  { label: "T4", day: 14 },
  { label: "T5", day: 15 },
  { label: "T6", day: 16 },
  { label: "T7", day: 17 },
  { label: "CN", day: 18 },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function BookingCreatePage() {
  const navigate = useNavigate();
  const { state, actions } = useAppStore();
  const [garages, setGarages] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);
  const [garageError, setGarageError] = useState("");
  const [garageId, setGarageId] = useState("");
  const [vehicleId, setVehicleId] = useState("1");
  const [serviceId, setServiceId] = useState("2");
  const [selectedDay, setSelectedDay] = useState(14);
  const [slotId, setSlotId] = useState(4);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchGarages() {
      try {
        setGarageLoading(true);
        setGarageError("");
        const data = await garageApi.getAll();
        const list = Array.isArray(data) && data.length ? data : state.garages.map(
          (garage) => ({ ...garage, garageId: garage.id }),
        );
        setGarages(list);
        if (list[0]?.garageId) {
          setGarageId(String(list[0].garageId));
        }
      } catch (error) {
        const fallback = state.garages.map((garage) => ({
          ...garage,
          garageId: garage.id,
        }));
        setGarages(fallback);
        setGarageId(String(fallback[0]?.garageId || ""));
        setGarageError("Không thể kết nối máy chủ. Hệ thống đang dùng dữ liệu dùng thử cục bộ.");
      } finally {
        setGarageLoading(false);
      }
    }

    fetchGarages();
  }, [state.garages]);

  const selectedGarage = useMemo(
    () => garages.find((garage) => garage.garageId === Number(garageId)),
    [garages, garageId],
  );
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === Number(vehicleId),
  );
  const selectedService = services.find(
    (service) => service.id === Number(serviceId),
  );
  const selectedSlot = slots.find((slot) => slot.id === slotId);

  function submitBooking() {
    setSubmitError("");
    try {
      const booking = actions.createBooking({
        garageId: Number(garageId),
        garageName: selectedGarage?.name || "Trung tâm chăm sóc xe",
        vehicleId: Number(vehicleId),
        vehicle: selectedVehicle?.name,
        plate: selectedVehicle?.plate,
        serviceId: Number(serviceId),
        serviceName: selectedService?.name,
        bookingDate: `2026-10-${String(selectedDay).padStart(2, "0")}`,
        slotTime: selectedSlot?.time,
        amount: selectedService?.price || 0,
        discount: 0,
        finalAmount: selectedService?.price || 0,
      });
      navigate(`/customer/bookings/${booking.id}/payment`);
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-[10px] font-extrabold text-blue-600">ĐẶT LỊCH</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          Bước 3: Chọn ngày và giờ
        </h1>
        <p className="mt-2 text-[11px] text-slate-500">
          Chọn khung giờ thuận tiện cho dịch vụ chăm sóc xe.
        </p>
      </header>

      {garageError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {garageError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-[9px] font-bold uppercase text-slate-500">
                Cơ sở
                <select
                  value={garageId}
                  disabled={garageLoading}
                  onChange={(event) => setGarageId(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">
                    {garageLoading ? "Đang tải..." : "Chọn cơ sở"}
                  </option>
                  {garages.map((garage) => (
                    <option key={garage.garageId} value={garage.garageId}>
                      {garage.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[9px] font-bold uppercase text-slate-500">
                Phương tiện
                <select
                  value={vehicleId}
                  onChange={(event) => setVehicleId(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} · {vehicle.plate}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[9px] font-bold uppercase text-slate-500">
                Gói dịch vụ
                <select
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-600">
                <CalendarDays size={17} className="text-blue-600" /> Tháng 10
                năm 2026
              </h2>
              <div className="flex gap-1">
                <button className="rounded p-2 text-slate-500 hover:bg-slate-100">
                  <ChevronLeft size={16} />
                </button>
                <button className="rounded p-2 text-slate-500 hover:bg-slate-100">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {days.map(({ label, day }) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                  }}
                  className={`rounded-lg py-3 text-center transition ${
                    selectedDay === day
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-50 text-slate-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="block text-[7px] font-bold opacity-70">
                    {label}
                  </span>
                  <strong className="mt-2 block text-xs">{day}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-extrabold">Khung giờ khả dụng</h2>
              <div className="text-[8px] font-semibold text-slate-500">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                Còn chỗ
                <span className="ml-4 mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                Sắp đầy
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {slots.map((slot) => {
                const selected = slot.id === slotId;
                const full = slot.state === "ĐÃ ĐẦY";
                return (
                  <button
                    key={slot.id}
                    disabled={full}
                    onClick={() => {
                      setSlotId(slot.id);
                    }}
                    className={`min-h-20 rounded-lg border p-3 text-left transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : slot.state === "SẮP ĐẦY"
                          ? "border-rose-200 bg-white"
                          : "border-blue-200 bg-white hover:border-blue-500"
                    } ${full ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <strong className="block text-[11px]">{slot.time}</strong>
                    <span
                      className={`mt-2 block text-[8px] font-extrabold ${
                        selected
                          ? "text-white"
                          : slot.state === "SẮP ĐẦY"
                            ? "text-rose-600"
                            : "text-blue-600"
                      }`}
                    >
                      {selected ? "ĐÃ CHỌN" : slot.state}
                    </span>
                    <small
                      className={`mt-1 block text-[7px] ${
                        selected ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {slot.note}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border-2 border-blue-300 bg-white p-5 shadow-lg shadow-slate-200/70">
          <h2 className="text-lg font-extrabold">Tóm tắt đặt lịch</h2>

          <div className="mt-5 flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600">
              <Car size={18} />
            </span>
            <div>
              <span className="text-[8px] font-bold uppercase text-slate-400">
                Phương tiện
              </span>
              <strong className="block text-xs">{selectedVehicle?.name}</strong>
              <p className="mt-1 text-[9px] text-slate-500">
                {selectedVehicle?.plate}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600">
              <Sparkles size={18} />
            </span>
            <div>
              <span className="text-[8px] font-bold uppercase text-slate-400">
                Gói dịch vụ
              </span>
              <strong className="block text-xs">
                {selectedService?.name}
              </strong>
              <p className="mt-1 text-[9px] text-slate-500">
                {selectedService?.duration} phút
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase text-slate-500">
                Khung giờ đã chọn
              </span>
              <span className="text-[8px] font-extrabold uppercase text-blue-600">
                Thay đổi
              </span>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[9px] text-slate-600">
              <CalendarDays size={12} /> Ngày {selectedDay} tháng 10 năm 2026
            </p>
            <p className="mt-2 flex items-center gap-2 text-[9px] text-slate-600">
              <Clock3 size={12} /> {selectedSlot?.time}
            </p>
            {selectedGarage && (
              <p className="mt-2 flex items-center gap-2 text-[9px] text-slate-600">
                <MapPin size={12} /> {selectedGarage.name}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
            <strong className="text-sm">Tổng cộng</strong>
            <strong className="text-xl text-blue-600">
              {formatCurrency(selectedService?.price || 0)}
            </strong>
          </div>

          <button
            type="button"
            onClick={submitBooking}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-[11px] font-extrabold text-white hover:bg-blue-700"
          >
            Tiếp tục thanh toán <ArrowRight size={16} />
          </button>
          {submitError && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[9px] font-semibold text-rose-700">
              {submitError}
            </p>
          )}
          <p className="mt-4 text-center text-[7px] leading-4 text-slate-400">
            Chưa thu tiền cho đến khi bạn xác nhận thanh toán. Bạn có thể hủy
            miễn phí trước giờ hẹn tối đa 2 giờ.
          </p>

        </aside>
      </div>
    </div>
  );
}

export default BookingCreatePage;

