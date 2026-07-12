import { ArrowLeft, Gift, LockKeyhole, Sparkles, X } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { loyaltyApi } from "@/api/loyaltyApi";
import { rewardApi } from "@/api/rewardApi";
import { normalizeLoyalty, normalizeRewards } from "@/lib/customer-engagement-data";

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState(0);
  const [garageId, setGarageId] = useState(null);

  const [message, setMessage] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);

  const load = async () => {
    try {
      const accountResponse = await loyaltyApi.getMyLoyalty();
      const account = accountResponse?.data ?? accountResponse ?? {};
      const gid = account.garageId ?? null;
      setGarageId(gid);
      setPoints(normalizeLoyalty(accountResponse).availablePoints);
      if (gid != null) {
        setRewards(normalizeRewards(await rewardApi.getCustomerRewards(gid)));
      } else {
        setRewards([]);
      }
    } catch (error) {
      console.error("Failed to load rewards", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const redeem = async (reward) => {
    if (garageId == null) {
      setMessage("Không xác định được gara của tài khoản.");
      return;
    }
    setRedeemingId(reward.id);
    try {
      await rewardApi.redeemReward(reward.id, garageId);
      setMessage("Đổi thưởng thành công. Điểm của bạn đã được cập nhật.");
      await load();
    } catch {
      setMessage("Đổi thưởng thất bại, vui lòng thử lại sau.");
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <PageContainer variant="customer">
      <Link to="/khach-hang/diem-thanh-vien" className="inline-flex items-center gap-2 text-xs font-bold text-primary"><ArrowLeft size={14} /> Quay lại điểm thành viên</Link>
      <PageHeader
        title="Đổi điểm lấy quà"
        description="Điểm chỉ thay đổi sau khi hệ thống xác nhận đổi thưởng thành công."
        actions={<div className="rounded-2xl bg-primary px-5 py-3 text-white"><p className="text-xs text-primary-container">Điểm khả dụng</p><b className="text-2xl">{points.toLocaleString("vi-VN")}</b></div>}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => {
          const enoughPoints = points >= reward.pointsRequired;
          return (
            <article key={reward.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container text-primary"><Gift size={25} /></span>
              <h2 className="mt-5 font-extrabold">{reward.name}</h2>
              <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">{reward.description}</p>
              <p className="mt-5 flex items-center gap-2 text-xl font-black text-primary"><Sparkles size={18} /> {reward.pointsRequired.toLocaleString("vi-VN")} điểm</p>
              <Button disabled={!enoughPoints || redeemingId === reward.id} onClick={() => redeem(reward)} className="mt-5 w-full">
                {!enoughPoints && <LockKeyhole size={14} />}{enoughPoints ? (redeemingId === reward.id ? "Đang gửi..." : "Đổi thưởng") : "Chưa đủ điểm"}
              </Button>
            </article>
          );
        })}
      </section>
      {message && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-floating">
            <button onClick={() => setMessage("")} className="ml-auto block rounded-full p-2 text-neutral-muted hover:bg-muted"><X size={18} /></button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-container text-primary"><Gift size={25} /></span>
            <h2 className="mt-4 text-center text-lg font-extrabold">Thông tin đổi thưởng</h2>
            <p className="mt-2 text-center text-sm leading-6 text-muted-foreground">{message}</p>
            <Button onClick={() => setMessage("")} className="mt-5 w-full">Đã hiểu</Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
