import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useNavigate } from "react-router-dom";
import { Car, Plus, X, Droplets, Calendar, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { vehicleApi } from "@/api/vehicleApi";
import { CAR_BRANDS } from "@/lib/car-models";

const emptyForm = { licensePlate: "", brand: "", customBrand: "", model: "", customModel: "", color: "" };


function StatusBadge({ status }) {
  if (status === "ACTIVE" || !status) {
    return (
      <Badge className="flex items-center gap-1.5 rounded-full bg-success-container px-3 py-1 text-xs font-bold text-success shadow-sm">
        <CheckCircle2 size={14} className="text-success" /> Đang sử dụng
      </Badge>
    );
  }
  return <Badge className="rounded-full bg-critical-container px-3 py-1 text-xs font-bold text-critical">Đã ngừng sử dụng</Badge>;
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

  const availableModels = useMemo(() => {
    const found = CAR_BRANDS.find((b) => b.brand === formData.brand);
    return found ? found.models : [];
  }, [formData.brand]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    if (name === "brand") {
      setFormData((current) => ({
        ...current,
        brand: value,
        model: "",
        customBrand: "",
        customModel: "",
      }));
    } else if (name === "model") {
      setFormData((current) => ({
        ...current,
        model: value,
        customModel: "",
      }));
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
    }
  }

  function openAddModal() {
    setFormData(emptyForm);
    setErrorMessage("");
    setShowAddModal(true);
  }

  function openEditModal(vehicle) {
    setSelectedVehicle(vehicle);
    const vBrand = vehicle.brand || "";
    const vModel = vehicle.model || "";

    const matchedBrandObj = CAR_BRANDS.find((b) => b.brand.toLowerCase() === vBrand.toLowerCase());
    const brandValue = matchedBrandObj ? matchedBrandObj.brand : vBrand ? "Khác (Hãng khác)" : "";
    const customBrandValue = matchedBrandObj ? "" : vBrand;

    const matchedModels = matchedBrandObj ? matchedBrandObj.models : (CAR_BRANDS.find(b => b.brand === "Khác (Hãng khác)")?.models || []);
    const isModelMatched = matchedModels.some(m => m.toLowerCase() === vModel.toLowerCase());
    const modelValue = isModelMatched ? matchedModels.find(m => m.toLowerCase() === vModel.toLowerCase()) : vModel ? "Khác" : "";
    const customModelValue = isModelMatched ? "" : vModel;

    setFormData({
      licensePlate: vehicle.licensePlate || "",
      brand: brandValue,
      customBrand: customBrandValue,
      model: modelValue,
      customModel: customModelValue,
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
    const finalBrand = formData.brand === "Khác (Hãng khác)" ? (formData.customBrand || "Hãng khác").trim() : formData.brand.trim();
    const finalModel = formData.model === "Khác" ? (formData.customModel || "Dòng khác").trim() : formData.model.trim();
    const licensePlate = formData.licensePlate.trim().toUpperCase();
    const color = formData.color.trim();

    setSuccessMessage("");
    setErrorMessage("");

    if (!licensePlate || !finalBrand || !finalModel) {
      setErrorMessage("Vui lòng nhập biển số, chọn hãng xe và dòng xe.");
      return;
    }

    try {
      await vehicleApi.createVehicle({
        licensePlate,
        brand: finalBrand,
        model: finalModel,
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

    const finalBrand = formData.brand === "Khác (Hãng khác)" ? (formData.customBrand || "Hãng khác").trim() : formData.brand.trim();
    const finalModel = formData.model === "Khác" ? (formData.customModel || "Dòng khác").trim() : formData.model.trim();
    const licensePlate = formData.licensePlate.trim().toUpperCase();
    const color = formData.color.trim();

    setSuccessMessage("");
    setErrorMessage("");

    if (!licensePlate || !finalBrand || !finalModel) {
      setErrorMessage("Vui lòng nhập biển số, chọn hãng xe và dòng xe.");
      return;
    }

    const vehicleId = selectedVehicle.vehicleId || selectedVehicle.id;

    try {
      await vehicleApi.updateVehicle(vehicleId, {
        ...selectedVehicle,
        licensePlate,
        brand: finalBrand,
        model: finalModel,
        color: color || "Chưa cập nhật",
        status: selectedVehicle.status || "ACTIVE",
      });

      await fetchVehicles();
      setShowEditModal(false);
      setSuccessMessage("Đã cập nhật thông tin xe.");
    } catch (error) {
      console.error(error);
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("internal server error") || error?.status === 500) {
        setErrorMessage("Máy chủ gặp lỗi với bản ghi xe cũ này. Bạn vui lòng bấm Xóa xe này, sau đó bấm 'Thêm phương tiện' để tạo lại xe mới là sẽ hoàn tất đặt lịch 100%!");
      } else {
        setErrorMessage(msg || "Không thể cập nhật phương tiện.");
      }
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
    <PageContainer variant="customer">
      <PageHeader
        title="Xe của tôi"
        description="Quản lý danh sách phương tiện để trải nghiệm đặt lịch nhanh và thuận tiện hơn."
        actions={
          <Button size="xl" onClick={openAddModal} className="shadow-cta">
            <Plus />
            Thêm xe mới
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="rounded-2xl bg-primary/10 p-3.5 text-primary">
            <Car size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Tổng phương tiện</p>
            <p className="text-2xl font-black text-foreground">{vehicles.length} xe</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="rounded-2xl bg-success/10 p-3.5 text-success">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Đang sử dụng</p>
            <p className="text-2xl font-black text-foreground">{activeCount} xe</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="rounded-2xl bg-warning/10 p-3.5 text-warning">
            <Calendar size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Lịch gần nhất</p>
            <p className="text-xl font-black text-foreground">{lastServiceLabel}</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/25 bg-success-container/80 p-4 font-semibold text-success shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-critical/25 bg-critical-container p-4 text-center font-semibold text-critical shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Tìm theo biển số, hãng xe hoặc dòng xe..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-12 max-w-md rounded-2xl border-border bg-card px-4 font-medium shadow-sm focus-visible:border-primary focus-visible:ring-primary/20"
        />

        <div className="flex gap-2 rounded-2xl border border-border bg-muted/80 p-1.5">
          {["all", "using"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-5 py-2 font-bold text-sm transition-all ${
                filterStatus === status
                  ? "bg-card text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "Tất cả phương tiện" : "Đang sử dụng"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="rounded-2xl border border-border p-12 text-center shadow-sm">
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
              <Card key={vehicleId} className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white group-hover:scale-105 transition-transform">
                      <Car size={30} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        {formattedBrand} <span className="font-bold text-muted-foreground">{formattedModel}</span>
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block rounded-lg border border-border bg-muted px-3 py-0.5 font-mono text-sm font-bold tracking-wider text-foreground">
                          {vehicle.licensePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>

                <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-surface p-4 border border-border">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Dòng xe</p>
                    <p className="font-bold text-foreground">{formattedModel || "Sedan/SUV"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Màu sơn</p>
                    <p className="font-bold text-foreground">{vehicle.color || "Trắng"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Lần chăm sóc</p>
                    <p className="font-bold text-foreground">{vehicle.lastServiceDate || "Chưa có"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Tổng đặt lịch</p>
                    <p className="font-black text-primary">{vehicle.totalBookings || 0} lần</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={() => navigate("/khach-hang/dat-lich-moi")}
                    className="flex-1"
                  >
                    <Droplets /> Đặt lịch rửa xe ngay
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditModal(vehicle)}
                      title="Sửa thông tin xe"
                      className="text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteModal(vehicle)}
                      title="Xóa xe"
                      className="border-critical/25 text-critical hover:border-critical hover:bg-critical-container hover:text-critical"
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
        <Card className="rounded-2xl border border-border p-12 text-center shadow-sm">
          <div className="mb-4 inline-block rounded-2xl bg-primary/10 p-5">
            <Car size={48} className="text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Bạn chưa có phương tiện nào</h2>
          <p className="mb-6 font-medium text-muted-foreground">
            Thêm xe để đặt lịch rửa xe nhanh hơn và theo dõi lịch sử chăm sóc dễ dàng.
          </p>
          <Button size="xl" onClick={openAddModal} className="shadow-cta">
            <Plus /> Thêm xe mới ngay
          </Button>
        </Card>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-2xl bg-card p-8 shadow-floating">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold leading-tight text-foreground">Thêm xe mới</h2>
              <button type="button" onClick={() => setShowAddModal(false)}>
                <X size={24} className="text-muted-foreground transition hover:text-foreground" />
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Hãng xe <span className="text-critical">*</span></label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleFormChange}
                  className="w-full h-11 rounded-xl border border-border bg-card px-3.5 font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Chọn hãng xe --</option>
                  {CAR_BRANDS.map((item) => (
                    <option key={item.brand} value={item.brand}>{item.brand}</option>
                  ))}
                </select>
                {formData.brand === "Khác (Hãng khác)" && (
                  <Input
                    name="customBrand"
                    value={formData.customBrand || ""}
                    onChange={handleFormChange}
                    placeholder="Nhập tên hãng xe của bạn..."
                    className="mt-2.5 h-11 rounded-xl border-border"
                  />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Dòng xe <span className="text-critical">*</span></label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleFormChange}
                  disabled={!formData.brand}
                  className="w-full h-11 rounded-xl border border-border bg-card px-3.5 font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <option value="">{formData.brand ? "-- Chọn dòng xe --" : "-- Vui lòng chọn hãng xe trước --"}</option>
                  {availableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {formData.model === "Khác" && (
                  <Input
                    name="customModel"
                    value={formData.customModel || ""}
                    onChange={handleFormChange}
                    placeholder="Nhập tên dòng xe của bạn..."
                    className="mt-2.5 h-11 rounded-xl border-border"
                  />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Biển số xe <span className="text-critical">*</span></label>
                <Input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} placeholder="VD: 51A-238.88" className="h-11 rounded-xl border-border font-mono font-semibold" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Màu sơn</label>
                <Input name="color" value={formData.color} onChange={handleFormChange} placeholder="VD: Trắng" className="h-11 rounded-xl border-border" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setShowAddModal(false)} className="flex-1">
                Hủy
              </Button>
              <Button size="lg" onClick={handleAddVehicle} className="flex-1 shadow-cta">
                Thêm xe
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-2xl bg-card p-8 shadow-floating">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold leading-tight text-foreground">Sửa thông tin xe</h2>
              <button type="button" onClick={() => setShowEditModal(false)}>
                <X size={24} className="text-muted-foreground transition hover:text-foreground" />
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Hãng xe <span className="text-critical">*</span></label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleFormChange}
                  className="w-full h-11 rounded-xl border border-border bg-card px-3.5 font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Chọn hãng xe --</option>
                  {CAR_BRANDS.map((item) => (
                    <option key={item.brand} value={item.brand}>{item.brand}</option>
                  ))}
                </select>
                {formData.brand === "Khác (Hãng khác)" && (
                  <Input
                    name="customBrand"
                    value={formData.customBrand || ""}
                    onChange={handleFormChange}
                    placeholder="Nhập tên hãng xe của bạn..."
                    className="mt-2.5 h-11 rounded-xl border-border"
                  />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Dòng xe <span className="text-critical">*</span></label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleFormChange}
                  disabled={!formData.brand}
                  className="w-full h-11 rounded-xl border border-border bg-card px-3.5 font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <option value="">{formData.brand ? "-- Chọn dòng xe --" : "-- Vui lòng chọn hãng xe trước --"}</option>
                  {availableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {formData.model === "Khác" && (
                  <Input
                    name="customModel"
                    value={formData.customModel || ""}
                    onChange={handleFormChange}
                    placeholder="Nhập tên dòng xe của bạn..."
                    className="mt-2.5 h-11 rounded-xl border-border"
                  />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Biển số xe <span className="text-critical">*</span></label>
                <Input name="licensePlate" value={formData.licensePlate} onChange={handleFormChange} className="h-11 rounded-xl border-border font-mono font-semibold" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Màu sơn</label>
                <Input name="color" value={formData.color} onChange={handleFormChange} className="h-11 rounded-xl border-border" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setShowEditModal(false)} className="flex-1">
                Hủy
              </Button>
              <Button size="lg" onClick={handleUpdateVehicle} className="flex-1 shadow-cta">
                Cập nhật
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md rounded-2xl bg-card p-8">
            <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground">Xóa xe?</h2>
            <p className="mb-6 font-medium text-muted-foreground">
              Bạn có chắc chắn muốn xóa xe {selectedVehicle.licensePlate}? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
                Hủy
              </Button>
              <Button onClick={handleDeleteVehicle} className="flex-1 bg-critical text-white hover:bg-critical/90">
                Xóa
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
