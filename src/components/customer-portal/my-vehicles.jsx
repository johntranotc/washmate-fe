import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ArrowRight } from "lucide-react";
import { userVehicles } from "@/lib/customer-dashboard-data";

export function MyVehicles() {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Xe của tôi</h2>
        <p className="font-medium text-muted-foreground">
          Quản lý các phương tiện của bạn để đặt lịch nhanh hơn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {userVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="rounded-2xl border border-border p-6 transition-all hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Car size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold leading-tight text-foreground">{vehicle.brand}</p>
                  <p className="text-sm font-medium text-muted-foreground">{vehicle.model}</p>
                </div>
              </div>
              <Badge className="rounded-full bg-green-100 text-green-800">{vehicle.status}</Badge>
            </div>

            <div className="space-y-3 border-y border-border py-4">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Biển số xe</p>
                <p className="font-semibold leading-tight text-foreground">{vehicle.licensePlate}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Màu sơn</p>
                <p className="font-semibold leading-tight text-foreground">{vehicle.color}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Lịch gần nhất</p>
                <p className="text-sm font-semibold leading-tight text-foreground">{vehicle.lastService}</p>
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
        ))}
      </div>
    </div>
  );
}
