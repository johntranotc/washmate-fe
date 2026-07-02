import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function StatusAndPaymentSection({ bookingStatus = [], paymentMethods = [], topCustomers = [] }) {
  // bookingStatus: { name: 'Chờ xác nhận', value: 28, percentage: 8, color: '#3B82F6' }
  // paymentMethods: { name: 'Tiền mặt', value: 60500000, percentage: 48, color: '#10B981' }
  // topCustomers: { name: 'Nguyễn Văn A', bookings: 18, points: 2450 }

  const totalBookings = bookingStatus.reduce((sum, item) => sum + item.value, 0);
  const totalPayment = paymentMethods.reduce((sum, item) => sum + item.value, 0);

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(val);

  return (
    <div className="grid gap-4 lg:grid-cols-3 mb-6">
      {/* Booking Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-slate-800 mb-4">Tình trạng lịch hẹn</h3>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="w-28 h-28 relative shrink-0">
            {bookingStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bookingStatus} cx="50%" cy="50%" innerRadius="75%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
                      {bookingStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-800">{totalBookings}</span>
                  <span className="text-[9px] text-slate-500 font-semibold leading-none mt-0.5 text-center">Tổng<br/>lịch hẹn</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Trống</div>
            )}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {bookingStatus.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="font-bold text-slate-600 truncate">{item.name}</span>
                </div>
                <div className="font-bold text-slate-800 shrink-0">
                  {item.value} <span className="text-slate-400 font-normal ml-0.5">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-slate-800 mb-4">Phương thức thanh toán</h3>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="w-28 h-28 relative shrink-0">
            {paymentMethods.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius="75%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-black text-slate-800">{formatMoney(totalPayment)}</span>
                  <span className="text-[9px] text-slate-500 font-semibold leading-none mt-0.5 text-center">Tổng<br/>doanh thu</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Trống</div>
            )}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {paymentMethods.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="font-bold text-slate-600 truncate">{item.name}</span>
                </div>
                <div className="font-bold text-slate-800 shrink-0">
                  {formatMoney(item.value)} <span className="text-slate-400 font-normal ml-0.5">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-extrabold text-slate-800">Top khách hàng thân thiết</h3>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
            <span>Khách hàng</span>
            <div className="flex gap-4">
              <span className="w-12 text-right">Lần rửa</span>
              <span className="w-20 text-right">Chi tiêu</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
            {topCustomers.length > 0 ? topCustomers.map((cus, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-300 w-3">{idx + 1}</span>
                  <span className="font-bold text-slate-700 truncate max-w-[100px]">{cus.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-12 text-right font-black text-slate-800">{cus.bookings}</span>
                  <span className="w-20 text-right font-bold text-blue-600">{formatMoney(cus.spend)}</span>
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline mt-4 text-left shrink-0">Xem tất cả khách hàng &gt;</button>
      </div>
    </div>
  );
}
