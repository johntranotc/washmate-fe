import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "aquasmart_demo_state_v2";

const statusLabels = {
  PENDING: "chờ thanh toán",
  CONFIRMED: "đã xác nhận",
  CHECKED_IN: "đã tiếp nhận",
  WASHING: "đang rửa",
  COMPLETED: "đã hoàn tất",
  CANCELLED: "đã hủy",
  NO_SHOW: "khách không đến",
};

const roleLabels = {
  CUSTOMER: "Khách hàng",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const paymentMethodLabels = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ ngân hàng",
};

const initialState = {
  session: null,
  users: [
    { id: 1, name: "Alex Morgan", email: "customer@demo.com", role: "CUSTOMER" },
    { id: 2, name: "Nhân viên Sarah", email: "staff@demo.com", role: "STAFF" },
    { id: 3, name: "Quản trị viên", email: "admin@demo.com", role: "ADMIN" },
  ],
  garages: [
    { id: 1, name: "Trung tâm chăm sóc xe Quận 1", address: "Quận 1, TP. Hồ Chí Minh" },
    { id: 2, name: "Trung tâm chăm sóc xe Thủ Đức", address: "Thủ Đức, TP. Hồ Chí Minh" },
  ],
  vehicles: [
    { id: 1, ownerId: 1, name: "BMW X5", plate: "51A-12345", status: "ACTIVE" },
    { id: 2, ownerId: 1, name: "Toyota Vios", plate: "51B-67890", status: "ACTIVE" },
  ],
  services: [
    { id: 1, name: "Rửa xe cơ bản", price: 80000, duration: 30 },
    { id: 2, name: "Rửa xe cao cấp", price: 120000, duration: 45 },
    { id: 3, name: "Chăm sóc xe toàn diện", price: 250000, duration: 90 },
  ],
  bookings: [
    {
      id: 1,
      code: "BK-0001",
      customerId: 1,
      customerName: "Alex Morgan",
      phone: "0900000000",
      garageId: 1,
      garageName: "Trung tâm chăm sóc xe Quận 1",
      vehicleId: 1,
      vehicle: "BMW X5",
      plate: "51A-12345",
      serviceId: 2,
      serviceName: "Rửa xe cao cấp",
      bookingDate: "2026-06-12",
      slotTime: "09:00",
      amount: 120000,
      discount: 0,
      finalAmount: 120000,
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      invoiceStatus: "ISSUED",
      serviceStatus: "WAITING_CHECK_IN",
      createdAt: "2026-06-11T08:00:00.000Z",
      paidAt: "2026-06-11T08:05:00.000Z",
      checkinTime: null,
      serviceStartTime: null,
      completedTime: null,
      paymentMethod: "CARD",
      transactionCode: "TXN-DEMO-001",
    },
  ],
  loyalty: {
    customerId: 1,
    availablePoints: 1250,
    totalPoints: 1250,
    tier: "GOLD",
    transactions: [
      {
        id: 1,
        type: "EARN",
        points: 250,
        description: "Hoàn tất gói rửa xe cao cấp",
        createdAt: "2026-06-01T10:00:00.000Z",
      },
    ],
  },
  notifications: [
    {
      id: 1,
      userId: 1,
      title: "Lịch đặt đã được xác nhận",
      message: "BK-0001 đã được xác nhận và sẵn sàng tiếp nhận.",
      type: "BOOKING",
      read: false,
      createdAt: "2026-06-11T08:05:00.000Z",
    },
  ],
  auditLogs: [],
};

const AppStoreContext = createContext(null);

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  } catch {
    return initialState;
  }
}

function now() {
  return new Date().toISOString();
}

function addAudit(state, action, entity, entityId, detail) {
  return [
    {
      id: Date.now(),
      action,
      entity,
      entityId,
      detail,
      actor: state.session?.email || "system",
      createdAt: now(),
    },
    ...state.auditLogs,
  ];
}

function addNotification(notifications, userId, title, message, type) {
  return [
    {
      id: Date.now() + Math.random(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: now(),
    },
    ...notifications,
  ];
}

export function AppStoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(
    () => ({
      login(email) {
        const normalized = email.trim().toLowerCase();
        const user =
          state.users.find((item) => item.email === normalized) ||
          state.users.find((item) => item.role === "CUSTOMER");
        setState((current) => ({ ...current, session: user }));
        localStorage.setItem("accessToken", "demo-access-token");
        return user;
      },
      logout() {
        setState((current) => ({ ...current, session: null }));
        localStorage.removeItem("accessToken");
      },
      register(payload) {
        const user = {
          id: Date.now(),
          name: payload.fullName,
          email: payload.email.toLowerCase(),
          phone: payload.phone,
          role: "CUSTOMER",
        };
        setState((current) => ({
          ...current,
          users: [...current.users, user],
          session: user,
        }));
        return user;
      },
      createBooking(payload) {
        const duplicate = state.bookings.some(
          (booking) =>
            booking.vehicleId === payload.vehicleId &&
            booking.bookingDate === payload.bookingDate &&
            booking.slotTime === payload.slotTime &&
            !["CANCELLED", "NO_SHOW"].includes(booking.bookingStatus),
        );
        if (duplicate) {
          throw new Error("Phương tiện đã có lịch hoạt động trong khung giờ này.");
        }
        const slotCount = state.bookings.filter(
          (booking) =>
            booking.garageId === payload.garageId &&
            booking.bookingDate === payload.bookingDate &&
            booking.slotTime === payload.slotTime &&
            !["CANCELLED", "NO_SHOW"].includes(booking.bookingStatus),
        ).length;
        if (slotCount >= 4) {
          throw new Error("Khung giờ đã đạt sức chứa tối đa.");
        }
        const id = Math.max(0, ...state.bookings.map((item) => item.id)) + 1;
        const created = {
          ...payload,
          id,
          code: `BK-${String(id).padStart(4, "0")}`,
          customerId: state.session?.id || 1,
          customerName: state.session?.name || "Alex Morgan",
          phone: state.session?.phone || "0900000000",
          bookingStatus: "PENDING",
          paymentStatus: "PENDING",
          invoiceStatus: "NOT_ISSUED",
          serviceStatus: "WAITING_PAYMENT",
          createdAt: now(),
          paidAt: null,
          checkinTime: null,
          serviceStartTime: null,
          completedTime: null,
        };
        setState((current) => ({
          ...current,
          bookings: [created, ...current.bookings],
          notifications: addNotification(
            current.notifications,
            created.customerId,
            "Đã tạo lịch",
            `${created.code} đã được tạo và đang chờ thanh toán.`,
            "BOOKING",
          ),
          auditLogs: addAudit(current, "CREATE", "BOOKING", id, created.code),
        }));
        return created;
      },
      payBooking(bookingId, paymentMethod) {
        setState((current) => {
          const paidAt = now();
          const bookings = current.bookings.map((booking) =>
            booking.id === Number(bookingId)
              ? {
                  ...booking,
                  bookingStatus: "CONFIRMED",
                  paymentStatus: "PAID",
                  invoiceStatus: "ISSUED",
                  serviceStatus: "WAITING_CHECK_IN",
                  paymentMethod,
                  paidAt,
                  transactionCode: `TXN-${Date.now()}`,
                  invoiceCode: `INV-${String(booking.id).padStart(4, "0")}`,
                }
              : booking,
          );
          const booking = bookings.find((item) => item.id === Number(bookingId));
          return {
            ...current,
            bookings,
            notifications: addNotification(
              current.notifications,
              booking.customerId,
              "Thanh toán thành công",
              `${booking.code} đã được xác nhận. Hóa đơn đã được phát hành.`,
              "PAYMENT",
            ),
            auditLogs: addAudit(
              current,
              "PAY",
              "BOOKING",
              bookingId,
              paymentMethodLabels[paymentMethod] || paymentMethod,
            ),
          };
        });
      },
      cancelBooking(bookingId) {
        setState((current) => {
          const target = current.bookings.find(
            (booking) => booking.id === Number(bookingId),
          );
          if (!target || ["WASHING", "COMPLETED"].includes(target.bookingStatus)) {
            return current;
          }
          return {
            ...current,
            bookings: current.bookings.map((booking) =>
              booking.id === Number(bookingId)
                ? {
                    ...booking,
                    bookingStatus: "CANCELLED",
                    serviceStatus: "CANCELLED",
                  }
                : booking,
            ),
            notifications: addNotification(
              current.notifications,
              target.customerId,
              "Lịch đặt đã bị hủy",
              `${target.code} đã bị hủy và khung giờ đã được giải phóng.`,
              "BOOKING",
            ),
            auditLogs: addAudit(
              current,
              "CANCEL",
              "BOOKING",
              bookingId,
              target.code,
            ),
          };
        });
      },
      transitionBooking(bookingId, nextStatus) {
        const allowed = {
          CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELLED"],
          CHECKED_IN: ["WASHING"],
          WASHING: ["COMPLETED"],
        };
        setState((current) => {
          const target = current.bookings.find(
            (booking) => booking.id === Number(bookingId),
          );
          if (!target || !allowed[target.bookingStatus]?.includes(nextStatus)) {
            return current;
          }
          if (
            nextStatus === "CHECKED_IN" &&
            target.paymentStatus !== "PAID"
          ) {
            return current;
          }
          const timestamp = now();
          const updated = {
            ...target,
            bookingStatus: nextStatus,
            serviceStatus:
              nextStatus === "CHECKED_IN"
                ? "READY"
                : nextStatus === "WASHING"
                  ? "IN_PROGRESS"
                  : nextStatus,
            ...(nextStatus === "CHECKED_IN" && { checkinTime: timestamp }),
            ...(nextStatus === "WASHING" && { serviceStartTime: timestamp }),
            ...(nextStatus === "COMPLETED" && { completedTime: timestamp }),
          };
          let loyalty = current.loyalty;
          let notifications = addNotification(
            current.notifications,
            target.customerId,
            `Lịch đặt ${statusLabels[nextStatus] || "đã cập nhật"}`,
            `${target.code} đã chuyển sang trạng thái ${
              statusLabels[nextStatus] || nextStatus
            }.`,
            "SERVICE",
          );
          if (nextStatus === "COMPLETED" && target.paymentStatus === "PAID") {
            const points = Math.floor(target.finalAmount / 1000);
            loyalty = {
              ...loyalty,
              availablePoints: loyalty.availablePoints + points,
              totalPoints: loyalty.totalPoints + points,
              transactions: [
                {
                  id: Date.now(),
                  type: "EARN",
                  points,
                  description: `Nhận điểm từ ${target.code}`,
                  createdAt: timestamp,
                },
                ...loyalty.transactions,
              ],
            };
            notifications = addNotification(
              notifications,
              target.customerId,
              "Đã nhận điểm thưởng",
              `Bạn đã nhận ${points} điểm từ ${target.code}.`,
              "LOYALTY",
            );
          }
          return {
            ...current,
            bookings: current.bookings.map((booking) =>
              booking.id === target.id ? updated : booking,
            ),
            loyalty,
            notifications,
            auditLogs: addAudit(
              current,
              "STATUS_CHANGE",
              "BOOKING",
              bookingId,
              `${statusLabels[target.bookingStatus] || target.bookingStatus} → ${
                statusLabels[nextStatus] || nextStatus
              }`,
            ),
          };
        });
      },
      markNotificationRead(id) {
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        }));
      },
      markAllNotificationsRead() {
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) => ({
            ...item,
            read: true,
          })),
        }));
      },
      addGarage(payload) {
        setState((current) => {
          const item = { id: Date.now(), ...payload };
          return {
            ...current,
            garages: [...current.garages, item],
            auditLogs: addAudit(current, "CREATE", "GARAGE", item.id, item.name),
          };
        });
      },
      addService(payload) {
        setState((current) => {
          const item = { id: Date.now(), ...payload };
          return {
            ...current,
            services: [...current.services, item],
            auditLogs: addAudit(current, "CREATE", "SERVICE", item.id, item.name),
          };
        });
      },
      toggleUserRole(userId, role) {
        setState((current) => ({
          ...current,
          users: current.users.map((user) =>
            user.id === userId ? { ...user, role } : user,
          ),
          auditLogs: addAudit(
            current,
            "ROLE_CHANGE",
            "USER",
            userId,
            roleLabels[role] || role,
          ),
        }));
      },
      redeemReward(name, points) {
        if (state.loyalty.availablePoints < points) {
          throw new Error("Không đủ điểm thưởng.");
        }
        setState((current) => ({
          ...current,
          loyalty: {
            ...current.loyalty,
            availablePoints: current.loyalty.availablePoints - points,
            transactions: [
              {
                id: Date.now(),
                type: "REDEEM",
                points: -points,
                description: `Đã đổi quà: ${name}`,
                createdAt: now(),
              },
              ...current.loyalty.transactions,
            ],
          },
          notifications: addNotification(
            current.notifications,
            current.session?.id || 1,
            "Đổi quà thành công",
            `${name} đã được đổi bằng ${points} điểm.`,
            "LOYALTY",
          ),
          auditLogs: addAudit(
            current,
            "REDEEM",
            "LOYALTY",
            current.session?.id || 1,
            `${name}: ${points}`,
          ),
        }));
      },
      resetDemo() {
        setState(initialState);
      },
    }),
    [state],
  );

  return (
    <AppStoreContext.Provider value={{ state, actions }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error("useAppStore must be used inside AppStoreProvider");
  return context;
}

