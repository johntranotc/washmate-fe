import { Search, HelpCircle, Settings, UserCircle } from "lucide-react";

export function HomeHeader({ setScreen }) {
  return (
    <header className="home-header">
      <button className="brand-link" onClick={() => setScreen("home")}>
        SparkleAI
      </button>
      <nav>
        <button onClick={() => setScreen("home")}>Trang chủ</button>
        <button onClick={() => setScreen("dashboard")}>Dịch vụ</button>
        <button onClick={() => setScreen("booking")}>Đặt lịch</button>
        <button onClick={() => setScreen("rewards")}>Khách hàng thân thiết</button>
        <button onClick={() => setScreen("insights")}>Gợi ý AI</button>
      </nav>
      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <span>Tìm kiếm dịch vụ...</span>
        </div>
        <button onClick={() => setScreen("login")}>Đăng nhập</button>
        <button className="primary" onClick={() => setScreen("login")}>
          Bắt đầu ngay
        </button>
      </div>
    </header>
  );
}

export function AppTopBar({ setScreen }) {
  return (
    <header className="app-topbar">
      <nav>
        <button onClick={() => setScreen("dashboard")}>Tính năng</button>
        <button className="active" onClick={() => setScreen("booking")}>
          Đặt lịch
        </button>
        <button onClick={() => setScreen("fleet")}>Đội xe</button>
        <button>Hỗ trợ</button>
      </nav>
      <div>
        <HelpCircle size={22} />
        <Settings size={22} />
        <UserCircle size={30} />
      </div>
    </header>
  );
}
