import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  {
    label: "Trang chủ",
    path: "/customer",
  },
  {
    label: "Phương tiện",
    path: "/customer/vehicles",
  },
  {
    label: "Tạo đặt lịch",
    path: "/customer/bookings/create",
  },
  {
    label: "Loyalty",
    path: "/customer/loyalty",
  },
];

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-8 py-5">
          <Link to="/customer" className="group">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 group-hover:text-slate-700">
              AutoWash Pro
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Customer Portal
            </p>
          </Link>

          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-600 lg:block">
            Booking → Payment → Invoice → Loyalty
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="hidden min-h-[calc(100vh-89px)] border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/customer"}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-900">Core Flow</p>
            <p className="mt-2 text-xs leading-5 text-blue-700">
              Đặt lịch → Thanh toán → Hóa đơn → Staff xử lý → Loyalty
            </p>
          </div>
        </aside>

        <main className="min-w-0 bg-slate-100 px-5 py-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1180px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;
