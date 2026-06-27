import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plus, X, Sparkles, Calendar, Edit2, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { vehicleApi } from "@/api/vehicleApi";

const emptyForm = { licensePlate: "", brand: "", model: "", color: "" };

function StatusBadge({ status }) {
  if (status === "ACTIVE" || !status) {
    return (
      <Badge className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
        <CheckCircle2 size={13} className="text-emerald-600" /> Đang sử dụng
      </Badge>
    );
  }
  return <Badge className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Đã ngừng sử dụng</Badge>;
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
        (filterStatus === "using" && (vehicle.status === "ACTIVE" || !vehicle.status));

      const matchesSearch =
        !keyword ||
        (vehicle.licensePlate || "").toLowerCase().includes(keyword) ||
        (vehicle.brand || "").toLowerCase().includes(keyword) ||
        (vehicle.model || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, searchTerm, filterStatus]);

  const activeCount = vehicles.filter((vehicle) => vehicle.status === "ACTIVE" || !vehicle.status).length;

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
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">Xe của tôi</h1>
          <p className="text-base font-medium text-muted-foreground sm:text-lg">
            Quản lý danh sách phương tiện để trải nghiệm đặt lịch nhanh và thuận tiện hơn.
          </p>
        </div>
        <Button onClick={openAddModal} className="h-12 rounded-2xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl">
          <Plus size={20} className="mr-2" />
          Thêm xe mới
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
          <div className="rounded-2xl bg-blue-500/10 p-3.5 text-blue-600">
            <Car size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Tổng phương tiện</p>
            <p className="text-2xl font-black text-foreground">{vehicles.length} xe</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
          <div className="rounded-2xl bg-emerald-500/10 p-3.5 text-emerald-600">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Đang sử dụng</p>
            <p className="text-2xl font-black text-foreground">{activeCount} xe</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
          <div className="rounded-2xl bg-amber-500/10 p-3.5 text-amber-600">
            <Calendar size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Lịch gần nhất</p>
            <p className="text-xl font-black text-foreground">{lastServiceLabel}</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50/80 p-4 font-semibold text-green-800 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-700 shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="🔍 Tìm theo biển số, hãng xe hoặc dòng xe..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-12 max-w-md rounded-2xl border-border bg-white px-4 font-medium shadow-sm focus-visible:border-primary focus-visible:ring-primary/20"
        />

        <div className="flex gap-2 rounded-2xl border border-border bg-slate-100/80 p-1.5">
          {["all", "using"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-5 py-2 font-bold text-sm transition-all ${
                filterStatus === status
                  ? "bg-white text-primary shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "Tất cả phương tiện" : "Đang sử dụng"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="rounded-3xl border border-border p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">Đang tải danh sách xe...</p>
          <p className="mt-2 text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </Card>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredVehicles.map((vehicle) => {
            const vehicleId = vehicle.vehicleId || vehicle.id;
            const formattedBrand = vehicle.brand ? vehicle.brand.toUpperCase() : "XE";
            const formattedModel = vehicle.model ? vehicle.model.charAt(0).toUpperCase() + vehicle.model.slice(1) : "";

            return (
              <Card key={vehicleId} className="group relative overflow-hidden rounded-3xl border border-border/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                      <Car size={30} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        {formattedBrand} <span className="font-bold text-muted-foreground">{formattedModel}</span>
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block rounded-lg border border-slate-300 bg-slate-100 px-3 py-0.5 font-mono text-sm font-bold tracking-wider text-slate-800 shadow-inner">
                          {vehicle.licensePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>

                <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Màu sơn</p>
                    <p className="font-bold text-foreground">{vehicle.color || "Trắng"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lần chăm sóc</p>
                    <p className="font-bold text-foreground">{vehicle.lastServiceDate || "Chưa có"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng đặt lịch</p>
                    <p className="font-black text-primary">{vehicle.totalBookings || 0} lần</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    onClick={() => navigate("/khach-hang/dat-lich-moi")}
                    className="h-11 flex-1 rounded-xl bg-primary font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                  >
                    <Sparkles size={16} className="mr-1.5" /> Đặt lịch rửa xe ngay
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditModal(vehicle)}
                      title="Sửa thông tin xe"
                      className="h-11 w-11 rounded-xl border-border bg-white text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteModal(vehicle)}
                      title="Xóa xe"
                      className="h-11 w-11 rounded-xl border-red-200 bg-white text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-3xl border border-border p-12 text-center shadow-sm">
          <div className="mb-4 inline-block rounded-3xl bg-primary/10 p-5">
            <Car size={48} className="text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Bạn chưa có phương tiện nào</h2>
          <p className="mb-6 font-medium text-muted-foreground">
            Thêm xe để đặt lịch rửa xe nhanh hơn và theo dõi lịch sử chăm sóc dễ dàng.
          </p>
          <Button onClick={openAddModal} className="h-12 rounded-2xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90">
            <Plus size={20} className="mr-2" /> Thêm xe mới ngay
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
