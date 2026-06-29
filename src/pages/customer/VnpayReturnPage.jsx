import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 bg-slate-50">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-slate-100">
        <div className="mb-6 flex justify-center">
          {isSuccess ? (
            <CheckCircle className="h-24 w-24 text-green-500 drop-shadow-sm" />
          ) : (
            <XCircle className="h-24 w-24 text-red-500 drop-shadow-sm" />
          )}
        </div>
        <h2 className={`mb-3 text-3xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        </h2>
        <p className="mb-8 text-slate-600 text-lg">
          {isSuccess 
            ? 'Cảm ơn bạn! Giao dịch của bạn đã được hệ thống ghi nhận thành công.' 
            : 'Rất tiếc, giao dịch không thành công hoặc đã bị hủy.'}
        </p>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : bookingId ? (
            <>
              <Link
                to={`/khach-hang/lich-dat/${bookingId}`}
                className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                Xem chi tiết lịch đặt
              </Link>
              <Link
                to={`/khach-hang/thanh-toan/${bookingId}/hoa-don`}
                className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-white font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
              >
                Xem hóa đơn
              </Link>
            </>
          ) : (
            <Link
              to="/khach-hang/lich-dat"
              className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Quản lý lịch đặt của tôi
            </Link>
          )}
          
          <Link
            to="/"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
