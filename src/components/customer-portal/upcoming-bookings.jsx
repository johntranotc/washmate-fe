import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";
import { upcomingBookings } from "@/lib/customer-dashboard-data";

const statusColors = {
  "Chờ thanh toán": "bg-yellow-100 text-yellow-800",
  "Đã xác nhận": "bg-blue-100 text-blue-800",
  "Đã check-in": "bg-teal-100 text-teal-800",
  "Đang rửa xe": "bg-purple-100 text-purple-800",
  "Đã hoàn tất": "bg-green-100 text-green-800",
  "Đã hủy": "bg-red-100 text-red-800",
  "Không đến": "bg-gray-100 text-gray-800",
};

export function UpcomingBookings() {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">Lịch đặt sắp tới</h2>
        <p className="font-medium text-muted-foreground">
          Theo dõi các lịch rửa xe gần nhất và trạng thái xử lý của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {upcomingBookings.map((booking) => (
          <Card key={booking.id} className="rounded-2xl border border-border p-6 transition-all hover:shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-bold leading-tight text-foreground">{booking.service}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                  <span className="font-semibold">{booking.vehicle}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {booking.garage}
                  </div>
                </div>
              </div>
              <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Thời gian</p>
                <p className="font-semibold leading-tight text-foreground">{booking.dateTime}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Trạng thái thanh toán</p>
                <p className="font-semibold leading-tight text-foreground">{booking.amount}</p>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="sm" className="font-semibold text-primary hover:bg-secondary">
                  Xem chi tiết <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
