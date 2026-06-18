import axiosClient from "./axiosClient";

export const adminApi = {
  getAdminSummary: () => axiosClient.get("/analytics/summary"),
  getGarages: () => axiosClient.get("/garages"),
  getServicePackages: () => axiosClient.get("/service-packages"),
  getSlots: () => axiosClient.get("/booking-slots"),
  getBookings: () => axiosClient.get("/bookings"),
  getPayments: () => axiosClient.get("/payments"),
  getInvoices: () => axiosClient.get("/invoices"),
  getReports: () => axiosClient.get("/analytics/reports"),
};
