import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="bg-slate-900 text-white p-10 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold">AutoWash Pro</h1>
            <p className="mt-4 text-slate-300">
              Smart Automated Car Wash Management System
            </p>
          </div>

          <div className="mt-10">
            <p className="text-sm text-slate-300">
              Advance Booking • Payment & Invoice • Loyalty Program
            </p>
          </div>
        </div>

        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
