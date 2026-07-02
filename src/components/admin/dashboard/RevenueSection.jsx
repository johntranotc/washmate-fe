import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function RevenueSection({ revenueData = [], serviceRevenue = [], branchRevenue = [], showPrevious = false }) {
  // revenueData: { date: '01/05', revenue: 15000000, previousRevenue: 12000000 }
  // serviceRevenue: { name: 'Rửa xe cao cấp', value: 45200000 }
  // branchRevenue: { name: 'Cơ sở chính', revenue: 80000000, bookings: 300, percentage: 65 }

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(val);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];

  const totalServiceRev = serviceRevenue.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
    <div className="grid gap-4 lg:grid-cols-3 mb-6">
      {/* Line Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm col-span-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-slate-800">Doanh thu theo thời gian</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5"><div className="w-4 h-1 bg-blue-500 rounded-full"></div><span className="text-xs text-slate-500 font-semibold">Doanh thu (đ)</span></div>
          {showPrevious && (
            <div className="flex items-center gap-1.5"><div className="w-4 h-0 border-t-2 border-dashed border-slate-400"></div><span className="text-xs text-slate-500 font-semibold">Kỳ trước (đ)</span></div>
          )}
        </div>
        <div className="h-[280px] w-full">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={formatMoney} />
                <RechartsTooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                {showPrevious && (
                  <Line type="monotone" dataKey="previousRevenue" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu doanh thu</div>
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-1 col-span-full flex flex-col">
        <h3 className="font-extrabold text-slate-800 mb-4 shrink-0">Doanh thu theo dịch vụ</h3>
        <div className="flex-1 flex flex-col xl:flex-row items-center gap-6">
          <div className="h-40 w-40 shrink-0 flex items-center justify-center relative">
             {serviceRevenue.length > 0 ? (
               <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceRevenue}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="85%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {serviceRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-800">{formatMoney(totalServiceRev)}</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">Tổng doanh thu</span>
                </div>
              </>
             ) : (
               <div className="text-slate-400 text-sm">Chưa có dữ liệu</div>
             )}
          </div>
          <div className="flex-1 w-full space-y-3">
            {serviceRevenue.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="font-semibold text-slate-600 truncate">{item.name}</span>
                </div>
                <div className="font-bold text-slate-800">
                  {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(item.value)} 
                  <span className="text-slate-400 text-[10px] font-normal ml-1">({Math.round((item.value/totalServiceRev)*100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Branch / chi nhánh revenue breakdown */}
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      <h3 className="font-extrabold text-slate-800 mb-4">Doanh thu theo chi nhánh</h3>
      {branchRevenue.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2 pr-4 font-bold uppercase tracking-wider">Chi nhánh</th>
                <th className="py-2 pr-4 font-bold uppercase tracking-wider text-right">Doanh thu</th>
                <th className="py-2 pr-4 font-bold uppercase tracking-wider text-right">Số lịch hẹn</th>
                <th className="py-2 font-bold uppercase tracking-wider w-1/3">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchRevenue.map((b, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-bold text-slate-700 truncate max-w-[160px]">{b.name}</td>
                  <td className="py-3 pr-4 text-right font-black text-slate-800">
                    {new Intl.NumberFormat("vi-VN").format(b.revenue)} đ
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-slate-600">{b.bookings}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                      </div>
                      <span className="w-9 text-right font-bold text-slate-500">{b.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center text-sm text-slate-400">Chưa có doanh thu theo chi nhánh trong kỳ đã chọn.</div>
      )}
    </div>
    </>
  );
}
