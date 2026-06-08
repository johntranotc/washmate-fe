import {
  Grid2X2,
  CalendarDays,
  BrainCircuit,
  Trophy,
  Bell,
  Car,
  Zap,
} from "lucide-react";

const menu = [
  { id: "dashboard", label: "Bảng điều khiển", icon: Grid2X2 },
  { id: "booking", label: "Đặt lịch", icon: CalendarDays },
  { id: "fleet", label: "Đội xe", icon: Car },
  { id: "insights", label: "Gợi ý AI", icon: BrainCircuit },
  { id: "rewards", label: "Ưu đãi", icon: Trophy },
  { id: "staff", label: "Vận hành", icon: Bell },
];

export default function Sidebar({ active, setScreen }) {
  return (
    <aside className="sidebar">
      <div>
        <button className="side-brand" onClick={() => setScreen("home")}>
          SparkleAI
          <span>Gói Doanh nghiệp</span>
        </button>

        <nav className="side-menu">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={active === item.id ? "active" : ""}
                onClick={() => setScreen(item.id)}
              >
                <Icon size={21} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="side-bottom">
        <button className="upgrade">
          <Zap size={18} />
          Nâng cấp gói
        </button>
        <div className="side-user">
          <div className="avatar">PM</div>
          <div>
            <strong>Phạm Minh</strong>
            <span>Quản trị viên</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
