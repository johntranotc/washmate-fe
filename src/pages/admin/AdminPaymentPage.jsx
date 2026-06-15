import AdminDataPage from "../../components/admin/AdminDataPage";
import { adminMockData } from "../../mocks/adminMockData";
export default function AdminPaymentPage() { return <AdminDataPage type="payments" mockData={adminMockData.payments} />; }
