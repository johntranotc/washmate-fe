import { Crown, Gift, Sparkles, WalletCards } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../state/AppStore";

const rewards = [
  { id: 1, name: "Giảm 20% dịch vụ", points: 1000 },
  { id: 2, name: "Miễn phí rửa xe cơ bản", points: 1800 },
  { id: 3, name: "Nâng cấp gói cao cấp", points: 2500 },
];

const tierLabels = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
};

function LoyaltyPage() {
  const { state, actions } = useAppStore();
  const [message, setMessage] = useState("");
  const loyalty = state.loyalty;
  const nextTier = loyalty.totalPoints < 2000 ? 2000 : 5000;
  const progress = Math.min((loyalty.totalPoints / nextTier) * 100, 100);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 p-7 text-white">
        <Sparkles className="absolute right-8 top-8 opacity-30" size={80} />
        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Chương trình khách hàng thân thiết</p>
        <h1 className="mt-3 text-3xl font-extrabold">{loyalty.availablePoints} điểm</h1>
        <p className="mt-2 text-xs text-blue-100">Điểm có thể dùng để đổi quà tại cơ sở đang hoạt động.</p>
        <div className="mt-6 max-w-xl"><div className="flex justify-between text-[9px]"><span>{tierLabels[loyalty.tier] || loyalty.tier}</span><span>{nextTier} điểm</span></div><div className="mt-2 h-2 rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{width:`${progress}%`}} /></div></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[[WalletCards,"Điểm khả dụng",loyalty.availablePoints],[Sparkles,"Tổng điểm tích lũy",loyalty.totalPoints],[Crown,"Hạng thành viên",tierLabels[loyalty.tier] || loyalty.tier]].map(([Icon,label,value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5"><Icon className="text-blue-600" size={20} /><p className="mt-3 text-[10px] text-slate-500">{label}</p><strong className="mt-1 block text-2xl">{value}</strong></article>)}
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-extrabold">Lịch sử điểm</h2><div className="mt-4 divide-y divide-slate-100">{loyalty.transactions.map((tx)=><div key={tx.id} className="flex items-center gap-3 py-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600"><Sparkles size={15} /></span><div className="flex-1"><b className="text-xs">{tx.description}</b><p className="mt-1 text-[9px] text-slate-400">{new Date(tx.createdAt).toLocaleString("vi-VN")}</p></div><strong className={tx.points >= 0 ? "text-blue-600" : "text-rose-600"}>{tx.points > 0 ? "+" : ""}{tx.points}</strong></div>)}</div></section>
        <section><div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold">Kho quà tặng</h2>{message && <span className="text-[9px] font-bold text-blue-600">{message}</span>}</div><div className="grid gap-3 sm:grid-cols-3">{rewards.map((reward)=><article key={reward.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600"><Gift size={18}/></span><b className="mt-4 text-xs">{reward.name}</b><p className="mt-2 text-lg font-extrabold text-blue-600">{reward.points} điểm</p><button onClick={() => {try {actions.redeemReward(reward.name,reward.points);setMessage(`${reward.name} đã được đổi thành công.`);} catch(error){setMessage(error.message);}}} disabled={loyalty.availablePoints < reward.points} className="mt-5 rounded-lg bg-blue-600 py-2 text-[10px] font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">Đổi quà</button></article>)}</div></section>
      </div>
    </div>
  );
}

export default LoyaltyPage;

