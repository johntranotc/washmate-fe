import { useState } from "react";
import { Car, Droplets, MapPin, Clock, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const steps = ["Chọn xe", "Chọn dịch vụ", "Chọn gara", "Chọn khung giờ"];

const vehicles = [
  { id: 1, brand: "Toyota", model: "Vios", plate: "51A-238.88", color: "Trắng ngọc trai" },
  { id: 2, brand: "Mazda", model: "CX-5", plate: "30H-889.12", color: "Xanh đậm" },
  { id: 3, brand: "Honda", model: "City", plate: "59A-621.45", color: "Bạc" },
];

const services = [
  { id: 1, name: "Rửa ngoại thất tiêu chuẩn", price: 80000, time: "25 phút", badge: "Phổ biến" },
  { id: 2, name: "Vệ sinh nội thất", price: 150000, time: "45 phút", badge: "Chuyên sâu" },
  { id: 3, name: "Chăm sóc toàn diện", price: 280000, time: "75 phút", badge: "Cao cấp" },
  { id: 4, name: "Phủ bóng bảo vệ", price: 350000, time: "90 phút", badge: "Cao cấp" },
  { id: 5, name: "Vệ sinh khoang máy", price: 220000, time: "60 phút", badge: "Kỹ thuật" },
];

const garages = [
  { id: 1, name: "WashMate Quận 7", address: "12 Nguyễn Văn Linh, Quận 7", slots: "8 khung giờ hôm nay", rating: 4.8 },
  { id: 2, name: "WashMate Thủ Đức", address: "25 Võ Văn Ngân, Thủ Đức", slots: "5 khung giờ hôm nay", rating: 4.7 },
  { id: 3, name: "WashMate Bình Thạnh", address: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh", slots: "3 khung giờ hôm nay", rating: 4.6 },
];

const timeSlots = [
  { id: "1", time: "08:00 – 08:30", status: "available", period: "morning" },
  { id: "2", time: "08:30 – 09:00", status: "available", period: "morning" },
  { id: "3", time: "09:00 – 09:30", status: "available", period: "morning" },
  { id: "4", time: "09:30 – 10:00", status: "available", period: "morning" },
  { id: "5", time: "10:00 – 10:30", status: "full", period: "morning" },
  { id: "6", time: "10:30 – 11:00", status: "available", period: "morning" },
  { id: "7", time: "13:00 – 13:30", status: "available", period: "afternoon" },
  { id: "8", time: "13:30 – 14:00", status: "available", period: "afternoon" },
  { id: "9", time: "14:00 – 14:30", status: "available", period: "afternoon" },
  { id: "10", time: "14:30 – 15:00", status: "available", period: "afternoon" },
  { id: "11", time: "15:00 – 15:30", status: "available", period: "afternoon" },
  { id: "12", time: "15:30 – 16:00", status: "available", period: "afternoon" },
];

const stepContent = [
  {
    title: "Chọn xe của bạn",
    description: "Bạn có 3 xe trong tài khoản",
    icon: <Car size={40} />,
  },
  {
    title: "Chọn dịch vụ",
    description: "Chọn gói dịch vụ phù hợp với nhu cầu",
    icon: <Droplets size={40} />,
  },
  {
    title: "Chọn gara",
    description: "Tìm gara gần bạn nhất",
    icon: <MapPin size={40} />,
  },
  {
    title: "Chọn khung giờ",
    description: "Lựa chọn ngày và giờ đặt lịch",
    icon: <Clock size={40} />,
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function getDaysForNextWeek() {
  const dayLabels = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const today = new Date();
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = dayLabels[date.getDay()];
    const dayMonth = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : "";

    days.push({ id: String(i), label, dayOfWeek, dayMonth, dateObj: date });
  }

  return days;
}

export default function NewBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedDate, setSelectedDate] = useState("0");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleContinue = () => {
    setError("");

    if (currentStep === 1 && !selectedVehicle) {
      setError("Vui lòng chọn xe để tiếp tục.");
      return;
    }
    if (currentStep === 2 && !selectedService) {
      setError("Vui lòng chọn dịch vụ để tiếp tục.");
      return;
    }
    if (currentStep === 3 && !selectedGarage) {
      setError("Vui lòng chọn gara để tiếp tục.");
      return;
    }
    if (currentStep === 4 && (!selectedDate || !selectedSlot)) {
      setError(!selectedDate ? "Vui lòng chọn ngày để tiếp tục." : "Vui lòng chọn khung giờ để tiếp tục.");
      return;
    }

    if (currentStep === 4) {
      setShowConfirmation(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDateChange = (newDateId) => {
    setSelectedDate(newDateId);
    setSelectedSlot(null);
  };

  const getSelectedVehicleInfo = () => {
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : "Chưa chọn";
  };

  const getSelectedServiceInfo = () => {
    const service = services.find((s) => s.id === selectedService);
    return service ? service.name : "Chưa chọn";
  };

  const getSelectedServicePrice = () => {
    const service = services.find((s) => s.id === selectedService);
    return service ? service.price : 0;
  };

  const getSelectedGarageInfo = () => {
    const garage = garages.find((g) => g.id === selectedGarage);
    return garage ? garage.name : "Chưa chọn";
  };

  const getSelectedSlotInfo = () => {
    const slot = timeSlots.find((s) => s.id === selectedSlot);
    return slot ? slot.time : "Chưa chọn";
  };

  const getFormattedDate = (dayIndex) => {
    const days = getDaysForNextWeek();
    const day = days.find((d) => d.id === dayIndex);
    if (!day) return "Chưa chọn";
    const year = day.dateObj.getFullYear();
    return `${day.dayOfWeek}, ${day.dayMonth}/${year}`;
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-extrabold leading-tight text-foreground">Đặt lịch mới</h1>
        <p className="text-lg font-medium text-muted-foreground">
          Theo dõi các bước để tạo lịch đặt dịch vụ chăm sóc xe của bạn.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold transition-all",
                  index + 1 <= currentStep ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground",
                )}
              >
                {index + 1 < currentStep ? <Check size={20} /> : index + 1}
              </div>
              <div className="hidden flex-1 px-2 sm:block">
                <p className="text-sm font-semibold leading-tight text-foreground">{step}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("mx-2 h-1 flex-1 rounded-full", index + 1 < currentStep ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border border-border bg-white p-8">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-block rounded-full bg-primary/10 p-4">
                <div className="text-primary">{stepContent[currentStep - 1].icon}</div>
              </div>
              <h2 className="mb-2 text-3xl font-extrabold leading-tight text-foreground">
                {stepContent[currentStep - 1].title}
              </h2>
              <p className="font-medium text-muted-foreground">{stepContent[currentStep - 1].description}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-4 transition-all",
                      selectedVehicle === vehicle.id ? "border-primary bg-primary/5" : "border-border hover:border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-foreground">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {vehicle.plate} • {vehicle.color}
                        </p>
                      </div>
                      {selectedVehicle === vehicle.id ? (
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check size={16} className="text-white" />
                        </div>
                      ) : (
                        <ChevronRight size={20} className="text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-4 transition-all",
                      selectedService === service.id ? "border-primary bg-primary/5" : "border-border hover:border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-bold text-foreground">{service.name}</p>
                          <Badge className="text-xs">{service.badge}</Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {service.time} • Từ {formatPrice(service.price)}
                        </p>
                      </div>
                      {selectedService === service.id ? (
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check size={16} className="text-white" />
                        </div>
                      ) : (
                        <ChevronRight size={20} className="text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                {garages.map((garage) => (
                  <div
                    key={garage.id}
                    onClick={() => setSelectedGarage(garage.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-4 transition-all",
                      selectedGarage === garage.id ? "border-primary bg-primary/5" : "border-border hover:border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{garage.name}</p>
                        <p className="mb-1 text-sm font-medium text-muted-foreground">{garage.address}</p>
                        <p className="text-sm font-semibold text-primary">{garage.slots}</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-2 flex items-center gap-1 font-bold text-foreground">⭐ {garage.rating}</div>
                        {selectedGarage === garage.id ? (
                          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Check size={16} className="text-white" />
                          </div>
                        ) : (
                          <ChevronRight size={20} className="text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="mb-8">
                  <h3 className="mb-3 font-bold leading-tight text-foreground">Chọn ngày</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {getDaysForNextWeek().map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDateChange(day.id)}
                        className={cn(
                          "flex-shrink-0 whitespace-nowrap rounded-lg border-2 px-4 py-3 font-semibold transition-all",
                          selectedDate === day.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-foreground hover:border-primary",
                        )}
                      >
                        <div className="flex flex-col gap-1 text-center">
                          {day.label && <span className="text-xs font-medium">{day.label}</span>}
                          <span className="text-sm">{day.dayOfWeek}</span>
                          <span className="text-xs">{day.dayMonth}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 font-bold leading-tight text-foreground">Buổi sáng (08:00 – 11:00)</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {timeSlots
                      .filter((slot) => slot.period === "morning")
                      .map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => slot.status !== "full" && setSelectedSlot(slot.id)}
                          disabled={slot.status === "full"}
                          className={cn(
                            "rounded-lg p-3 font-semibold transition-all",
                            selectedSlot === slot.id
                              ? "border-2 border-primary bg-primary text-primary-foreground"
                              : slot.status === "full"
                                ? "cursor-not-allowed bg-red-100 text-red-800"
                                : "cursor-pointer border-2 border-transparent bg-green-100 text-green-800 hover:bg-green-200",
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="mb-3 font-bold leading-tight text-foreground">Buổi chiều (13:00 – 16:00)</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {timeSlots
                      .filter((slot) => slot.period === "afternoon")
                      .map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => slot.status !== "full" && setSelectedSlot(slot.id)}
                          disabled={slot.status === "full"}
                          className={cn(
                            "rounded-lg p-3 font-semibold transition-all",
                            selectedSlot === slot.id
                              ? "border-2 border-primary bg-primary text-primary-foreground"
                              : slot.status === "full"
                                ? "cursor-not-allowed bg-red-100 text-red-800"
                                : "cursor-pointer border-2 border-transparent bg-green-100 text-green-800 hover:bg-green-200",
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                variant="outline"
                className="flex-1 rounded-lg border-border font-semibold"
              >
                Quay lại
              </Button>
              <Button onClick={handleContinue} className="flex-1 rounded-lg bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
                {currentStep === 4 ? "Xác nhận" : "Tiếp tục"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8 rounded-3xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-bold leading-tight text-foreground">Tóm tắt lựa chọn</h3>

            <div className="mb-6 space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Xe</p>
                <p className={cn("font-semibold leading-tight", selectedVehicle ? "text-foreground" : "text-border")}>
                  {getSelectedVehicleInfo()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Dịch vụ</p>
                <p className={cn("font-semibold leading-tight", selectedService ? "text-foreground" : "text-border")}>
                  {getSelectedServiceInfo()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Gara</p>
                <p className={cn("font-semibold leading-tight", selectedGarage ? "text-foreground" : "text-border")}>
                  {getSelectedGarageInfo()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Ngày</p>
                <p className={cn("font-semibold leading-tight", selectedDate ? "text-foreground" : "text-border")}>
                  {getFormattedDate(selectedDate)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Khung giờ</p>
                <p className={cn("font-semibold leading-tight", selectedSlot ? "text-foreground" : "text-border")}>
                  {getSelectedSlotInfo()}
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Giá tham khảo</p>
                <p className="text-2xl font-extrabold leading-tight text-primary">
                  {selectedService ? formatPrice(getSelectedServicePrice()) : "Từ 80.000đ"}
                </p>
              </div>
            </div>

            <p className="text-center text-xs font-medium text-muted-foreground">
              Hoàn thành tất cả các bước để đặt lịch
            </p>
          </Card>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-3xl bg-white p-8">
            <div className="text-center">
              <div className="mb-4 inline-block rounded-full bg-green-100 p-4">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="mb-3 text-2xl font-bold leading-tight text-foreground">Dữ liệu sẵn sàng</h2>
              <p className="mb-6 font-medium text-muted-foreground">
                Dữ liệu đặt lịch đã sẵn sàng. Luồng tạo lịch đặt thật sẽ được hoàn thiện ở Prompt 4.
              </p>
            </div>
            <Button
              onClick={() => setShowConfirmation(false)}
              className="w-full rounded-lg bg-primary font-bold text-primary-foreground hover:bg-brand-dark"
            >
              Đã hiểu
            </Button>
          </Card>
        </div>
      )}

      <Card className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-800">
          Trong Prompt 3, các bước này là preview chuẩn bị dữ liệu. Luồng đặt lịch thực tế sẽ được hoàn thiện ở Prompt 4.
        </p>
      </Card>
    </div>
  );
}
