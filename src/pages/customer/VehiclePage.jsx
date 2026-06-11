import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleApi } from "../../api/vehicleApi";

const statusLabels = {
  ACTIVE: "Đang sử dụng",
  INACTIVE: "Tạm ngưng",
  DELETED: "Đã xóa",
};

function StatusBadge({ status }) {
  const statusClass =
    status === "ACTIVE"
      ? "border-green-200 bg-green-100 text-green-700"
      : status === "INACTIVE"
        ? "border-amber-200 bg-amber-100 text-amber-700"
        : "border-red-200 bg-red-100 text-red-700";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
    >
      {statusLabels[status] || status}
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
      setErrorMessage(
        error.message || "Không thể tải danh sách phương tiện.",
      );
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
      const searchableText = [
        vehicle.licensePlate,
        vehicle.brand,
        vehicle.model,
        vehicle.color,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);
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
    setFormData((current) => ({ ...current, [name]: value }));
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
      setErrorMessage(
        "Biển số này đã tồn tại trong danh sách xe đang sử dụng.",
      );
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
      setFormData({ licensePlate: "", brand: "", model: "", color: "" });
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
      <header>
        <h1 className="text-2xl font-extrabold">Quản lý phương tiện</h1>
        <p className="mt-2 text-xs text-slate-500">
          Quản lý phương tiện của bạn trước khi tạo lịch đặt dịch vụ.
        </p>
      </header>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Quy tắc nghiệp vụ:</strong> Chỉ phương tiện đang sử dụng và
        thuộc đúng tài khoản khách hàng mới có thể tạo lịch đặt.
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Tổng phương tiện", vehicles.length],
          ["Đang sử dụng", activeVehicleCount],
          ["Tạm ngưng", inactiveVehicleCount],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <strong className="mt-2 block text-3xl">{value}</strong>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_220px]">
            <label className="text-xs font-semibold text-slate-600">
              Tìm kiếm phương tiện
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập biển số, hãng xe, dòng xe hoặc màu xe"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Lọc trạng thái
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Đang sử dụng</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </label>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-extrabold">Danh sách phương tiện</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tìm thấy {filteredVehicles.length} phương tiện phù hợp.
              </p>
            </div>
            {filteredVehicles.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Không tìm thấy phương tiện phù hợp.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => {
                  const vehicleId = vehicle.vehicleId || vehicle.id;
                  return (
                    <article
                      key={vehicleId}
                      className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold">
                            {vehicle.licensePlate}
                          </h3>
                          <StatusBadge status={vehicle.status} />
                        </div>
                        <p className="mt-2 text-sm font-semibold">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-slate-500">
                          Màu xe: {vehicle.color || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">Tổng lịch đặt</span>
                        <strong className="mt-1 block text-xl">
                          {vehicle.totalBookings || 0}
                        </strong>
                        <span className="mt-2 block text-slate-500">
                          Lần rửa gần nhất:{" "}
                          {vehicle.lastServiceDate || "Chưa có"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/customer/bookings/create")}
                          disabled={vehicle.status !== "ACTIVE"}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:bg-slate-300"
                        >
                          Đặt lịch
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(vehicle)}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold"
                        >
                          {vehicle.status === "ACTIVE"
                            ? "Tạm ngưng"
                            : "Kích hoạt"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <form
          onSubmit={handleAddVehicle}
          className="h-fit rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-extrabold">Thêm phương tiện</h2>
          {[
            ["licensePlate", "Biển số xe", "Ví dụ: 51A-12345"],
            ["brand", "Hãng xe", "Ví dụ: Toyota"],
            ["model", "Dòng xe", "Ví dụ: Vios"],
            ["color", "Màu xe", "Ví dụ: Trắng"],
          ].map(([name, label, placeholder]) => (
            <label
              key={name}
              className="mt-4 block text-xs font-semibold text-slate-600"
            >
              {label}
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
              />
            </label>
          ))}
          <button
            type="submit"
            className="mt-5 h-11 w-full rounded-lg bg-blue-600 text-xs font-bold text-white"
          >
            Thêm phương tiện
          </button>
        </form>
      </div>
    </div>
  );
}

export default VehiclePage;
