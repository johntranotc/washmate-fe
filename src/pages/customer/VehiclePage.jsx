import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialVehicles = [
  {
    vehicleId: 1,
    licensePlate: "51A-12345",
    brand: "Toyota",
    model: "Vios",
    color: "Trắng",
    status: "ACTIVE",
    totalBookings: 8,
    lastServiceDate: "2026-05-20",
  },
  {
    vehicleId: 2,
    licensePlate: "51B-67890",
    brand: "Kia",
    model: "K3",
    color: "Đen",
    status: "ACTIVE",
    totalBookings: 3,
    lastServiceDate: "2026-04-18",
  },
  {
    vehicleId: 3,
    licensePlate: "59C-88888",
    brand: "Honda",
    model: "City",
    color: "Xám",
    status: "INACTIVE",
    totalBookings: 1,
    lastServiceDate: "2026-03-02",
  },
];

function getStatusLabel(status) {
  const labels = {
    ACTIVE: "ACTIVE - Đang sử dụng",
    INACTIVE: "INACTIVE - Tạm ngưng",
    DELETED: "DELETED - Đã xóa",
  };

  return labels[status] || status;
}

function StatusBadge({ status }) {
  const statusClass =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "INACTIVE"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-red-100 text-red-700 border-red-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function VehiclePage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState(initialVehicles);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const filteredVehicles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesKeyword =
        !normalizedKeyword ||
        vehicle.licensePlate.toLowerCase().includes(normalizedKeyword) ||
        vehicle.brand.toLowerCase().includes(normalizedKeyword) ||
        vehicle.model.toLowerCase().includes(normalizedKeyword) ||
        vehicle.color.toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === "ALL" || vehicle.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [vehicles, keyword, statusFilter]);

  const activeVehicleCount = vehicles.filter(
    (vehicle) => vehicle.status === "ACTIVE",
  ).length;

  const inactiveVehicleCount = vehicles.filter(
    (vehicle) => vehicle.status === "INACTIVE",
  ).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAddVehicle(event) {
    event.preventDefault();

    const licensePlate = formData.licensePlate.trim().toUpperCase();
    const brand = formData.brand.trim();
    const model = formData.model.trim();
    const color = formData.color.trim();

    if (!licensePlate || !brand || !model) {
      setSuccessMessage("Vui lòng nhập biển số, hãng xe và dòng xe.");
      return;
    }

    const isDuplicate = vehicles.some(
      (vehicle) =>
        vehicle.licensePlate.toLowerCase() === licensePlate.toLowerCase() &&
        vehicle.status === "ACTIVE",
    );

    if (isDuplicate) {
      setSuccessMessage("Biển số này đã tồn tại trong danh sách xe ACTIVE.");
      return;
    }

    const newVehicle = {
      vehicleId: Date.now(),
      licensePlate,
      brand,
      model,
      color: color || "Chưa cập nhật",
      status: "ACTIVE",
      totalBookings: 0,
      lastServiceDate: "Chưa có",
    };

    setVehicles((current) => [newVehicle, ...current]);
    setFormData({
      licensePlate: "",
      brand: "",
      model: "",
      color: "",
    });
    setSuccessMessage("Đã thêm phương tiện mock thành công.");
  }

  function handleToggleStatus(vehicleId) {
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.vehicleId !== vehicleId) {
          return vehicle;
        }

        return {
          ...vehicle,
          status: vehicle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        };
      }),
    );
  }

  function goToCreateBooking() {
    navigate("/customer/bookings/create");
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Quản lý phương tiện
        </h1>
        <p className="mt-2 text-slate-500">
          Customer quản lý xe của mình trước khi tạo booking.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-800">
        <strong>Quy tắc nghiệp vụ:</strong> Booking chỉ được tạo bằng vehicle
        thuộc đúng customer hiện tại và vehicle phải ở trạng thái ACTIVE.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">Tổng phương tiện</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {vehicles.length}
              </p>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center shadow-sm">
              <p className="text-sm text-green-700">Đang sử dụng</p>
              <p className="mt-1 text-3xl font-bold text-green-800">
                {activeVehicleCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center shadow-sm">
              <p className="text-sm text-amber-700">Tạm ngưng</p>
              <p className="mt-1 text-3xl font-bold text-amber-800">
                {inactiveVehicleCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tìm kiếm phương tiện
                </label>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Nhập biển số, hãng xe, dòng xe hoặc màu xe"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Lọc trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">ACTIVE - Đang sử dụng</option>
                  <option value="INACTIVE">INACTIVE - Tạm ngưng</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">
                Danh sách phương tiện
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tìm thấy {filteredVehicles.length} phương tiện phù hợp.
              </p>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="p-10 text-center">
                <h3 className="text-lg font-bold text-slate-900">
                  Không tìm thấy phương tiện phù hợp
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Hãy thử tìm bằng biển số hoặc đổi bộ lọc trạng thái.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredVehicles.map((vehicle) => {
                  const canUseForBooking = vehicle.status === "ACTIVE";

                  return (
                    <div
                      key={vehicle.vehicleId}
                      className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {vehicle.licensePlate}
                          </h3>
                          <StatusBadge status={vehicle.status} />
                        </div>

                        <p className="mt-2 font-semibold text-slate-900">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-slate-500">
                          Màu xe: {vehicle.color}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Tổng booking</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {vehicle.totalBookings}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Lần rửa gần nhất
                        </p>
                        <p className="mt-1 font-bold text-slate-900">
                          {vehicle.lastServiceDate}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center gap-3">
                        <button
                          type="button"
                          onClick={goToCreateBooking}
                          disabled={!canUseForBooking}
                          className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Đặt lịch xe này
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(vehicle.vehicleId)}
                          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {vehicle.status === "ACTIVE"
                            ? "Tạm ngưng"
                            : "Kích hoạt lại"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <form
            onSubmit={handleAddVehicle}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-center text-xl font-bold text-slate-900">
              Thêm phương tiện
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Biển số xe
                </label>
                <input
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="Ví dụ: 51A-12345"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Hãng xe
                </label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ví dụ: Toyota"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Dòng xe
                </label>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Ví dụ: Vios"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Màu xe
                </label>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Ví dụ: Trắng"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
              >
                Thêm phương tiện mock
              </button>

              {successMessage && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-800">
                  {successMessage}
                </div>
              )}
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-bold text-slate-900">
              Liên kết với Booking
            </h2>

            <p className="mt-4 text-center text-sm text-slate-500">
              Khi tạo booking, hệ thống chỉ cho chọn xe ACTIVE thuộc đúng tài
              khoản customer hiện tại.
            </p>

            <button
              type="button"
              onClick={goToCreateBooking}
              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Sang màn tạo booking
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default VehiclePage;
