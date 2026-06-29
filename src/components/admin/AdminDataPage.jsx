import { Eye, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";

const unwrap = (payload) => Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.result || [];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const configs = {
  garages: {
    title: "Quản lý gara", description: "Theo dõi thông tin và trạng thái các cơ sở WashMate.", method: "getGarages",
    columns: [["name", "Tên gara", (v, row) => v ?? row.garageName], ["address", "Địa chỉ"], ["phone", "Số điện thoại"], ["status", "Trạng thái"], ["slotsPerDay", "Slot/ngày"]],
  },
  services: {
    title: "Gói dịch vụ", description: "Danh mục dịch vụ đang cung cấp tại các gara.", method: "getServicePackages",
    columns: [["name", "Tên dịch vụ", (v, row) => v ?? row.serviceName ?? row.servicePackageName], ["price", "Giá", money], ["duration", "Thời lượng", (v, row) => `${v ?? row.durationMinutes ?? 0} phút`], ["garage", "Gara áp dụng", (v, row) => v ?? row.garageName ?? (row.garageId ? `Gara #${row.garageId}` : null)], ["status", "Trạng thái"]],
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
      ["dateTime", "Ngày giờ", (v, row) => v || row.bookingDate || "Chưa cập nhật"],
      ["bookingStatus", "Trạng thái"],
      ["paymentStatus", "Thanh toán"]
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
    (!config.filters || status === "ALL" || item.bookingStatus === status) &&
    (!config.filters || payment === "ALL" || item.paymentStatus === payment)
  ), [config.filters, items, payment, status]);

  const handleView = (row) => {
    alert("Tính năng Xem chi tiết (ID: " + (row.id ?? row.servicePackageId ?? row.serviceId ?? row.garageId ?? "N/A") + ") trên giao diện Quản trị đang được cập nhật!");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p><h1 className="mt-2 text-3xl font-extrabold">{config.title}</h1><p className="mt-2 text-sm text-slate-500">{config.description}</p></div><button onClick={load} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"><RefreshCcw size={14} />Tải lại</button></header>
      
      {config.filters && <section className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4"><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs"><option value="ALL">Tất cả trạng thái</option>{["PENDING","CONFIRMED","CHECKED_IN","WASHING","COMPLETED","CANCELLED","NO_SHOW"].map((value) => <option key={value}>{value}</option>)}</select><select value={payment} onChange={(e) => setPayment(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs"><option value="ALL">Tất cả thanh toán</option><option value="PENDING">Chờ thanh toán</option><option value="PAID">Đã thanh toán</option><option value="REFUNDED">Đã hoàn tiền</option></select></section>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? <p className="py-16 text-center text-sm text-slate-500">Đang tải dữ liệu...</p> : visible.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Chưa có dữ liệu để hiển thị.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{config.columns.map(([, label]) => <th key={label} className="p-4">{label}</th>)}<th className="p-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((row, index) => <tr key={row.id ?? row.servicePackageId ?? row.serviceId ?? row.garageId ?? index}>{config.columns.map(([key, label, format]) => <td key={label} className="p-4">{format ? format(row[key], row) : row[key] ?? "Chưa cập nhật"}</td>)}<td className="p-4"><button onClick={() => handleView(row)} className="inline-flex items-center gap-1 font-bold text-blue-600"><Eye size={13} />Xem</button></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
