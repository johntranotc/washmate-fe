import axiosClient from "./axiosClient";

export const paymentApi = {
  getBookingPayment: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/payment`),

  getPaymentTransactions: (paymentId) =>
    axiosClient.get(`/payments/${paymentId}/transactions`),

  markPaid: (paymentId, payload) =>
    axiosClient.post(`/payments/${paymentId}/mark-paid`, payload),
};
