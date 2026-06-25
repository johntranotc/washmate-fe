import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleApi } from "@/api/vehicleApi";
import { servicePackageApi } from "@/api/servicePackageApi";
import { garageApi } from "@/api/garageApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { bookingApi } from "@/api/bookingApi";
import { BookingStepper } from "@/components/customer/booking/BookingStepper";
import { StepError, StepLoading } from "@/components/customer/booking/BookingStates";
import { VehicleStep } from "@/components/customer/booking/VehicleStep";
import { ServiceStep } from "@/components/customer/booking/ServiceStep";
import { GarageStep } from "@/components/customer/booking/GarageStep";
import { SlotStep } from "@/components/customer/booking/SlotStep";
import { BookingReviewStep } from "@/components/customer/booking/BookingReviewStep";
import { BookingSuccessStep } from "@/components/customer/booking/BookingSuccessStep";
import {
  asList,
  bookingErrorMessage,
  getGarageId,
  nextDates,
  normalizeBookingResponse,
  normalizeBookingDate,
  normalizeGarage,
  normalizeService,
  normalizeSlot,
  normalizeVehicle,
} from "@/lib/booking-flow";


// Step order: 1=Gara, 2=Service, 3=Vehicle, 4=Slot, 5=Review, 6=Success

export default function CustomerBookingFlowPage() {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [garages, setGarages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selection, setSelection] = useState({
    garage: null,
    service: null,
    vehicle: null,
    date: nextDates()[0].value,
    slot: null,
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const loadFoundationData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [vehicleResult, serviceResult, garageResult] = await Promise.allSettled([
        vehicleApi.getMyVehicles(),
        servicePackageApi.getAll(),
        garageApi.getAll(),
      ]);

      const apiVehicles = vehicleResult.status === "fulfilled" ? asList(vehicleResult.value).map(normalizeVehicle).filter((v) => v.status === "ACTIVE") : [];
      const apiServices = serviceResult.status === "fulfilled" ? asList(serviceResult.value).map(normalizeService).filter((s) => s.status === "ACTIVE") : [];
      const apiGarages = garageResult.status === "fulfilled" ? asList(garageResult.value).map(normalizeGarage).filter((g) => g.status === "ACTIVE") : [];
      setVehicles(apiVehicles);
      setAllServices(apiServices);
      setGarages(apiGarages);

      if (!apiGarages.length) {
        setLoadError("Không thể tải danh sách gara.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoundationData();
  }, [loadFoundationData]);

  // Services filtered for the selected garage
  const servicesForGarage = useMemo(() => {
    if (!selection.garage) return [];
    const garageId = getGarageId(selection.garage);

    // From API: filter by garageId or show all if API doesn't have garageId on services
    const filtered = allServices.filter(
      (s) => !s.garageId || String(s.garageId) === String(garageId),
    );
    return filtered.length ? filtered : allServices;
  }, [allServices, selection.garage]);

  // Load slots when garage + date change
  useEffect(() => {
    if (!selection.garage || !selection.date) {
      setSlots([]);
      return;
    }
    let active = true;
    async function loadSlots() {
      const garageId = getGarageId(selection.garage);
      setSlotLoading(true);
      setSelection((cur) => ({ ...cur, slot: null }));
      if (!garageId) {
        setSlots([]);
        setSlotLoading(false);
        return;
      }
      try {

        const data = await bookingSlotApi.getAvailable({ garageId, date: selection.date });
        const normalized = asList(data)
          .map(normalizeSlot)
          .filter((slot) => !slot.garageId || String(slot.garageId) === String(garageId));
        if (active) setSlots(normalized);
      } catch {
        if (active) setSlots([]);
      } finally {
        if (active) setSlotLoading(false);
      }
    }
    loadSlots();
    return () => { active = false; };
  }, [selection.date, selection.garage]);

  function selectGarage(garage) {
    setSelection((cur) => ({
      ...cur,
      garage,
      service: null, // clear service when garage changes
      slot: null,
    }));
  }

  function selectService(service) {
    setSelection((cur) => ({ ...cur, service, slot: null }));
  }

  function canContinue() {
    if (step === 1) return Boolean(selection.garage) && Boolean(selection.garage.isOpen);
    if (step === 2) return Boolean(selection.service);
    if (step === 3) return Boolean(selection.vehicle);
    if (step === 4) return Boolean(selection.date && selection.slot && !selection.slot.disabled);
    return true;
  }

  function goNext() {
    setSubmitError("");
    if (!canContinue()) {
      if (step === 1 && selection.garage && !selection.garage.isOpen) {
        setSubmitError("Gara này đang tạm đóng. Vui lòng chọn gara khác.");
      } else {
        setSubmitError("Vui lòng chọn đầy đủ thông tin trước khi tiếp tục.");
      }
      return;
    }
    setStep((cur) => Math.min(cur + 1, 5));
  }

  async function createBooking() {
    if (!selection.garage || !selection.service || !selection.vehicle || !selection.slot) {
      setSubmitError("Vui lòng chọn đầy đủ thông tin đặt lịch.");
      return;
    }
    const bookingDate = normalizeBookingDate(selection.slot.slotDate || selection.date);
    if (!bookingDate) {
      setSubmitError("Vui lòng chọn ngày đặt lịch.");
      return;
    }
    const garageId = getGarageId(selection.garage);
    if (!garageId) {
      setSubmitError("Không tìm thấy gara hợp lệ. Vui lòng tải lại danh sách gara.");
      return;
    }
    if (selection.slot.disabled) {
      setSubmitError("Khung giờ này đã đầy hoặc tạm đóng.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      vehicleId: selection.vehicle.id,
      serviceId: selection.service.id,
      garageId,
      slotId: selection.slot.id,
      bookingDate,
      bookingNote: note.trim(),
    };



    try {
      const response = await bookingApi.createBooking(payload);
      const normalizedResult = normalizeBookingResponse(response);
      setResult({
        ...normalizedResult,
        bookingStatus: "PENDING_STAFF_CONFIRMATION",
      });
      setStep(6);
    } catch (error) {
      setSubmitError(bookingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function content() {
    if (loading) return <StepLoading />;
    if (loadError) return <StepError message={loadError} onRetry={loadFoundationData} />;

    // Step 1: Chọn gara
    if (step === 1) {
      return (
        <GarageStep
          garages={garages}
          selectedId={getGarageId(selection.garage)}
          onSelect={selectGarage}
        />
      );
    }
    // Step 2: Chọn dịch vụ (theo gara)
    if (step === 2) {
      return (
        <ServiceStep
          services={servicesForGarage}
          selectedId={selection.service?.id}
          onSelect={selectService}
          garageName={selection.garage?.name}
        />
      );
    }
    // Step 3: Chọn xe
    if (step === 3) {
      return (
        <VehicleStep
          vehicles={vehicles}
          selectedId={selection.vehicle?.id}
          onSelect={(vehicle) => setSelection((cur) => ({ ...cur, vehicle }))}
        />
      );
    }
    // Step 4: Chọn ngày & khung giờ
    if (step === 4) {
      return (
        <SlotStep
          date={selection.date}
          onDateChange={(date) => setSelection((cur) => ({ ...cur, date, slot: null }))}
          slots={slots}
          selectedId={selection.slot?.id}
          onSelect={(slot) => setSelection((cur) => ({ ...cur, slot }))}
          loading={slotLoading}
        />
      );
    }
    // Step 5: Xác nhận
    if (step === 5) {
      return <BookingReviewStep selection={selection} note={note} onNoteChange={setNote} />;
    }
    // Step 6: Hoàn tất
    return <BookingSuccessStep result={result} selection={selection} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
            Đặt lịch thông minh
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Đặt lịch rửa xe
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Chọn gara, dịch vụ, xe và khung giờ phù hợp. Gara sẽ xác nhận lịch hẹn trong thời gian sớm nhất.
          </p>
        </div>
        <Link
          to="/khach-hang"
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground shadow-sm"
        >
          <ArrowLeft size={17} /> Quay lại
        </Link>
      </header>

      <BookingStepper currentStep={step} />



      {submitError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {submitError}
        </div>
      )}

      {content()}

      {step < 6 && !loading && !loadError && (
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setSubmitError("");
              setStep((cur) => Math.max(1, cur - 1));
            }}
            disabled={step === 1 || submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)]"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={createBooking}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)] disabled:opacity-60"
            >
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lịch"}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
