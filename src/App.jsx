import { useState } from "react";
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

const cars = [
  ["Tesla Model 3", "51G - 888.88", "Sedan cao cấp", "342", "Sẵn sàng"],
  ["VinFast VF8", "51H - 999.01", "SUV thông minh", "156", "Đang di chuyển"],
  ["BMW 5 Series", "30A - 123.45", "Sedan điều hành", "89", "Bảo trì"],
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
            <button className="active">Đăng nhập</button>
            <button>Đăng ký</button>
          </div>
          <label>Email hoặc số điện thoại</label>
          <div className="field">
            <Mail size={20} /> name@example.com
          </div>
          <label>
            Mật khẩu <button>Quên mật khẩu?</button>
          </label>
          <div className="field">
            <Lock size={20} /> ••••••••• <Eye size={20} />
          </div>
          <button
            className="primary full"
            onClick={() => setScreen("dashboard")}
          >
            Đăng nhập ngay
          </button>
          <div className="divider">Hoặc tiếp tục với</div>
          <button className="google">Đăng nhập với Google</button>
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
  const steps = ["Xe", "Dịch vụ", "Thời gian", "Xác nhận", "Theo dõi"];

  return (
    <Shell active="booking" setScreen={setScreen} topbar>
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

      <section className="booking-page">
        {step === 1 && (
          <>
            <h1>Chọn phương tiện của bạn</h1>
            <p>Chọn xe bạn muốn làm sạch hôm nay từ gara SparkleAI.</p>
            <div className="vehicle-row">
              <Vehicle
                name="Mercedes-Benz S-Class"
                plate="30A - 888.88"
                last="12 ngày trước"
                onClick={() => setStep(2)}
              />
              <Vehicle
                name="Tesla Model Y"
                plate="51H - 999.99"
                last="Hôm qua"
                green
                onClick={() => setStep(2)}
              />
            </div>
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
            <p>Xe: Tesla Model Y</p>
            <p>Dịch vụ: Rửa xe cao cấp</p>
            <p>Thời gian: Hôm nay lúc 14:30</p>
            <button className="primary" onClick={() => setStep(5)}>
              Xác nhận đặt lịch
            </button>
          </StepCard>
        )}

        {step === 5 && (
          <StepCard title="Theo dõi lịch hẹn">
            <p>
              <CheckCircle2 /> Lịch hẹn đã được xác nhận.
            </p>
            <p>
              <Clock3 /> Trạm đang chuẩn bị khu vực rửa xe.
            </p>
            <button className="primary" onClick={() => setScreen("dashboard")}>
              Về bảng điều khiển
            </button>
          </StepCard>
        )}
      </section>
    </Shell>
  );
}

function Vehicle({ name, plate, last, green, onClick }) {
  return (
    <article className="vehicle-card">
      <span className={green ? "green" : "blue"}>
        <Car />
      </span>
      <div>
        <h3>{name}</h3>
        <b>{plate}</b>
        <p>Lần cuối: {last}</p>
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

function Fleet({ setScreen }) {
  return (
    <Shell active="fleet" setScreen={setScreen} topbar>
      <div className="title-row">
        <div>
          <h1>Quản lý phương tiện</h1>
          <p>Theo dõi và tối ưu hóa hiệu suất hạm đội SparkleAI của bạn.</p>
        </div>
        <button className="primary">
          <Plus /> Thêm xe mới
        </button>
      </div>

      <div className="stats three">
        <StatCard
          title="Tổng số xe"
          value="12"
          note="+2 xe trong tháng này"
          icon={Car}
        />
        <StatCard
          title="Đang hoạt động"
          value="08"
          note="Cập nhật thời gian thực"
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
        {cars.map((car) => (
          <FleetCard key={car[0]} car={car} />
        ))}
        <article className="add-card">
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
    </Shell>
  );
}

function FleetCard({ car }) {
  return (
    <article className="fleet-card">
      <div className="car-photo">
        <Car size={70} />
      </div>
      <div>
        <div className="title-row small-title">
          <h2>{car[0]}</h2>
          <span>
            <Wrench size={18} />
            <Trash2 size={18} />
          </span>
        </div>
        <b>{car[1]}</b>
        <p>{car[2]}</p>
        <div className="metric-pair">
          <span>
            Lượt dùng <strong>{car[3]}</strong>
          </span>
          <span>
            Trạng thái <strong>{car[4]}</strong>
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
