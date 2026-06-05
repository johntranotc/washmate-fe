import axiosClient from "./axiosClient";

export const invoiceApi = {
  getBookingInvoice: (bookingId) =>
    axiosClient.get(`/bookings/${bookingId}/invoice`),
};
