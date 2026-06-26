import { Building2, PackagePlus, ScrollText, UsersRound } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../state/AppStore";

const tabs = [
  ["USERS", "Người dùng và vai trò", UsersRound],
  ["GARAGES", "Cơ sở", Building2],
  ["SERVICES", "Gói dịch vụ", PackagePlus],
  ["AUDIT", "Nhật ký kiểm toán", ScrollText],
];

const roleLabels = {
  CUSTOMER: "Khách hàng",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const actionLabels = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  PAYMENT: "Thanh toán",
  PAY: "Thanh toán",
  CANCEL: "Hủy lịch",
  STATUS_CHANGE: "Đổi trạng thái",
  ROLE_CHANGE: "Đổi vai trò",
  REDEEM: "Đổi quà",
};

const entityLabels = {
  BOOKING: "Lịch đặt",
  USER: "Người dùng",
  GARAGE: "Cơ sở",
  SERVICE: "Dịch vụ",
  LOYALTY: "Điểm thưởng",
};

function AdminManagementPage() {
  const { state, actions } = useAppStore();
  const [tab, setTab] = useState("USERS");
  const [garage, setGarage] = useState({ name: "", address: "" });
  const [service, setService] = useState({
    name: "",
    price: "",
    duration: "",
  });

  function submitGarage(event) {
    event.preventDefault();
    if (!garage.name) return;
    actions.addGarage(garage);
    setGarage({ name: "", address: "" });
  }

  function submitService(event) {
    event.preventDefault();
    if (!service.name) return;
    actions.addService({
      ...service,
      price: Number(service.price),
      duration: Number(service.duration),
    });
    setService({ name: "", price: "", duration: "" });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">Quản trị hệ thống</h1>
        <p className="mt-2 text-xs text-slate-500">
          Quản lý người dùng, phạm vi cơ sở, danh mục dịch vụ và lịch sử kiểm toán.
        </p>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        {tabs.map(([value, label, Icon]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-[10px] font-bold ${
              tab === value ? "bg-blue-600 text-white" : "text-slate-500"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      {tab === "USERS" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[9px] uppercase text-slate-500">
              <tr>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Thư điện tử</th>
                <th className="p-4">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.users.map((user) => (
                <tr key={user.id}>
                  <td className="p-4 font-bold">{user.name}</td>
                  <td className="p-4 text-slate-500">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        actions.toggleUserRole(user.id, event.target.value)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-[10px]"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "GARAGES" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            {state.garages.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <b>{item.name}</b>
                <p className="mt-2 text-xs text-slate-500">{item.address}</p>
              </article>
            ))}
          </section>
          <form
            onSubmit={submitGarage}
            className="h-fit rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-extrabold">Thêm cơ sở</h2>
            <input
              value={garage.name}
              onChange={(event) =>
                setGarage({ ...garage, name: event.target.value })
              }
              placeholder="Tên cơ sở"
              className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <input
              value={garage.address}
              onChange={(event) =>
                setGarage({ ...garage, address: event.target.value })
              }
              placeholder="Địa chỉ"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <button className="mt-4 h-10 w-full rounded-lg bg-blue-600 text-xs font-bold text-white">
              Tạo cơ sở
            </button>
          </form>
        </div>
      )}

      {tab === "SERVICES" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="grid gap-3 sm:grid-cols-2">
            {state.services.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <b>{item.name}</b>
                <p className="mt-3 text-xl font-extrabold text-blue-600">
                  {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {item.duration} phút
                </p>
              </article>
            ))}
          </section>
          <form
            onSubmit={submitService}
            className="h-fit rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-extrabold">Thêm gói dịch vụ</h2>
            <input
              value={service.name}
              onChange={(event) =>
                setService({ ...service, name: event.target.value })
              }
              placeholder="Tên gói dịch vụ"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <input
              type="number"
              value={service.price}
              onChange={(event) =>
                setService({ ...service, price: event.target.value })
              }
              placeholder="Giá dịch vụ"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <input
              type="number"
              value={service.duration}
              onChange={(event) =>
                setService({ ...service, duration: event.target.value })
              }
              placeholder="Thời lượng (phút)"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <button className="mt-4 h-10 w-full rounded-lg bg-blue-600 text-xs font-bold text-white">
              Tạo gói dịch vụ
            </button>
          </form>
        </div>
      )}

      {tab === "AUDIT" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {state.auditLogs.length ? (
              state.auditLogs.map((log) => (
                <article
                  key={log.id}
                  className="grid gap-2 p-4 text-xs md:grid-cols-[130px_110px_1fr_180px]"
                >
                  <b className="text-blue-600">
                    {actionLabels[log.action] || log.action}
                  </b>
                  <span>
                    {entityLabels[log.entity] || log.entity} #{log.entityId}
                  </span>
                  <span className="text-slate-500">{log.detail}</span>
                  <time className="text-[9px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </time>
                </article>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-slate-400">
                Chưa có sự kiện kiểm toán.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminManagementPage;
