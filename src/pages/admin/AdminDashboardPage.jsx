function DashboardCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <p className="text-slate-500 text-sm">{title}</p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>

        <p className="text-slate-500 mt-2">Tổng quan hệ thống AutoWash Pro</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Tổng Booking"
          value="1,245"
          color="text-blue-600"
        />

        <DashboardCard title="Doanh Thu" value="245M" color="text-green-600" />

        <DashboardCard
          title="Thanh Toán Thành Công"
          value="1,180"
          color="text-purple-600"
        />

        <DashboardCard
          title="Khách Hàng Loyalty"
          value="356"
          color="text-orange-600"
        />
      </div>

      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-bold mb-4">Thống kê hệ thống</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Booking hôm nay</span>
            <span className="font-semibold">48</span>
          </div>

          <div className="flex justify-between">
            <span>Xe đang được rửa</span>
            <span className="font-semibold">12</span>
          </div>

          <div className="flex justify-between">
            <span>Đơn hoàn thành</span>
            <span className="font-semibold">35</span>
          </div>

          <div className="flex justify-between">
            <span>Doanh thu hôm nay</span>
            <span className="font-semibold text-green-600">12,500,000 VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
