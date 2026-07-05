import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '../../api/paymentApi';

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const result = searchParams.get('result');
  const paymentId = searchParams.get('paymentId');

  const [bookingId, setBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSuccess = result === 'success';

  useEffect(() => {
    if (isSuccess && paymentId) {
      setIsLoading(true);
      paymentApi.getById(paymentId)
        .then((res) => {
          if (res.data?.bookingId) {
            setBookingId(res.data.bookingId);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch payment details:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isSuccess, paymentId]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 bg-surface">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-floating border border-border">
        <div className="mb-6 flex justify-center">
          {isSuccess ? (
            <CheckCircle className="h-24 w-24 text-success" />
          ) : (
            <XCircle className="h-24 w-24 text-critical" />
          )}
        </div>
        <h2 className={`mb-3 text-3xl font-bold ${isSuccess ? 'text-success' : 'text-critical'}`}>
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        </h2>
        <p className="mb-8 text-muted-foreground text-lg">
          {isSuccess 
            ? 'Cảm ơn bạn! Giao dịch của bạn đã được hệ thống ghi nhận thành công.' 
            : 'Rất tiếc, giao dịch không thành công hoặc đã bị hủy.'}
        </p>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-muted" />
            </div>
          ) : bookingId ? (
            <>
              <Button size="lg" className="w-full" render={<Link to={`/khach-hang/lich-dat/${bookingId}`} />}>
                Xem chi tiết lịch đặt
              </Button>
              <Button size="lg" className="w-full bg-success text-white hover:bg-success/90" render={<Link to={`/khach-hang/thanh-toan/${bookingId}/hoa-don`} />}>
                Xem hóa đơn
              </Button>
            </>
          ) : (
            <Button size="lg" className="w-full" render={<Link to="/khach-hang/lich-dat" />}>
              Quản lý lịch đặt của tôi
            </Button>
          )}

          <Button variant="outline" size="lg" className="w-full text-muted-foreground" render={<Link to="/" />}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
