import AdminDataPage from "../../components/admin/AdminDataPage";
import { adminMockData } from "../../mocks/adminMockData";
export default function AdminBookingPage() { return <AdminDataPage type="bookings" mockData={adminMockData.bookings} />; }
