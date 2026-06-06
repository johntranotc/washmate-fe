import { Link, Outlet } from "react-router-dom";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AutoWash Pro</h1>
          <p className="text-sm text-slate-500">Customer Portal</p>
        </div>

        <div className="text-sm text-slate-600">
          Booking → Payment → Invoice → Loyalty
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white border-r border-slate-200 p-4">
          <nav className="space-y-2">
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/customer"
            >
              Home
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/customer/vehicles"
            >
              Vehicles
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/customer/bookings/create"
            >
              Create Booking
            </Link>
            <Link
              className="block px-4 py-2 rounded-lg hover:bg-slate-100"
              to="/customer/loyalty"
            >
              Loyalty
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

export default CustomerLayout;
