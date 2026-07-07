import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { cn } from "@/lib/utils";

const AI_ORB = "/assets/washmate-staff/icons/actions/ai-orb.svg";

/**
 * Nút tròn trò chuyện AI (FAB) + hộp chat — gọi API AI THẬT của BE:
 * POST /owner/insights/ai-chat (Gemini). Không fake câu trả lời:
 * BE chưa cấu hình AI → hiển thị thông báo, khóa ô nhập.
 * Props: { fromDate, toDate, insightId?, aiConfigured: boolean|null }
 */
export function AiChatWidget({ fromDate, toDate, insightId, aiConfigured }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai'|'error', text, actions? }
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, sending, open]);

  const disabled = aiConfigured === false;

  async function handleSend(e) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || sending || disabled) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setSending(true);
    try {
      const res = await adminApi.aiChat({ question, insightId: insightId ?? null, fromDate, toDate });
      setMessages((m) => [...m, {
        role: "ai",
        text: res?.answer || "AI không trả về nội dung.",
        actions: Array.isArray(res?.suggestedActions) ? res.suggestedActions : [],
      }]);
    } catch (err) {
      setMessages((m) => [...m, {
        role: "error",
        text: err?.message || "Không thể kết nối trợ lý AI. Vui lòng thử lại.",
      }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Hộp chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex max-h-[70vh] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-floating">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary via-accent-indigo to-accent-violet px-4 py-3">
            <Sparkles size={16} className="text-white" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight text-white">Trợ lý AI vận hành</p>
              <p className="text-xs leading-tight text-primary-container">Trả lời từ dữ liệu lịch hẹn trong kỳ đang xem</p>
            </div>
            <button
              type="button"
              aria-label="Đóng trò chuyện"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white hover:bg-card/20"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {disabled ? (
              <p className="rounded-xl bg-warning-container px-3 py-2 text-xs leading-5 text-warning">
                Chức năng gợi ý AI chưa được backend hỗ trợ.
              </p>
            ) : messages.length === 0 ? (
              <p className="text-xs leading-5 text-neutral-muted">
                Đặt câu hỏi về dữ liệu vận hành trong kỳ đang xem — ví dụ: "Vì sao tỷ lệ hủy tăng?",
                "Khung giờ nào đang quá tải?".
              </p>
            ) : null}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5",
                    msg.role === "user" && "bg-primary text-white",
                    msg.role === "ai" && "bg-surface text-foreground",
                    msg.role === "error" && "bg-critical-container text-critical",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.actions?.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-border pt-2">
                      {msg.actions.map((a, j) => (
                        <li key={j} className="text-muted-foreground">• {a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-surface px-3 py-2 text-xs text-muted-foreground">
                  <Sparkles size={12} className="animate-pulse text-accent-violet" /> Đang trả lời...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={disabled ? "AI chưa khả dụng" : "Nhập câu hỏi..."}
              disabled={disabled || sending}
              maxLength={1000}
              className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring disabled:bg-muted"
            />
            <button
              type="submit"
              aria-label="Gửi câu hỏi"
              disabled={disabled || sending || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-primary to-accent-violet text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Nút tròn trò chuyện (FAB) — sóng lan tỏa + nhịp "thở" khi đang đóng.
          motion-reduce: tắt toàn bộ animation cho người dùng giảm chuyển động. */}
      <div className="fixed bottom-6 right-6 z-50 h-14 w-14">
        {!open && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-accent-violet/30 motion-reduce:hidden"
              style={{ animationDelay: "0.7s", animationDuration: "2s" }}
            />
          </>
        )}
        <button
          type="button"
          aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative grid h-14 w-14 place-items-center rounded-full transition-transform duration-200 hover:scale-110 active:scale-95",
            open
              ? "overflow-hidden bg-gradient-to-br from-primary via-accent-indigo to-accent-violet text-white shadow-floating"
              : "bg-transparent",
          )}
        >
          {open ? (
            <X size={22} />
          ) : (
            <img
              src={AI_ORB}
              alt=""
              className="h-16 w-16 max-w-none animate-pulse motion-reduce:animate-none"
            />
          )}
        </button>
      </div>
    </>
  );
}
