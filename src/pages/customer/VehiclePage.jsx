import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleApi } from "../../api/vehicleApi";

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

  const [vehicles, setVehicles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchVehicles() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await vehicleApi.getMyVehicles();

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể tải danh sách phương tiện.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const licensePlate = vehicle.licensePlate || "";
      const brand = vehicle.brand || "";
      const model = vehicle.model || "";
      const color = vehicle.color || "";

      const matchesKeyword =
        !normalizedKeyword ||
        licensePlate.toLowerCase().includes(normalizedKeyword) ||
        brand.toLowerCase().includes(normalizedKeyword) ||
        model.toLowerCase().includes(normalizedKeyword) ||
        color.toLowerCase().includes(normalizedKeyword);

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

  async function handleAddVehicle(event) {
    event.preventDefault();

    const licensePlate = formData.licensePlate.trim().toUpperCase();
    const brand = formData.brand.trim();
    const model = formData.model.trim();
    const color = formData.color.trim();

    setSuccessMessage("");
    setErrorMessage("");

    if (!licensePlate || !brand || !model) {
      setErrorMessage("Vui lòng nhập biển số, hãng xe và dòng xe.");
      return;
    }

    const isDuplicate = vehicles.some(
      (vehicle) =>
        vehicle.licensePlate?.toLowerCase() === licensePlate.toLowerCase() &&
        vehicle.status === "ACTIVE",
    );

    if (isDuplicate) {
      setErrorMessage("Biển số này đã tồn tại trong danh sách xe ACTIVE.");
      return;
    }

    try {
      await vehicleApi.createVehicle({
        licensePlate,
        brand,
        model,
        color: color || "Chưa cập nhật",
      });

      await fetchVehicles();

      setFormData({
        licensePlate: "",
        brand: "",
        model: "",
        color: "",
      });

      setSuccessMessage("Đã thêm phương tiện thành công.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể thêm phương tiện.");
    }
  }

  async function handleToggleStatus(vehicle) {
    const vehicleId = vehicle.vehicleId || vehicle.id;
    const newStatus = vehicle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setSuccessMessage("");
      setErrorMessage("");

      await vehicleApi.updateVehicle(vehicleId, {
        ...vehicle,
        status: newStatus,
      });

      await fetchVehicles();

      setSuccessMessage(
        newStatus === "ACTIVE"
          ? "Đã kích hoạt lại phương tiện."
          : "Đã tạm ngưng phương tiện.",
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể cập nhật trạng thái xe.");
    }
  }

  async function handleDeleteVehicle(vehicle) {
    const vehicleId = vehicle.vehicleId || vehicle.id;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa xe ${vehicle.licensePlate}?`,
    );

    if (!confirmed) return;

    try {
      setSuccessMessage("");
      setErrorMessage("");

      await vehicleApi.deleteVehicle(vehicleId);
      await fetchVehicles();

      setSuccessMessage("Đã xóa phương tiện thành công.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể xóa phương tiện.");
    }
  }

  function goToCreateBooking() {
    navigate("/customer/bookings/create");
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          Đang tải danh sách phương tiện...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    );
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

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {errorMessage}
        </div>
      )}

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
                  const vehicleId = vehicle.vehicleId || vehicle.id;

                  return (
                    <div
                      key={vehicleId}
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
                          Màu xe: {vehicle.color || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Tổng booking</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {vehicle.totalBookings || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Lần rửa gần nhất
                        </p>
                        <p className="mt-1 font-bold text-slate-900">
                          {vehicle.lastServiceDate || "Chưa có"}
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
                          onClick={() => handleToggleStatus(vehicle)}
                          className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {vehicle.status === "ACTIVE"
                            ? "Tạm ngưng"
                            : "Kích hoạt lại"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                        >
                          Xóa xe
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
                Thêm phương tiện
              </button>
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
