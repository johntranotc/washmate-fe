function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function CustomerHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Xin chào khách hàng 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Chào mừng bạn đến với AutoWash Pro.
        </p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Phương tiện" value="2" color="text-blue-600" />

        <StatCard title="Booking" value="15" color="text-green-600" />

        <StatCard title="Điểm Loyalty" value="245" color="text-orange-600" />

        <StatCard
          title="Tổng chi tiêu"
          value="2.450.000đ"
          color="text-purple-600"
        />
      </div>

      {/* Booking gần nhất */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Booking gần nhất</h2>

        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span>Premium Wash</span>
            <span className="font-semibold text-green-600">Hoàn thành</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Interior Cleaning</span>
            <span className="font-semibold text-yellow-600">Đang xử lý</span>
          </div>

          <div className="flex justify-between">
            <span>Basic Wash</span>
            <span className="font-semibold text-blue-600">Đã đặt lịch</span>
          </div>
        </div>
      </div>

      {/* Khuyến mãi */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Khuyến mãi nổi bật</h2>

        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="font-semibold text-green-700">Giảm 20% Premium Wash</p>

          <p className="text-sm text-slate-600 mt-1">
            Áp dụng cho khách hàng Loyalty Silver trở lên.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerHomePage;
