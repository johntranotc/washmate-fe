import { useEffect, useState } from "react";
import { vehicleApi } from "./api/vehicleApi";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  Droplets,
  Eye,
  Gift,
  Grid2X2,
  HelpCircle,
  Lock,
  Mail,
  Medal,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Trophy,
  UserCircle,
  Users,
  WalletCards,
  Wrench,
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

const rewardItems = [
  [
    "Giảm giá 20%",
    "Áp dụng cho mọi gói chăm sóc xe trong tháng này.",
    "1.200 điểm",
  ],
  ["Rửa xe miễn phí", "Gói chăm sóc cao cấp tại trạm đối tác.", "2.500 điểm"],
  [
    "Nâng cấp gói cao cấp",
    "Dùng thử 1 tháng phân tích lộ trình bằng AI.",
    "4.000 điểm",
  ],
  [
    "Dịch vụ bổ sung",
    "Hỗ trợ khẩn cấp tận nơi và bảo hiểm mở rộng.",
    "1.800 điểm",
  ],
];

const bookingHistory = [
  {
    id: "BK-2406-018",
    car: "Tesla Model Y",
    plate: "51H - 999.99",
    service: "Rửa xe cao cấp + phủ bóng nhanh",
    date: "11/06/2026",
    time: "14:30",
    station: "Trạm SparkleAI Quận 1",
    price: "420.000đ",
    status: "Sắp tới",
  },
  {
    id: "BK-2406-012",
    car: "Mercedes-Benz S-Class",
    plate: "30A - 888.88",
    service: "Rửa xe nhanh",
    date: "09/06/2026",
    time: "09:00",
    station: "Trạm SparkleAI Thủ Đức",
    price: "180.000đ",
    status: "Hoàn tất",
  },
  {
    id: "BK-2405-209",
    car: "Porsche Taycan 4S",
    plate: "30A - 888.88",
    service: "Khử khuẩn ozone + vệ sinh nội thất",
    date: "28/05/2026",
    time: "16:00",
    station: "Trạm SparkleAI Quận 7",
    price: "650.000đ",
    status: "Hoàn tất",
  },
  {
    id: "BK-2405-144",
    car: "Tesla Model Y",
    plate: "51H - 999.99",
    service: "Phủ Ceramic bảo vệ sơn",
    date: "16/05/2026",
    time: "10:00",
    station: "Trạm SparkleAI Quận 3",
    price: "1.200.000đ",
    status: "Đã hủy",
  },
];

function Pill({ children, blue }) {
  return <span className={blue ? "pill blue-pill" : "pill"}>{children}</span>;
}

function StatCard({ title, value, note, icon: Icon }) {
  return (
    <article className="stat-card">
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{note}</span>
      </div>
      <Icon size={23} />
    </article>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>SparkleAI</strong>
        <p>© 2024 Công ty Công nghệ SparkleAI. Đã đăng ký bản quyền.</p>
      </div>
      <nav>
        <button>Chính sách bảo mật</button>
        <button>Điều khoản dịch vụ</button>
        <button>Tài liệu API</button>
        <button>Liên hệ</button>
      </nav>
    </footer>
  );
}

function Sidebar({ active, setScreen }) {
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
        <button className="upgrade" onClick={() => setScreen("rewards")}>
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

function Shell({ active, setScreen, children, topbar }) {
  return (
    <div className="shell">
      <Sidebar active={active} setScreen={setScreen} />
      <main className="main">
        {topbar && (
          <header className="topbar">
            <nav>
              <button onClick={() => setScreen("dashboard")}>Tính năng</button>
              <button
                className={active === "booking" ? "active" : ""}
                onClick={() => setScreen("booking")}
              >
                Đặt lịch
              </button>
              <button onClick={() => setScreen("fleet")}>Đội xe</button>
              <button onClick={() => setScreen("staff")}>Hỗ trợ</button>
            </nav>
            <div>
              <HelpCircle />
              <Settings />
              <UserCircle />
            </div>
          </header>
        )}
        <div className="page">{children}</div>
        <Footer />
      </main>
    </div>
  );
}

function Home({ setScreen }) {
  return (
    <div className="home">
      <header className="home-header">
        <button className="brand" onClick={() => setScreen("home")}>
          SparkleAI
        </button>
        <nav>
          <button onClick={() => setScreen("home")}>Trang chủ</button>
          <button onClick={() => setScreen("dashboard")}>Dịch vụ</button>
          <button onClick={() => setScreen("booking")}>Đặt lịch</button>
          <button onClick={() => setScreen("rewards")}>
            Khách hàng thân thiết
          </button>
          <button onClick={() => setScreen("insights")}>Gợi ý AI</button>
        </nav>
        <div className="home-actions">
          <div className="search">
            <Search size={18} /> Tìm kiếm dịch vụ...
          </div>
          <button onClick={() => setScreen("login")}>Đăng nhập</button>
          <button className="primary" onClick={() => setScreen("login")}>
            Bắt đầu ngay
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <Pill>Đột phá công nghệ 2024</Pill>
          <h1>Hệ thống rửa xe thông minh ứng dụng AI</h1>
          <p>
            Đặt lịch nhanh chóng, quản lý điểm thành viên thông minh và cá nhân
            hóa trải nghiệm chăm sóc xe cho người Việt.
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={() => setScreen("booking")}>
              Đặt lịch ngay
            </button>
            <button onClick={() => setScreen("rewards")}>
              Khám phá ưu đãi
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="wash-scene">
            <div className="car-shape" />
            <span className="light-left" />
            <span className="light-right" />
          </div>
          <div className="floating-status">
            <Sparkles />
            <div>
              <span>Trạng thái hệ thống</span>
              <strong>Hoạt động tốt</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Tính năng thông minh</h2>
        <p>Sức mạnh của trí tuệ nhân tạo giúp nâng tầm dịch vụ chăm sóc xe.</p>
        <div className="feature-grid">
          <Feature
            title="Đặt lịch thông minh"
            icon={CalendarDays}
            text="Tự động đề xuất khung giờ phù hợp dựa trên dữ liệu thời gian thực."
          />
          <Feature
            title="Ưu đãi thành viên"
            icon={Trophy}
            text="Tích điểm, đổi quà và nhận ưu đãi cá nhân hóa."
          />
          <Feature
            title="Vào trạm nhanh"
            icon={CheckCircle2}
            text="Nhận diện biển số bằng AI, không cần xếp hàng lâu."
          />
          <Feature
            title="Phân hạng khách hàng"
            icon={ShieldCheck}
            text="Hạng Bạc, Vàng, Bạch kim và Kim cương với đặc quyền riêng."
          />
          <Feature
            title="Đặt lịch bằng mã QR"
            icon={QrCode}
            text="Quét mã QR tại trạm để kích hoạt dịch vụ ngay lập tức."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Feature({ title, icon: Icon, text }) {
  return (
    <article className="feature-card">
      <span>
        <Icon />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <button>
        Khám phá thêm <ArrowRight size={16} />
      </button>
    </article>
  );
}

function Login({ setScreen }) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setMessage("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.message === "Invalid credentials") {
          setMessage("Sai email hoặc mật khẩu. Vui lòng thử lại.");
        } else if (data?.message === "Authentication required") {
          setMessage(
            "Lỗi xác thực: cấu hình API hoặc security của BE chưa đúng (Authentication required).",
          );
        } else {
          setMessage(
            data?.message ||
              "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.",
          );
        }
        return;
      }

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      const user = data?.user || data?.currentUser;

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }

      setScreen("dashboard");
    } catch (error) {
      setMessage(
        "Không thể kết nối tới máy chủ BE. Hãy kiểm tra BE đã chạy ở port 8080 chưa.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !registerForm.fullName.trim() ||
      !registerForm.email.trim() ||
      !registerForm.phone.trim() ||
      !registerForm.password.trim()
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin đăng ký.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: registerForm.fullName.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(
          data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
        );
        return;
      }

      setMessage("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
      setMode("login");
      setLoginForm({
        email: registerForm.email,
        password: "",
      });
    } catch (error) {
      setMessage(
        "Không thể kết nối tới máy chủ BE. Hãy kiểm tra BE đã chạy ở port 8080 chưa.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="glow green" />
      <div className="glow blue" />

      <section className="login-panel">
        <div className="logo">
          <Sparkles />
        </div>

        <h1>SparkleAI</h1>
        <p>Nâng tầm quản lý dịch vụ rửa xe bằng trí tuệ nhân tạo</p>

        <div className="login-card">
          <div className="tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Đăng nhập
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Đăng ký
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <label>Email hoặc số điện thoại</label>
              <div className="field">
                <Mail size={20} className="field-icon" />
                <input
                  type="text"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <label>
                Mật khẩu
                <button
                  type="button"
                  onClick={() =>
                    setMessage("Chức năng quên mật khẩu sẽ được bổ sung sau.")
                  }
                >
                  Quên mật khẩu?
                </button>
              </label>

              <div className="field">
                <Lock size={20} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <Eye size={20} />
                </button>
              </div>

              {message && <div className="form-message">{message}</div>}

              <button className="primary full" type="submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
              </button>

              <div className="divider">Hoặc tiếp tục với</div>

              <button
                type="button"
                className="google"
                onClick={() =>
                  setMessage(
                    "Đăng nhập Google chưa được tích hợp trong phạm vi hiện tại.",
                  )
                }
              >
                Đăng nhập với Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <label>Họ và tên</label>
              <div className="field">
                <UserCircle size={20} className="field-icon" />
                <input
                  type="text"
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterChange}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                />
              </div>

              <label>Email</label>
              <div className="field">
                <Mail size={20} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <label>Số điện thoại</label>
              <div className="field">
                <UserCircle size={20} className="field-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                  placeholder="0912345678"
                  autoComplete="tel"
                />
              </div>

              <label>Mật khẩu</label>
              <div className="field">
                <Lock size={20} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <Eye size={20} />
                </button>
              </div>

              <label>Xác nhận mật khẩu</label>
              <div className="field">
                <Lock size={20} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                />
              </div>

              {message && <div className="form-message">{message}</div>}

              <button className="primary full" type="submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </div>

        <small>
          Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách
          bảo mật.
        </small>
      </section>
    </div>
  );
}
function Dashboard({ setScreen }) {
  return (
    <Shell active="dashboard" setScreen={setScreen}>
      <div className="title-row">
        <div>
          <h1>Xin chào, Nguyễn Hoàng</h1>
          <p>
            Chào mừng bạn trở lại. Xe của bạn đã sẵn sàng cho dịch vụ chăm sóc
            định kỳ.
          </p>
        </div>
        <div className="user-chip">
          <Search />
          <div className="avatar">HN</div>
          <strong>Hoàng Nguyễn</strong>
        </div>
      </div>

      <div className="stats five">
        <StatCard
          title="Hạng thành viên"
          value="Vàng"
          note="Nhóm 5% khách hàng cao nhất"
          icon={Medal}
        />
        <StatCard
          title="Tổng điểm"
          value="1.250"
          note="Còn 250 điểm lên Bạch kim"
          icon={BarChart3}
        />
        <StatCard
          title="Tổng lượt rửa"
          value="12"
          note="+9 lượt nữa"
          icon={Droplets}
        />
        <StatCard
          title="Tổng chi tiêu"
          value="11.250.000đ"
          note="Trong 12 tháng gần nhất"
          icon={WalletCards}
        />
        <StatCard
          title="Ưu đãi sắp hết hạn"
          value="Còn 2 ngày"
          note="Miễn phí đánh bóng ngoại thất"
          icon={Gift}
        />
      </div>

      <div className="two-col">
        <section className="card chart">
          <div className="title-row small-title">
            <h2>Chi tiêu hàng tháng</h2>
            <div>
              <button>6 tháng</button>
              <button className="active">Năm nay</button>
            </div>
          </div>
          <div className="chart-lines">
            {["T1", "T2", "T3", "T4", "T5", "T6", "T7"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </section>

        <section className="dark-card">
          <Pill>Gợi ý AI</Pill>
          <h2>Gợi ý chăm sóc tối ưu</h2>
          <p>
            Dựa trên dự báo thời tiết tại Hà Nội 3 ngày tới, bạn nên đặt lịch
            phủ Ceramic để bảo vệ lớp sơn.
          </p>
          <button onClick={() => setScreen("booking")}>
            Đặt lịch ngay <ArrowRight size={18} />
          </button>
        </section>
      </div>

      <div className="three-col">
        <Panel title="Lịch hẹn hôm nay" icon={CalendarDays}>
          <div className="mini-box">
            <strong>Porsche Taycan 4S</strong>
            <span>14:30</span>
            <p>30A-888.88</p>
            <p>Dịch vụ: Rửa xe cao cấp + Khử khuẩn ozone</p>
          </div>
          <button onClick={() => setScreen("booking")}>
            Điều chỉnh lịch hẹn
          </button>
        </Panel>
        <Panel title="Khuyến mãi hiện có" icon={Tag}>
          <p>
            <b className="discount">20%</b> Giảm giá đánh bóng
          </p>
          <p>
            <CreditCard size={18} /> Kiểm tra ắc quy miễn phí
          </p>
        </Panel>
        <Panel title="Dịch vụ hay dùng" icon={Star}>
          <div className="service-buttons">
            <button>Rửa nhanh</button>
            <button>Hút bụi</button>
            <button>Khử mùi</button>
            <button>Dịch vụ khác</button>
          </div>
        </Panel>
      </div>
    </Shell>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="card panel">
      <h2>
        <span>
          <Icon />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Booking({ setScreen }) {
  const [step, setStep] = useState(1);
  const [historyFilter, setHistoryFilter] = useState("Tất cả");
  const [selectedBooking, setSelectedBooking] = useState(bookingHistory[0]);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const steps = ["Xe", "Dịch vụ", "Thời gian", "Xác nhận", "Theo dõi"];
  const filteredHistory =
    historyFilter === "Tất cả"
      ? bookingHistory
      : bookingHistory.filter((booking) => booking.status === historyFilter);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);

        const data = await vehicleApi.getMyVehicles();

        setVehicles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStep(2);
  };

  return (
    <Shell active="booking" setScreen={setScreen} topbar>
      <div className="booking-layout">
        <section className="booking-flow card">
          <div className="booking-header">
            <div>
              <span className="eyebrow">Đặt lịch mới</span>
              <h1>Hoàn tất lịch rửa xe trong vài bước</h1>
              <p>
                Chọn xe, dịch vụ và khung giờ phù hợp. Lịch hẹn sẽ xuất hiện
                ngay trong lịch sử bên cạnh.
              </p>
            </div>
            <button className="ghost-button" onClick={() => setStep(1)}>
              Làm lại
            </button>
          </div>

          <div className="stepper">
            {steps.map((s, i) => (
              <button
                key={s}
                className={step === i + 1 ? "active" : ""}
                onClick={() => setStep(i + 1)}
              >
                <b>{i + 1}</b>
                <span>{s}</span>
              </button>
            ))}
          </div>

          <div className="booking-page">
            {step === 1 && (
              <>
                <h2>Chọn phương tiện</h2>
                <p>Chọn xe bạn muốn làm sạch hôm nay từ gara SparkleAI.</p>
                {loadingVehicles ? (
                  <p>Đang tải danh sách xe...</p>
                ) : vehicles.length === 0 ? (
                  <p>Bạn chưa có xe nào. Hãy thêm xe ở mục Đội xe.</p>
                ) : (
                  <div className="vehicle-row">
                    {vehicles.map((vehicle) => (
                      <Vehicle
                        key={vehicle.id ?? vehicle.vehicleId}
                        vehicle={vehicle}
                        selected={selectedVehicle?.id === vehicle.id}
                        onClick={() => handleSelectVehicle(vehicle)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <StepCard title="Chọn gói dịch vụ">
                {[
                  "Rửa xe nhanh",
                  "Rửa xe cao cấp",
                  "Phủ Ceramic",
                  "Khử khuẩn ozone",
                ].map((s) => (
                  <button className="choice" key={s} onClick={() => setStep(3)}>
                    {s}
                    <ArrowRight />
                  </button>
                ))}
              </StepCard>
            )}

            {step === 3 && (
              <StepCard title="Chọn thời gian">
                {["08:30", "10:00", "14:30", "16:00"].map((s) => (
                  <button className="choice" key={s} onClick={() => setStep(4)}>
                    Hôm nay lúc {s}
                    <ArrowRight />
                  </button>
                ))}
              </StepCard>
            )}

            {step === 4 && (
              <StepCard title="Xác nhận lịch hẹn">
                <div className="confirm-list">
                  <p>
                    <Car size={18} />{" "}
                    {selectedVehicle
                      ? `${[selectedVehicle.brand, selectedVehicle.model]
                          .filter(Boolean)
                          .join(" ")} · ${selectedVehicle.licensePlate}`
                      : "Chưa chọn xe"}
                  </p>
                  <p>
                    <Droplets size={18} /> Rửa xe cao cấp
                  </p>
                  <p>
                    <Clock3 size={18} /> Hôm nay lúc 14:30
                  </p>
                </div>
                <button className="primary" onClick={() => setStep(5)}>
                  Xác nhận đặt lịch
                </button>
              </StepCard>
            )}

            {step === 5 && (
              <StepCard title="Theo dõi lịch hẹn">
                <div className="tracking-list">
                  <p>
                    <CheckCircle2 /> Lịch hẹn đã được xác nhận.
                  </p>
                  <p>
                    <Clock3 /> Trạm đang chuẩn bị khu vực rửa xe.
                  </p>
                  <p>
                    <Car /> Kỹ thuật viên sẽ nhận xe trong khoảng 10 phút.
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => setScreen("dashboard")}
                >
                  Về bảng điều khiển
                </button>
              </StepCard>
            )}
          </div>
        </section>

        <aside className="booking-history card">
          <div className="history-head">
            <div>
              <span className="eyebrow">Theo dõi</span>
              <h2>Lịch sử đặt lịch</h2>
            </div>
            <span className="history-count">{filteredHistory.length}</span>
          </div>

          <div className="history-filters">
            {["Tất cả", "Sắp tới", "Hoàn tất", "Đã hủy"].map((filter) => (
              <button
                key={filter}
                className={historyFilter === filter ? "active" : ""}
                onClick={() => setHistoryFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="history-list">
            {filteredHistory.map((booking) => (
              <button
                key={booking.id}
                className={`history-item ${selectedBooking.id === booking.id ? "selected" : ""}`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div>
                  <strong>{booking.car}</strong>
                  <span>{booking.service}</span>
                </div>
                <StatusBadge status={booking.status} />
                <small>
                  {booking.date} · {booking.time}
                </small>
              </button>
            ))}
          </div>

          <div className="history-detail">
            <div className="detail-top">
              <strong>{selectedBooking.id}</strong>
              <StatusBadge status={selectedBooking.status} />
            </div>
            <p>
              <Car size={17} /> {selectedBooking.car} · {selectedBooking.plate}
            </p>
            <p>
              <Droplets size={17} /> {selectedBooking.service}
            </p>
            <p>
              <Clock3 size={17} /> {selectedBooking.date} lúc{" "}
              {selectedBooking.time}
            </p>
            <p>
              <WalletCards size={17} /> {selectedBooking.price}
            </p>
            <button className="outline-button">Xem chi tiết lịch hẹn</button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Hoàn tất"
      ? "done"
      : status === "Đã hủy"
        ? "cancel"
        : "upcoming";
  return <span className={`status-badge ${className}`}>{status}</span>;
}

function Vehicle({ vehicle, selected, onClick }) {
  const title =
    [vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
    "Chưa cập nhật";
  const statusLabel = VEHICLE_STATUS_LABELS[vehicle.status] || vehicle.status;

  return (
    <article className={`vehicle-card ${selected ? "selected" : ""}`}>
      <span className={vehicle.status === "ACTIVE" ? "green" : "blue"}>
        <Car />
      </span>
      <div>
        <h3>{title}</h3>
        <b>{vehicle.licensePlate}</b>
        {vehicle.color && <p>Màu xe: {vehicle.color}</p>}
        {statusLabel && <p>Trạng thái: {statusLabel}</p>}
        <button onClick={onClick}>
          Chọn <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function StepCard({ title, children }) {
  return (
    <div className="step-card">
      <h1>{title}</h1>
      <div className="choice-grid">{children}</div>
    </div>
  );
}

const VEHICLE_STATUS_LABELS = {
  ACTIVE: "Đang sử dụng",
  INACTIVE: "Tạm ngưng",
  DELETED: "Đã xóa",
};

const EMPTY_VEHICLE_FORM = {
  licensePlate: "",
  brand: "",
  model: "",
  color: "",
};

function Fleet({ setScreen }) {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE_FORM);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);

      const data = await vehicleApi.getMyVehicles();

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchVehicles();
  }, []);

  const activeVehicleCount = vehicles.filter(
    (vehicle) => vehicle.status === "ACTIVE",
  ).length;

  const handleVehicleFormChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormError("");
    setVehicleForm(EMPTY_VEHICLE_FORM);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    const licensePlate = vehicleForm.licensePlate.trim().toUpperCase();
    const brand = vehicleForm.brand.trim();
    const model = vehicleForm.model.trim();
    const color = vehicleForm.color.trim();

    if (!licensePlate || !brand || !model) {
      setFormError("Vui lòng nhập đầy đủ biển số, hãng xe và dòng xe.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await vehicleApi.createVehicle({
        licensePlate,
        brand,
        model,
        color: color || "Chưa cập nhật",
      });

      await fetchVehicles();
      closeAddModal();
    } catch (error) {
      setFormError(error.message || "Không thể thêm xe. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell active="fleet" setScreen={setScreen} topbar>
      <div className="title-row">
        <div>
          <h1>Đội xe</h1>
          <p>Theo dõi và tối ưu hóa hiệu suất hạm đội SparkleAI của bạn.</p>
        </div>
        <button className="primary" onClick={() => setShowAddModal(true)}>
          <Plus /> Thêm xe mới
        </button>
      </div>

      <div className="stats three">
        <StatCard
          title="Tổng số xe"
          value={String(vehicles.length).padStart(2, "0")}
          note="Theo tài khoản của bạn"
          icon={Car}
        />
        <StatCard
          title="Đang hoạt động"
          value={String(activeVehicleCount).padStart(2, "0")}
          note="Trạng thái ACTIVE"
          icon={Zap}
        />
        <StatCard
          title="Tổng lượt sử dụng"
          value="1.248"
          note="Dự báo tăng 12% tuần tới"
          icon={BarChart3}
        />
      </div>

      <div className="fleet-grid">
        {loadingVehicles ? (
          <p>Đang tải danh sách xe...</p>
        ) : (
          vehicles.map((vehicle) => (
            <FleetCard
              key={vehicle.vehicleId || vehicle.id}
              vehicle={vehicle}
            />
          ))
        )}
        <article
          className="add-card"
          role="button"
          tabIndex={0}
          onClick={() => setShowAddModal(true)}
        >
          <Plus />
          <h2>Thêm phương tiện mới</h2>
          <p>Tự động đồng bộ với hệ thống quản lý SparkleAI.</p>
        </article>
      </div>

      <section className="ai-strip">
        <Sparkles />
        <div>
          <h2>
            Gợi ý từ SparkleAI <Pill>Gợi ý AI</Pill>
          </h2>
          <p>
            Tesla Model 3 đang có hiệu suất cao hơn 15% so với mức trung bình.
            Bạn có thể ưu tiên xe này cho các khung giờ cao điểm.
          </p>
        </div>
      </section>

      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm xe mới</h2>

            <form onSubmit={handleAddVehicle}>
              <label>Biển số xe</label>
              <div className="field">
                <input
                  name="licensePlate"
                  value={vehicleForm.licensePlate}
                  onChange={handleVehicleFormChange}
                  placeholder="Ví dụ: 51A-12345"
                />
              </div>

              <label>Hãng xe</label>
              <div className="field">
                <input
                  name="brand"
                  value={vehicleForm.brand}
                  onChange={handleVehicleFormChange}
                  placeholder="Ví dụ: Toyota"
                />
              </div>

              <label>Dòng xe</label>
              <div className="field">
                <input
                  name="model"
                  value={vehicleForm.model}
                  onChange={handleVehicleFormChange}
                  placeholder="Ví dụ: Vios"
                />
              </div>

              <label>Màu xe</label>
              <div className="field">
                <input
                  name="color"
                  value={vehicleForm.color}
                  onChange={handleVehicleFormChange}
                  placeholder="Ví dụ: Trắng"
                />
              </div>

              {formError && <div className="form-message">{formError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={closeAddModal}
                >
                  Hủy
                </button>
                <button className="primary" type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu xe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}

function FleetCard({ vehicle }) {
  const title =
    [vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
    "Chưa cập nhật";
  const statusLabel =
    VEHICLE_STATUS_LABELS[vehicle.status] || vehicle.status || "—";

  return (
    <article className="fleet-card">
      <div className="car-photo">
        <Car size={70} />
      </div>
      <div>
        <div className="title-row small-title">
          <h2>{title}</h2>
          <span>
            <Wrench size={18} />
            <Trash2 size={18} />
          </span>
        </div>
        <b>{vehicle.licensePlate}</b>
        <p>{vehicle.color || "Chưa cập nhật màu"}</p>
        <div className="metric-pair">
          <span>
            Lượt dùng <strong>{vehicle.totalBookings ?? 0}</strong>
          </span>
          <span>
            Trạng thái <strong>{statusLabel}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}

function Rewards({ setScreen }) {
  return (
    <Shell active="rewards" setScreen={setScreen}>
      <div className="title-row">
        <div>
          <h1>Ưu đãi & Đặc quyền</h1>
          <p>Quản lý hạng thành viên và đổi điểm nhận quà tặng cao cấp.</p>
        </div>
        <div className="points">
          <Star /> 8.450 điểm
        </div>
      </div>

      <div className="reward-top">
        <section className="tier-card">
          <Pill>Gợi ý từ SparkleAI</Pill>
          <h2>Bạn đang ở Hạng Vàng</h2>
          <p>
            Chỉ còn 1.550 điểm nữa để đạt hạng Kim cương và nhận đặc quyền đậu
            xe ưu tiên 24/7.
          </p>
          <div className="progress">
            <i style={{ width: "84%" }} />
          </div>
          <div className="tier-stats">
            <span>
              Chuyến đi <b>12/15</b>
            </span>
            <span>
              Chi tiêu <b>4,2 triệu</b>
            </span>
            <span>
              Đánh giá <b>4,9/5</b>
            </span>
          </div>
        </section>

        <section className="card quick">
          <h2>Tích điểm nhanh</h2>
          <p>
            <Car /> Đặt lịch bảo trì <span>+200 điểm</span>
          </p>
          <p>
            <Users /> Giới thiệu bạn bè <span>+500 điểm</span>
          </p>
          <p>
            <CheckCircle2 /> Viết đánh giá dịch vụ <span>+50 điểm</span>
          </p>
          <button onClick={() => setScreen("booking")}>
            Làm nhiệm vụ ngay
          </button>
        </section>
      </div>

      <h2 className="section-title">Đổi thưởng hấp dẫn</h2>
      <div className="reward-grid">
        {rewardItems.map((r, i) => (
          <article className="reward-card" key={r[0]}>
            <div className="reward-img">
              {i === 0 && <b>NỔI BẬT</b>}
              <Gift size={58} />
            </div>
            <h3>{r[0]}</h3>
            <p>{r[1]}</p>
            <strong>{r[2]}</strong>
            <button>
              <ArrowRight />
            </button>
          </article>
        ))}
      </div>
    </Shell>
  );
}

function Insights({ setScreen }) {
  return (
    <Shell active="insights" setScreen={setScreen}>
      <div className="title-row">
        <div>
          <h1>Trung tâm Gợi ý AI</h1>
          <p>
            Phân tích hành vi và dự báo cá nhân hóa dựa trên dữ liệu SparkleAI.
          </p>
        </div>
        <div className="status">
          <span /> Hệ thống đang hoạt động
        </div>
      </div>

      <div className="two-col">
        <section className="card bar-card">
          <h2>Tần suất đặt lịch</h2>
          <p>Phân tích mật độ sử dụng dịch vụ theo thời gian.</p>
          <div className="bars">
            {[45, 62, 88, 55, 48, 72, 98].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="bar-labels">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>
        </section>

        <section className="prediction">
          <Pill blue>Dự đoán AI</Pill>
          <h2>Bạn có khả năng quay lại cuối tuần này</h2>
          <p>
            Dựa trên lịch sử 3 tháng gần nhất, 85% khả năng bạn sẽ cần dịch vụ
            cao cấp vào Thứ 7 tới.
          </p>
          <button onClick={() => setScreen("booking")}>Đặt trước ngay</button>
        </section>
      </div>

      <div className="stats four">
        <StatCard
          title="Chi tiêu trung bình"
          value="1.250.000đ"
          note="+12,5% tháng này"
          icon={WalletCards}
        />
        <StatCard
          title="Thời gian chưa sử dụng"
          value="12 ngày"
          note="Nên nhắc lịch"
          icon={Clock3}
        />
        <StatCard
          title="Điểm tích lũy"
          value="4.850 điểm"
          note="Sắp đạt hạng Vàng"
          icon={Star}
        />
        <StatCard
          title="Đề xuất đổi điểm"
          value="Đổi mã 50%"
          note="Hết hạn sau 3 ngày"
          icon={Gift}
        />
      </div>

      <section className="banner">
        <Pill blue>AI đề xuất</Pill>
        <h2>Trải nghiệm bảo trì thông minh thế hệ mới</h2>
        <p>
          Chế độ tự động nhắc lịch sẽ tối ưu chi phí vận hành cho đội xe của
          bạn.
        </p>
        <button onClick={() => setScreen("fleet")}>Tìm hiểu thêm</button>
      </section>
    </Shell>
  );
}

function Staff({ setScreen }) {
  return (
    <Shell active="staff" setScreen={setScreen}>
      <div className="title-row">
        <div>
          <h1>Bảng điều khiển vận hành</h1>
          <p>Dữ liệu thời gian thực cho ngày 24 tháng 5, 2024.</p>
        </div>
        <div className="status">
          <span /> Hệ thống: Trực tuyến <RefreshCw />
        </div>
      </div>

      <div className="stats four">
        <StatCard
          title="Doanh thu hôm nay"
          value="15.420.000đ"
          note="+12% so với hôm qua"
          icon={WalletCards}
        />
        <StatCard
          title="Lượt đặt lịch"
          value="42"
          note="Dự kiến tăng 5 lượt"
          icon={CalendarDays}
        />
        <StatCard
          title="Khách đang chờ"
          value="08"
          note="Thời gian chờ TB: 14p"
          icon={Users}
        />
        <StatCard
          title="Hiệu suất trạm"
          value="94%"
          note="Đang tối ưu"
          icon={BarChart3}
        />
      </div>

      <div className="staff-grid">
        <section className="card station-wrap">
          <div className="title-row small-title">
            <h2>Trạm rửa đang hoạt động</h2>
            <button>Quản lý trạm</button>
          </div>
          <div className="stations">
            {[
              ["Trạm 01 - Đang rửa", "BMW X5 - 30A-123.45", "75%"],
              ["Trạm 02 - Sấy khô", "Tesla Model 3 - 51K-999.01", "92%"],
              ["Trạm 04 - Đang rửa", "Audi A4 - 29A-888.88", "15%"],
            ].map((s) => (
              <article className="station" key={s[0]}>
                <div>
                  <Droplets />
                </div>
                <section>
                  <strong>{s[0]}</strong>
                  <p>Xe: {s[1]}</p>
                  <div className="progress">
                    <i style={{ width: s[2] }} />
                  </div>
                </section>
              </article>
            ))}
            <article className="station empty">
              <Plus />
              <p>Trạm 03 - Trống</p>
              <button>Phân bổ xe ngay</button>
            </article>
          </div>
        </section>

        <aside className="right-stack">
          <section className="card queue">
            <h2>Hàng đợi tiếp theo (05)</h2>
            {["Nguyễn Hùng", "Trần Anh", "Lê Minh"].map((n) => (
              <p key={n}>
                <span className="avatar">{n[0]}</span>
                <b>{n}</b>
                <ArrowRight />
              </p>
            ))}
          </section>
          <section className="live-log">
            <h2>Nhật ký trực tiếp</h2>
            <p>06:26 Khách mới Trần Dũng đã đặt lịch qua ứng dụng.</p>
            <p>14:32 Trạm 01 bắt đầu chu trình phun bọt tuyết.</p>
            <p>14:30 Nguyễn Hùng đã vào trạm.</p>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "home") return <Home setScreen={setScreen} />;
  if (screen === "login") return <Login setScreen={setScreen} />;
  if (screen === "dashboard") return <Dashboard setScreen={setScreen} />;
  if (screen === "booking") return <Booking setScreen={setScreen} />;
  if (screen === "fleet") return <Fleet setScreen={setScreen} />;
  if (screen === "rewards") return <Rewards setScreen={setScreen} />;
  if (screen === "insights") return <Insights setScreen={setScreen} />;
  return <Staff setScreen={setScreen} />;
}
