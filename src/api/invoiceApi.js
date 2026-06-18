import axiosClient from "./axiosClient";

export const invoiceApi = {
  getById: (invoiceId) => axiosClient.get(`/invoices/${invoiceId}`),
  getInvoiceByBookingId: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/invoice`),
  getBookingInvoice: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/invoice`),
};
