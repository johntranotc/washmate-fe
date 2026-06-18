import { useState } from "react";
import { Bell, Globe, Lock, Palette, Save } from "lucide-react";

function Toggle({ label, defaultChecked = false }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between gap-4 py-1 cursor-pointer select-none">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? "bg-violet-600" : "bg-slate-200"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

const notifications = [
  { label: "Thông báo đặt lịch mới", defaultChecked: true },
  { label: "Thông báo thanh toán thành công", defaultChecked: true },
  { label: "Thông báo hủy lịch", defaultChecked: true },
  { label: "Báo cáo doanh thu hàng ngày (email)", defaultChecked: false },
  { label: "Cảnh báo hệ thống", defaultChecked: true },
];

const systemFields = [
  { label: "Tên hệ thống", value: "WashMate", type: "text" },
  { label: "Tên miền", value: "washmate.vn", type: "text" },
  { label: "Email liên hệ", value: "admin@washmate.vn", type: "email" },
  { label: "Hotline", value: "1800-WASH", type: "text" },
];

const securityFields = [
  { label: "Mật khẩu hiện tại", type: "password" },
  { label: "Mật khẩu mới", type: "password" },
  { label: "Xác nhận mật khẩu mới", type: "password" },
];

const loyaltyFields = [
  { label: "Điểm tích / 10.000 đ chi tiêu", value: "1", unit: "điểm" },
  { label: "Ngưỡng hạng Silver", value: "1.000", unit: "điểm" },
  { label: "Ngưỡng hạng Gold", value: "3.000", unit: "điểm" },
  { label: "Ngưỡng hạng Platinum", value: "6.000", unit: "điểm" },
];

function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-violet-600">Hệ thống</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-400">Quản lý cấu hình chung của hệ thống WashMate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Thông tin hệ thống */}
        <SectionCard icon={Globe} iconBg="bg-blue-500/15" iconColor="text-blue-600" title="Thông tin hệ thống">
          <div className="space-y-4">
            {systemFields.map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Thông báo */}
        <SectionCard icon={Bell} iconBg="bg-amber-500/15" iconColor="text-amber-600" title="Thông báo hệ thống">
          <div className="space-y-3 divide-y divide-slate-50">
            {notifications.map((n) => (
              <div key={n.label} className="pt-3 first:pt-0">
                <Toggle label={n.label} defaultChecked={n.defaultChecked} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Bảo mật */}
        <SectionCard icon={Lock} iconBg="bg-emerald-500/15" iconColor="text-emerald-600" title="Bảo mật">
          <div className="space-y-4">
            {securityFields.map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition"
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Điểm thành viên */}
        <SectionCard icon={Palette} iconBg="bg-violet-500/15" iconColor="text-violet-600" title="Cấu hình điểm thành viên">
          <div className="space-y-4">
            {loyaltyFields.map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={f.value}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition"
                  />
                  <span className="text-sm font-semibold text-slate-400 shrink-0">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Save button */}
      <div className="flex justify-end pb-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 transition-all"
        >
          <Save size={16} />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
