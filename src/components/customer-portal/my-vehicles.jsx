import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ArrowRight, Plus } from "lucide-react";
import { vehicleApi } from "@/api/vehicleApi";

export function MyVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await vehicleApi.getMyVehicles();
        if (Array.isArray(res)) {
          setVehicles(res);
        } else if (res && Array.isArray(res.data)) {
          setVehicles(res.data);
        }
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Xe của tôi</h2>
          <p className="font-medium text-muted-foreground">
            Quản lý các phương tiện của bạn để đặt lịch nhanh hơn.
          </p>
        </div>
        <Button
          onClick={() => navigate("/khach-hang/xe-cua-toi")}
          className="rounded-xl bg-primary px-4 py-2 font-bold text-white shadow-md hover:bg-primary/90"
        >
          <Plus size={18} className="mr-1" /> Quản lý xe
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-muted-foreground">
          Đang tải danh sách phương tiện...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <Car size={36} className="mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="font-semibold text-foreground">Bạn chưa lưu phương tiện nào</p>
          <Button
            variant="link"
            onClick={() => navigate("/khach-hang/xe-cua-toi")}
            className="mt-1 text-primary font-bold"
          >
            Thêm xe ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle, idx) => {
            if (!vehicle || typeof vehicle !== "object") return null;
            return (
              <Card key={vehicle.vehicleId || vehicle.id || idx} className="rounded-2xl border border-border p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Car size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold leading-tight text-foreground">{vehicle.brand || "Xe"}</p>
                      <p className="text-sm font-medium text-muted-foreground">{vehicle.model || "Khách hàng"}</p>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800">Đang sử dụng</Badge>
                </div>

                <div className="space-y-3 border-y border-border py-4">
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Biển số xe</p>
                    <p className="font-semibold leading-tight text-foreground">{vehicle.licensePlate || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Màu sơn</p>
                    <p className="font-semibold leading-tight text-foreground">{vehicle.color || "Không rõ"}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/khach-hang/xe-cua-toi")}
                  className="mt-4 w-full justify-center font-bold text-primary hover:bg-secondary"
                >
                  Xem chi tiết <ArrowRight size={16} />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
