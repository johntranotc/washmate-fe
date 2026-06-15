import AdminDataPage from "../../components/admin/AdminDataPage";
import { adminMockData } from "../../mocks/adminMockData";
export default function AdminInvoicePage() { return <AdminDataPage type="invoices" mockData={adminMockData.invoices} />; }
