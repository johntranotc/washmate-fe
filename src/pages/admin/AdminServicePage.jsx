import AdminDataPage from "../../components/admin/AdminDataPage";
import { adminMockData } from "../../mocks/adminMockData";
export default function AdminServicePage() { return <AdminDataPage type="services" mockData={adminMockData.services} />; }
