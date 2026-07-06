// Đường dẫn asset gốc của Staff Portal (bộ washmate_staff_assets_package,
// đã copy vào public/assets/washmate-staff/ — chỉ SVG, không screenshot).
// Mọi icon/banner/illustration của Staff Portal lấy từ đây, không tự chế icon mới.

const BASE = "/assets/washmate-staff";

export const STAFF_ASSETS = {
  logo: {
    mark: `${BASE}/logo/washmate-logo-mark.svg`,
    full: `${BASE}/logo/washmate-logo-full-staff.svg`,
    wordmark: `${BASE}/logo/washmate-wordmark.svg`,
  },
  nav: {
    overview: `${BASE}/icons/navigation/nav-overview-grid.svg`,
    queue: `${BASE}/icons/navigation/nav-queue-list.svg`,
    calendar: `${BASE}/icons/navigation/nav-calendar.svg`,
    search: `${BASE}/icons/navigation/nav-search.svg`,
    user: `${BASE}/icons/navigation/nav-user.svg`,
    logout: `${BASE}/icons/navigation/nav-logout.svg`,
  },
  kpi: {
    calendar: `${BASE}/icons/kpi/kpi-calendar.svg`,
    hourglass: `${BASE}/icons/kpi/kpi-hourglass.svg`,
    userCheck: `${BASE}/icons/kpi/kpi-user-check.svg`,
    droplet: `${BASE}/icons/kpi/kpi-droplet.svg`,
    complete: `${BASE}/icons/kpi/kpi-complete.svg`,
    warning: `${BASE}/icons/kpi/kpi-warning.svg`,
  },
  action: {
    bell: `${BASE}/icons/actions/action-bell.svg`,
    refresh: `${BASE}/icons/actions/action-refresh.svg`,
    phone: `${BASE}/icons/actions/action-phone.svg`,
    close: `${BASE}/icons/actions/action-close.svg`,
    chevronRight: `${BASE}/icons/actions/action-chevron-right.svg`,
    chevronDown: `${BASE}/icons/actions/action-chevron-down.svg`,
    info: `${BASE}/icons/actions/action-info.svg`,
    checkIn: `${BASE}/icons/actions/action-check-in.svg`,
    startWash: `${BASE}/icons/actions/action-start-wash.svg`,
    progress: `${BASE}/icons/actions/action-progress.svg`,
    completeService: `${BASE}/icons/actions/action-complete-service.svg`,
    paymentReminder: `${BASE}/icons/actions/action-payment-reminder.svg`,
    incident: `${BASE}/icons/actions/action-incident.svg`,
  },
  status: {
    pending: `${BASE}/icons/status/status-pending.svg`,
    confirmed: `${BASE}/icons/status/status-confirmed.svg`,
    checkedIn: `${BASE}/icons/status/status-checked-in.svg`,
    washing: `${BASE}/icons/status/status-washing.svg`,
    completed: `${BASE}/icons/status/status-completed.svg`,
    noShow: `${BASE}/icons/status/status-no-show.svg`,
    cancelled: `${BASE}/icons/status/status-cancelled.svg`,
    paid: `${BASE}/icons/status/status-paid.svg`,
    unpaid: `${BASE}/icons/status/status-unpaid.svg`,
    refunded: `${BASE}/icons/status/status-refunded.svg`,
  },
  context: {
    locationPin: `${BASE}/icons/context/context-location-pin.svg`,
    bayGarage: `${BASE}/icons/context/context-bay-garage.svg`,
    shiftSun: `${BASE}/icons/context/context-shift-sun.svg`,
  },
  banner: {
    hero: `${BASE}/banners/staff-overview-hero-bg.svg`,
    sidebar: `${BASE}/banners/sidebar-gradient-bg.svg`,
    softPanel: `${BASE}/banners/glassmorphism-soft-panel-bg.svg`,
  },
  illustration: {
    worker: `${BASE}/illustrations/car-wash-worker.svg`,
    emptyBookings: `${BASE}/illustrations/empty-bookings.svg`,
    incidentAlert: `${BASE}/illustrations/incident-alert.svg`,
    noShowAlert: `${BASE}/illustrations/no-show-alert.svg`,
  },
};
