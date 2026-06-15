import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { vehicleApi } from "@/api/vehicleApi";

const emptyForm = { licensePlate: "", brand: "", model: "", color: "" };

function StatusBadge({ status }) {
  if (status === "ACTIVE") {
    return <Badge className="rounded-full bg-green-100 text-green-800">Đang sử dụng</Badge>;
  }
  if (status === "INACTIVE") {
    return <Badge className="rounded-full bg-yellow-100 text-yellow-800">Tạm ẩn</Badge>;
  }
  return <Badge className="rounded-full bg-red-100 text-red-800">Đã xóa</Badge>;
}

export default function VehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

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
    const keyword = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "using" && vehicle.status === "ACTIVE") ||
        (filterStatus === "hidden" && vehicle.status === "INACTIVE");

      const matchesSearch =
        !keyword ||
        (vehicle.licensePlate || "").toLowerCase().includes(keyword) ||
        (vehicle.brand || "").toLowerCase().includes(keyword) ||
        (vehicle.model || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, searchTerm, filterStatus]);

  const activeCount = vehicles.filter((vehicle) => vehicle.status === "ACTIVE").length;

  const lastServiceLabel = useMemo(() => {
    const withService = vehicles.find((vehicle) => vehicle.lastServiceDate);
    return withService ? withService.lastServiceDate : "Chưa có";
  }, [vehicles]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openAddModal() {
    setFormData(emptyForm);
    setErrorMessage("");
    setShowAddModal(true);
  }

  function openEditModal(vehicle) {
    setSelectedVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      color: vehicle.color || "",
    });
    setErrorMessage("");
    setShowEditModal(true);
  }

  function openDeleteModal(vehicle) {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  }

  async function handleAddVehicle() {
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

    try {
      await vehicleApi.createVehicle({
        licensePlate,
        brand,
        model,
        color: color || "Chưa cập nhật",
      });

      await fetchVehicles();
      setShowAddModal(false);
      setSuccessMessage("Đã thêm phương tiện thành công.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể thêm phương tiện.");
    }
  }

  async function handleUpdateVehicle() {
    if (!selectedVehicle) return;

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

    const vehicleId = selectedVehicle.vehicleId || selectedVehicle.id;

    try {
      await vehicleApi.updateVehicle(vehicleId, {
        ...selectedVehicle,
        licensePlate,
        brand,
        model,
        color: color || "Chưa cập nhật",
      });

      await fetchVehicles();
      setShowEditModal(false);
      setSuccessMessage("Đã cập nhật thông tin xe.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể cập nhật phương tiện.");
    }
  }

  async function handleToggleStatus(vehicle) {
    const vehicleId = vehicle.vehicleId || vehicle.id;
    const newStatus = vehicle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setSuccessMessage("");
    setErrorMessage("");

    try {
      await vehicleApi.updateVehicle(vehicleId, { ...vehicle, status: newStatus });
      await fetchVehicles();
      setSuccessMessage(
        newStatus === "ACTIVE" ? "Đã kích hoạt lại phương tiện." : "Đã tạm ẩn phương tiện.",
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể cập nhật trạng thái xe.");
    }
  }

  async function handleDeleteVehicle() {
    if (!selectedVehicle) return;
    const vehicleId = selectedVehicle.vehicleId || selectedVehicle.id;

    setSuccessMessage("");
    setErrorMessage("");

    try {
      await vehicleApi.deleteVehicle(vehicleId);
      await fetchVehicles();
      setShowDeleteModal(false);
      setSuccessMessage("Đã xóa phương tiện thành công.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Không thể xóa phương tiện.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-extrabold leading-tight text-foreground">Xe của tôi</h1>
        <p className="mb-6 text-lg font-medium text-muted-foreground">
          Lưu thông tin xe để đặt lịch nhanh hơn và theo dõi lịch sử chăm sóc từng phương tiện.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="mb-1 text-sm font-medium text-muted-foreground">Tổng số xe</p>
            <p className="text-2xl font-extrabold leading-tight text-foreground">{vehicles.length} xe</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="mb-1 text-sm font-medium text-muted-foreground">Xe đang sử dụng</p>
            <p className="text-2xl font-extrabold leading-tight text-foreground">{activeCount} xe</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="mb-1 text-sm font-medium text-muted-foreground">Lịch gần nhất</p>
            <p className="text-2xl font-extrabold leading-tight text-foreground">{lastServiceLabel}</p>
          </div>
        </div>

        <Button onClick={openAddModal} className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
          <Plus size={20} />
          Thêm xe mới
        </Button>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 space-y-4">
        <Input
          placeholder="Tìm theo biển số, hãng xe hoặc dòng xe"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-12 rounded-xl border-border focus-visible:border-primary"
        />

        <div className="flex gap-2">
          {["all", "using", "hidden"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-white text-muted-foreground hover:border-primary"
              }`}
            >
              {status === "all" ? "Tất cả" : status === "using" ? "Đang sử dụng" : "Tạm ẩn"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="rounded-3xl border border-border p-12 text-center">
          <p className="text-lg font-semibold text-foreground">Đang tải danh sách phương tiện...</p>
          <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </Card>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredVehicles.map((vehicle) => {
            const vehicleId = vehicle.vehicleId || vehicle.id;

            return (
              <Card key={vehicleId} className="rounded-3xl border border-border p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <Car size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight text-foreground">{vehicle.brand}</p>
                      <p className="text-sm font-medium text-muted-foreground">{vehicle.model}</p>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Biển số xe</p>
                    <p className="font-semibold leading-tight text-foreground">{vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Màu sơn</p>
                    <p className="font-semibold leading-tight text-foreground">{vehicle.color || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Tổng booking</p>
                    <p className="font-semibold leading-tight text-foreground">{vehicle.totalBookings || 0}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Lịch gần nhất</p>
                  <p className="text-sm font-medium text-muted-foreground">{vehicle.lastServiceDate || "Chưa có"}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => openEditModal(vehicle)}
                    className="flex-1 rounded-lg border-border font-semibold text-primary"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleStatus(vehicle)}
                    className="flex-1 rounded-lg border-border font-semibold text-primary"
                  >
                    {vehicle.status === "ACTIVE" ? "Tạm ẩn" : "Kích hoạt lại"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openDeleteModal(vehicle)}
                    className="flex-1 rounded-lg border-red-200 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </Button>
                  <Button
                    disabled={vehicle.status !== "ACTIVE"}
                    onClick={() => navigate("/khach-hang/dat-lich-moi")}
                    className="flex-1 rounded-lg bg-primary font-bold text-primary-foreground hover:bg-brand-dark"
                  >
                    Đặt lịch
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-3xl border border-border p-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 p-4">
            <Car size={40} className="text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Bạn chưa thêm xe nào</h2>
          <p className="mb-6 font-medium text-muted-foreground">
            Thêm xe để đặt lịch rửa xe nhanh hơn và theo dõi lịch sử chăm sóc dễ dàng.
          </p>
          <Button onClick={openAddModal} className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
            Thêm xe mới
          </Button>
        </Card>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-3xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold leading-tight text-foreground">Thêm xe mới</h2>
              <button type="button" onClick={() => setShowAddModal(false)}>
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Hãng xe</label>
                <Input name="brand" value={formData.brand} onChange={handleFormChange} placeholder="VD: Toyota" className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Dòng xe</label>
                <Input name="model" value={formData.model} onChange={handleFormChange} placeholder="VD: Vios" className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Biển số xe</label>
                <Input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} placeholder="VD: 51A-238.88" className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Màu sơn</label>
                <Input name="color" value={formData.color} onChange={handleFormChange} placeholder="VD: Trắng" className="rounded-lg border-border" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg border-border font-semibold">
                Hủy
              </Button>
              <Button onClick={handleAddVehicle} className="flex-1 rounded-lg bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
                Thêm xe
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-3xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold leading-tight text-foreground">Sửa thông tin xe</h2>
              <button type="button" onClick={() => setShowEditModal(false)}>
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Hãng xe</label>
                <Input name="brand" value={formData.brand} onChange={handleFormChange} className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Dòng xe</label>
                <Input name="model" value={formData.model} onChange={handleFormChange} className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Biển số xe</label>
                <Input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} className="rounded-lg border-border" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Màu sơn</label>
                <Input name="color" value={formData.color} onChange={handleFormChange} className="rounded-lg border-border" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 rounded-lg border-border font-semibold">
                Hủy
              </Button>
              <Button onClick={handleUpdateVehicle} className="flex-1 rounded-lg bg-primary font-bold text-primary-foreground hover:bg-brand-dark">
                Cập nhật
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-3xl bg-white p-8">
            <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground">Xóa xe?</h2>
            <p className="mb-6 font-medium text-muted-foreground">
              Bạn có chắc chắn muốn xóa xe {selectedVehicle.licensePlate}? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-lg border-border font-semibold">
                Hủy
              </Button>
              <Button onClick={handleDeleteVehicle} className="flex-1 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700">
                Xóa
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
