import { Building2, PackagePlus, ScrollText, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { servicePackageApi } from "../../api/servicePackageApi";

const tabs = [
  ["USERS", "Người dùng", UsersRound],
  ["GARAGES", "Cơ sở", Building2],
  ["SERVICES", "Gói dịch vụ", PackagePlus],
  ["AUDIT", "Nhật ký", ScrollText],
];

function AdminManagementPage() {
  const [tab, setTab] = useState("USERS");

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Garages
  const [garages, setGarages] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(false);
  const [newGarage, setNewGarage] = useState({ name: "", address: "" });
  const [savingGarage, setSavingGarage] = useState(false);

  // Services
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedGarageId, setSelectedGarageId] = useState("");

  useEffect(() => {
    if (tab === "USERS" && users.length === 0) {
      setLoadingUsers(true);
      adminApi.getAllUsers({ page: 0, size: 50 })
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.content ?? [];
          setUsers(list);
        })
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
    if (tab === "GARAGES" && garages.length === 0) {
      setLoadingGarages(true);
      garageApi.getAll()
        .then((data) => {
          const actualData = data?.data ? data.data : data;
          setGarages(Array.isArray(actualData) ? actualData : [])
        })
        .catch(() => setGarages([]))
        .finally(() => setLoadingGarages(false));
    }
    if (tab === "SERVICES") {
      setLoadingServices(true);
      // load garages first if needed, then load services for first garage
      const doLoad = garages.length > 0
        ? Promise.resolve(garages)
        : garageApi.getAll().then((d) => { 
            const actualData = d?.data ? d.data : d;
            const g = Array.isArray(actualData) ? actualData : []; 
            setGarages(g); 
            return g; 
          });
      doLoad.then((g) => {
        const firstId = g[0]?.id ?? g[0]?.garageId;
        const gid = selectedGarageId || firstId;
        if (!gid) { setServices([]); return; }
        if (!selectedGarageId && firstId) setSelectedGarageId(String(firstId));
        return servicePackageApi.getAll(gid).then((s) => {
          const actualS = s?.data ? s.data : s;
          setServices(Array.isArray(actualS) ? actualS : [])
        });
      }).catch(() => setServices([]))
        .finally(() => setLoadingServices(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function loadServices(garageId) {
    setLoadingServices(true);
    setSelectedGarageId(String(garageId));
    servicePackageApi.getAll(garageId)
      .then((s) => {
        const actualS = s?.data ? s.data : s;
        setServices(Array.isArray(actualS) ? actualS : [])
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }

  async function submitGarage(event) {
    event.preventDefault();
    if (!newGarage.name.trim()) return;
    setSavingGarage(true);
    try {
      const created = await garageApi.create(newGarage);
      setGarages((prev) => [...prev, created]);
      setNewGarage({ name: "", address: "" });
    } catch (err) {
      alert(err?.message || "Không thể tạo gara. Vui lòng thử lại.");
    } finally {
      setSavingGarage(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">Quản trị hệ thống</h1>
        <p className="mt-2 text-xs text-slate-500">
          Quản lý người dùng, phạm vi cơ sở, danh mục dịch vụ.
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

      {/* USERS */}
      {tab === "USERS" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loadingUsers ? (
            <p className="py-12 text-center text-sm text-slate-500">Đang tải danh sách người dùng...</p>
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu người dùng.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[9px] uppercase text-slate-500">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="p-4 font-bold">{user.fullName ?? user.name ?? "–"}</td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4">{(user.roles ?? []).join(", ") || "–"}</td>
                    <td className="p-4">{user.status ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* GARAGES */}
      {tab === "GARAGES" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            {loadingGarages ? (
              <p className="py-10 text-center text-sm text-slate-500">Đang tải danh sách gara...</p>
            ) : garages.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có gara nào.</p>
            ) : (
              garages.map((item) => (
                <article key={item.id ?? item.garageId} className="rounded-xl border border-slate-200 bg-white p-5">
                  <b>{item.name ?? item.garageName}</b>
                  <p className="mt-2 text-xs text-slate-500">{item.address ?? item.location ?? "–"}</p>
                  {item.phone && <p className="mt-1 text-xs text-slate-400">📞 {item.phone}</p>}
                </article>
              ))
            )}
          </section>
          <form onSubmit={submitGarage} className="h-fit rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-extrabold">Thêm cơ sở mới</h2>
            <input
              value={newGarage.name}
              onChange={(e) => setNewGarage({ ...newGarage, name: e.target.value })}
              placeholder="Tên cơ sở"
              required
              className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <input
              value={newGarage.address}
              onChange={(e) => setNewGarage({ ...newGarage, address: e.target.value })}
              placeholder="Địa chỉ"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs"
            />
            <button
              disabled={savingGarage}
              className="mt-4 h-10 w-full rounded-lg bg-blue-600 text-xs font-bold text-white disabled:bg-slate-300"
            >
              {savingGarage ? "Đang tạo..." : "Tạo cơ sở"}
            </button>
          </form>
        </div>
      )}

      {/* SERVICES */}
      {tab === "SERVICES" && (
        <div className="space-y-4">
          {garages.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600">Lọc theo gara:</label>
              <select
                value={selectedGarageId}
                onChange={(e) => loadServices(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                {garages.map((g) => (
                  <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>{g.name ?? g.garageName}</option>
                ))}
              </select>
            </div>
          )}
          <section className="grid gap-3 sm:grid-cols-2">
            {loadingServices ? (
              <p className="col-span-2 py-10 text-center text-sm text-slate-500">Đang tải gói dịch vụ...</p>
            ) : services.length === 0 ? (
              <p className="col-span-2 py-10 text-center text-sm text-slate-400">Chưa có gói dịch vụ nào.</p>
            ) : (
              services.map((item) => (
                <article key={item.id ?? item.serviceId ?? item.servicePackageId} className="rounded-xl border border-slate-200 bg-white p-5">
                  <b>{item.name ?? item.serviceName ?? item.servicePackageName}</b>
                  <p className="mt-3 text-xl font-extrabold text-blue-600">
                    {new Intl.NumberFormat("vi-VN").format(item.price ?? 0)} đ
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{item.duration ?? item.durationMinutes ?? 0} phút</p>
                  {item.description && <p className="mt-2 text-xs text-slate-400">{item.description}</p>}
                </article>
              ))
            )}
          </section>
        </div>
      )}

      {/* AUDIT */}
      {tab === "AUDIT" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <p className="p-8 text-center text-xs text-slate-400">
            Nhật ký kiểm toán chưa có endpoint tại BE.
          </p>
        </section>
      )}
    </div>
  );
}

export default AdminManagementPage;
