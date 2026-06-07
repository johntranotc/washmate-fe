function NotificationPage() {
  const notifications = [
    {
      id: 1,
      title: "Booking đã được xác nhận",
      message: "Booking #BK001 đã được xác nhận.",
      unread: true,
    },
    {
      id: 2,
      title: "Thanh toán thành công",
      message: "Bạn đã thanh toán thành công 250.000đ.",
      unread: false,
    },
    {
      id: 3,
      title: "Nhận 50 điểm Loyalty",
      message: "Bạn vừa được cộng 50 điểm thưởng.",
      unread: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Thông báo</h1>
        <p className="text-slate-500 mt-2">
          Cập nhật trạng thái booking và chương trình khuyến mãi.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-xl p-4 shadow-sm ${
              item.unread ? "border-blue-300" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{item.title}</h3>

              {item.unread && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  Mới
                </span>
              )}
            </div>

            <p className="text-slate-600 mt-2">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationPage;
