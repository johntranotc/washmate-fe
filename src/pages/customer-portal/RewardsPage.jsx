import { ArrowLeft, Gift, LockKeyhole, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loyaltyApi } from "@/api/loyaltyApi";
import { rewardApi } from "@/api/rewardApi";
import { normalizeLoyalty, normalizeRewards } from "@/lib/customer-engagement-data";

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState(0);

  const [message, setMessage] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    Promise.all([loyaltyApi.getMyLoyalty(), rewardApi.getRewards()])
      .then(([accountResponse, rewardResponse]) => {
        setPoints(normalizeLoyalty(accountResponse).availablePoints);
        setRewards(normalizeRewards(rewardResponse));
      })
      .catch((error) => {
        console.error("Failed to load rewards", error);
      });
  }, []);

  const redeem = async (reward) => {
    setRedeemingId(reward.id);
    try {
      await rewardApi.redeemReward(reward.id, {});
      setMessage("Yêu cầu đổi thưởng đã được ghi nhận.");
    } catch {
      setMessage("Đổi thưởng thất bại, vui lòng thử lại sau.");
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/khach-hang/diem-thanh-vien" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600"><ArrowLeft size={14} /> Quay lại điểm thành viên</Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Kho quà thành viên</p>
          <h1 className="mt-2 text-3xl font-extrabold">Đổi điểm lấy quà</h1>
          <p className="mt-2 text-sm text-slate-500">Điểm chỉ thay đổi sau khi backend xác nhận đổi thưởng thành công.</p>
        </div>
        <div className="rounded-2xl bg-blue-600 px-5 py-3 text-white"><p className="text-[10px] text-blue-100">Điểm khả dụng</p><b className="text-2xl">{points.toLocaleString("vi-VN")}</b></div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => {
          const enoughPoints = points >= reward.pointsRequired;
          return (
            <article key={reward.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Gift size={25} /></span>
              <h2 className="mt-5 font-extrabold">{reward.name}</h2>
              <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">{reward.description}</p>
              <p className="mt-5 flex items-center gap-2 text-xl font-black text-blue-600"><Sparkles size={18} /> {reward.pointsRequired.toLocaleString("vi-VN")} điểm</p>
              <button disabled={!enoughPoints || redeemingId === reward.id} onClick={() => redeem(reward)} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">
                {!enoughPoints && <LockKeyhole size={14} />}{enoughPoints ? (redeemingId === reward.id ? "Đang gửi..." : "Đổi thưởng") : "Chưa đủ điểm"}
              </button>
            </article>
          );
        })}
      </section>
      {message && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <button onClick={() => setMessage("")} className="ml-auto block rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600"><Gift size={25} /></span>
            <h2 className="mt-4 text-center text-lg font-extrabold">Thông tin đổi thưởng</h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-500">{message}</p>
            <button onClick={() => setMessage("")} className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white">Đã hiểu</button>
          </div>
        </div>
      )}
    </div>
  );
}
