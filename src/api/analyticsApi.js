import axiosClient from "./axiosClient";

// TODO(BE): AdminDashboardPage hiện suy ra KPI/insight/cảnh báo TRỰC TIẾP từ danh sách booking thật
// (không có dữ liệu giả). Nếu BE bổ sung endpoint tổng hợp cấp chủ doanh nghiệp, ví dụ:
//   GET /api/v1/analytics/garage-owner/dashboard -> KPI + so sánh kỳ trước + revenue theo thời gian/dịch vụ/chi nhánh
// thì nên ưu tiên dùng getAnalyticsSummary() để giảm tải tính toán phía FE.

export const analyticsApi = {
  getAnalyticsSummary: () => axiosClient.get("/v1/analytics/garage-owner/dashboard"),
  getCustomerBehavior: (params) => axiosClient.get("/v1/analytics/admin/behavioral-logs", { params }),
  getCustomerSegments: (params) => axiosClient.get("/v1/analytics/admin/customer-segments", { params }),
};
