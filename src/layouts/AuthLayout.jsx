import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        <div className="flex flex-col justify-between bg-blue-700 p-10 text-white">
          <div>
            <h1 className="text-3xl font-bold">AquaSmart Pro</h1>
            <p className="mt-4 text-blue-100">
              Hệ thống quản lý rửa xe tự động thông minh
            </p>
          </div>
          <p className="mt-10 text-sm text-blue-100">
            Đặt lịch trước • Thanh toán và hóa đơn • Khách hàng thân thiết
          </p>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
