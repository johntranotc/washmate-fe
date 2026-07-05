import { Eye, RefreshCcw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

const unwrap = (payload) => Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.result || [];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const bookingLabels = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  WASHING: "Đang rửa xe",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
  NO_SHOW: "Không đến",
};

const paymentLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const configs = {
  garages: {
    title: "Quản lý gara", description: "Theo dõi thông tin và trạng thái các cơ sở WashMate.", method: "getGarages",
    columns: [["name", "Tên gara", (v, row) => v ?? row.garageName], ["address", "Địa chỉ"], ["phone", "Số điện thoại"], ["status", "Trạng thái", (v) => v === "ACTIVE" ? "Hoạt động" : v === "INACTIVE" ? "Tạm ngưng" : v], ["slotsPerDay", "Slot/ngày"]],
  },
  services: {
    title: "Gói dịch vụ", description: "Danh mục dịch vụ đang cung cấp tại các gara.", method: "getServicePackages",
    columns: [["name", "Tên dịch vụ", (v, row) => v ?? row.serviceName ?? row.servicePackageName], ["price", "Giá", money], ["duration", "Thời lượng", (v, row) => `${v ?? row.durationMinutes ?? 0} phút`], ["garage", "Gara áp dụng", (v, row) => v ?? row.garageName ?? (row.garageId ? `Gara #${row.garageId}` : null)], ["status", "Trạng thái", (v) => v === "ACTIVE" ? "Hoạt động" : v === "INACTIVE" ? "Tạm ngưng" : v]],
  },
  slots: {
    title: "Khung giờ phục vụ", description: "Theo dõi sức chứa và tình trạng đặt chỗ.", method: "getSlots",
    columns: [["garage", "Gara"], ["date", "Ngày"], ["startTime", "Bắt đầu"], ["endTime", "Kết thúc"], ["capacity", "Sức chứa"], ["booked", "Đã đặt"], ["availability", "Tình trạng", (_, row) => row.booked >= row.capacity ? "Đã đầy" : "Còn chỗ"]],
  },
  bookings: {
    title: "Tổng quan lịch đặt", description: "Theo dõi booking trên toàn hệ thống.", method: "getBookings",
    columns: [
      ["code", "Mã booking", (v, row) => v || row.bookingCode],
      ["customer", "Khách hàng", (v, row) => v?.fullName || v?.name || v?.email || row.customerName || "Khách"],
      ["garage", "Gara", (v, row) => v?.name || v?.garageName || row.garageName || `Gara #${row.garageId}`],
      ["service", "Dịch vụ", (v, row) => v?.name || v?.serviceName || row.serviceName || "Dịch vụ"],
      ["dateTime", "Ngày giờ hẹn", (v, row) => {
        const date = row.bookingDate;
        const time = (row.slot?.startTime || row.slotTime || "").slice(0, 5);
        if (!date) return "Chưa cập nhật";
        return time ? `${date} - ${time}` : date;
      }],
      ["status", "Trạng thái", (v) => bookingLabels[v] || v || "Chưa cập nhật"],
      ["payment", "Thanh toán", (v, row) => {
        const stat = row.payment?.status || row.paymentStatus;
        return paymentLabels[stat] || stat || "Chưa cập nhật";
      }]
    ],
    filters: true,
  },
  payments: {
    title: "Tổng quan thanh toán", description: "Danh sách giao dịch đã được hệ thống ghi nhận.", method: "getPayments",
    columns: [
      ["id", "Mã payment"],
      ["bookingCode", "Mã booking"],
      ["customer", "Khách hàng", (v, row) => v?.fullName || v?.name || v?.email || row.customerName || "Khách"],
      ["amount", "Số tiền", money],
      ["method", "Phương thức"],
      ["status", "Trạng thái"],
      ["paidAt", "Ngày thanh toán"]
    ],
  },
  invoices: {
    title: "Tổng quan hóa đơn", description: "Theo dõi hóa đơn đã phát hành từ backend.", method: "getInvoices",
    columns: [
      ["invoiceCode", "Mã hóa đơn", (v, row) => v || `#INV-${row.id}`],
      ["bookingId", "ID Booking", (v) => v ? `#${v}` : "N/A"],
      ["garageId", "Gara", (v) => v ? `Gara #${v}` : "N/A"],
      ["totalAmount", "Tổng tiền", money],
      ["status", "Trạng thái", (v) => {
        if(v === "ISSUED") return "Đã phát hành";
        if(v === "PAID") return "Đã thanh toán";
        if(v === "CANCELLED") return "Đã hủy";
        return v || "Chưa rõ";
      }],
      ["issuedAt", "Ngày phát hành", (v) => v ? new Date(v).toLocaleString("vi-VN") : "Chưa rõ"]
    ],
  },
};

export default function AdminDataPage({ type }) {
  const config = configs[type];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");

  const load = () => {
    setLoading(true);
    adminApi[config.method]().then((response) => {
      setItems(unwrap(response));
      
    }).catch(() => {
      setItems([]);
      
    }).finally(() => setLoading(false));
  };

  useEffect(load, [type]);

  const visible = useMemo(() => items.filter((item) =>
    (!config.filters || status === "ALL" || (item.bookingStatus || item.status) === status) &&
    (!config.filters || payment === "ALL" || (item.paymentStatus || item.payment?.status) === payment)
  ).sort((a, b) => {
    // Sort by id descending (newest first)
    const idA = Number(a.id || a.bookingId || a.garageId || a.serviceId || a.slotId || 0);
    const idB = Number(b.id || b.bookingId || b.garageId || b.serviceId || b.slotId || 0);
    return idB - idA;
  }), [config.filters, items, payment, status]);

  const handleView = (row) => {
    const id = row.id ?? row.servicePackageId ?? row.serviceId ?? row.garageId ?? "N/A";
    toast.info(`Tính năng Xem chi tiết (ID: ${id}) đang được cập nhật.`);
  };

  const handleCancel = async (row) => {
    const id = row.id ?? row.bookingId;
    const confirmed = await confirmDialog({
      title: "Hủy booking này?",
      description: `Booking #${id} sẽ chuyển sang trạng thái CANCELLED.`,
      confirmLabel: "Hủy booking",
      cancelLabel: "Giữ lại",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await adminApi.cancelBooking(id);
      toast.success(`Đã hủy booking #${id}.`);
      load();
    } catch (err) {
      toast.error("Lỗi khi hủy booking", { description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị WashMate"
        title={config.title}
        description={config.description}
        actions={<Button variant="outline" size="sm" onClick={load} className="text-xs"><RefreshCcw />Tải lại</Button>}
      />
      
      {config.filters && <section className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4"><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-border px-3 py-2 text-xs"><option value="ALL">Tất cả trạng thái</option>{["PENDING","CONFIRMED","CHECKED_IN","WASHING","COMPLETED","CANCELLED","NO_SHOW"].map((value) => <option key={value}>{value}</option>)}</select><select value={payment} onChange={(e) => setPayment(e.target.value)} className="rounded-xl border border-border px-3 py-2 text-xs"><option value="ALL">Tất cả thanh toán</option><option value="PENDING">Chờ thanh toán</option><option value="PAID">Đã thanh toán</option><option value="REFUNDED">Đã hoàn tiền</option></select></section>}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? <p className="py-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu...</p> : visible.length === 0 ? <EmptyState className="border-0 bg-transparent" icon={Eye} title="Chưa có dữ liệu để hiển thị" description="Thử đổi bộ lọc hoặc bấm Tải lại." /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-surface text-xs font-semibold text-muted-foreground"><tr>{config.columns.map(([, label]) => <th key={label} className="p-4">{label}</th>)}<th className="p-4">Thao tác</th></tr></thead><tbody className="divide-y divide-border">{visible.map((row, index) => <tr key={row.id ?? row.servicePackageId ?? row.serviceId ?? row.garageId ?? index}>{config.columns.map(([key, label, format]) => <td key={label} className="p-4">{format ? format(row[key], row) : row[key] ?? "Chưa cập nhật"}</td>)}<td className="p-4"><div className="flex items-center gap-4"><button onClick={() => handleView(row)} className="inline-flex items-center gap-1 font-bold text-primary"><Eye size={14} />Xem</button>{type === "bookings" && row.bookingStatus !== "CANCELLED" && (<button onClick={() => handleCancel(row)} className="inline-flex items-center gap-1 font-bold text-critical"><XCircle size={14} />Hủy</button>)}</div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
