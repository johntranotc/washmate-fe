import { Link, Outlet } from "react-router-dom";

function StaffLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">AutoWash Pro</h1>
          <p className="text-sm text-slate-300">Staff Operation Portal</p>
        </div>

        <div className="text-sm text-slate-300">
          Check-in → Washing → Completed
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white border-r border-slate-200 p-4">
          <nav className="space-y-2">
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/staff/bookings"
            >
              Search Booking
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/staff/bookings/1/workflow"
            >
              Workflow Demo
            </Link>
            <div className="mt-4 border-t border-slate-200 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              Nhân viên
            </div>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/nhan-vien"
            >
              Tổng quan
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/nhan-vien/hang-doi"
            >
              Đang xử lý
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/nhan-vien/danh-sach"
            >
              Danh sách lịch đặt
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
