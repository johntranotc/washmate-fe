import axiosClient from "./axiosClient";

export const paymentApi = {
  getById: (paymentId) => axiosClient.get(`/payments/${paymentId}`),
  getPaymentByBookingId: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/payment`),
  getBookingPayment: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/payment`),

  getPaymentTransactions: (paymentId) =>
    axiosClient.get(`/payments/${paymentId}/transactions`),

  confirmPayment: (paymentId, payload) =>
    axiosClient.post(`/payments/${paymentId}/confirm`, payload),
  markPaid: (paymentId, payload) =>
    axiosClient.post(`/payments/${paymentId}/confirm`, payload),
  refund: (paymentId, payload) =>
    axiosClient.post(`/payments/${paymentId}/refund`, payload),
  cancel: (paymentId) => axiosClient.post(`/payments/${paymentId}/cancel`),
};
