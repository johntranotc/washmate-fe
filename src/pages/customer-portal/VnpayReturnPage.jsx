import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, CircleSlash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '../../api/paymentApi';

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const result = searchParams.get('result');
  const paymentId = searchParams.get('paymentId');

  const [bookingId, setBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSuccess = result === 'success';
  // Khách chủ động hủy trên cổng VNPAY (vnp_ResponseCode=24) -> không phải lỗi,
  // hiển thị tone trung tính và cho thanh toán lại thay vì màn hình thất bại.
  const isCancelled = result === 'cancelled';

  // Cần bookingId cả khi hủy để đưa khách quay lại đúng trang thanh toán.
  const shouldFetchBooking = (isSuccess || isCancelled) && Boolean(paymentId);

  useEffect(() => {
    if (!shouldFetchBooking) return;

    setIsLoading(true);
    paymentApi.getById(paymentId)
      .then((res) => {
        // axiosClient đã unwrap → bookingId nằm ngay ở top-level của PaymentResponse.
        const bId = res?.bookingId ?? res?.data?.bookingId ?? res?.booking?.id ?? null;
        if (bId != null) setBookingId(bId);
      })
      .catch((err) => {
        console.error("Failed to fetch payment details:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shouldFetchBooking, paymentId]);

  const icon = isSuccess
    ? <CheckCircle className="h-24 w-24 text-success" />
    : isCancelled
      ? <CircleSlash className="h-24 w-24 text-warning" />
      : <XCircle className="h-24 w-24 text-critical" />;

  const titleTone = isSuccess
    ? 'text-success'
    : isCancelled
      ? 'text-warning'
      : 'text-critical';

  const title = isSuccess
    ? 'Thanh toán thành công'
    : isCancelled
      ? 'Bạn đã hủy thanh toán'
      : 'Thanh toán thất bại';

  const message = isSuccess
    ? 'Cảm ơn bạn! Giao dịch của bạn đã được hệ thống ghi nhận thành công.'
    : isCancelled
      ? 'Giao dịch chưa được thực hiện. Lịch đặt của bạn vẫn được giữ, bạn có thể thanh toán lại.'
      : 'Rất tiếc, giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 bg-surface">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-floating border border-border">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h2 className={`mb-3 text-3xl font-bold ${titleTone}`}>{title}</h2>
        <p className="mb-8 text-muted-foreground text-lg">{message}</p>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-muted" />
            </div>
          ) : isSuccess && bookingId ? (
            <Button size="lg" className="w-full bg-success text-white hover:bg-success/90" render={<Link to={`/khach-hang/thanh-toan/${bookingId}/hoa-don`} />}>
              Xem hóa đơn
            </Button>
          ) : !isSuccess && bookingId ? (
            <Button size="lg" className="w-full" render={<Link to={`/khach-hang/thanh-toan/${bookingId}`} />}>
              Thanh toán lại
            </Button>
          ) : (
            <Button size="lg" className="w-full" render={<Link to="/khach-hang/lich-dat" />}>
              Quản lý lịch đặt của tôi
            </Button>
          )}

          <Button variant="outline" size="lg" className="w-full" render={<Link to="/khach-hang" />}>
            Về trang tổng quan
          </Button>
        </div>
      </div>
    </div>
  );
}
