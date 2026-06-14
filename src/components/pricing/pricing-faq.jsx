import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/section-heading";

const faqs = [
  {
    q: "Tôi có thể thay đổi hoặc hủy lịch đã đặt không?",
    a: "Có. Bạn có thể thay đổi hoặc hủy lịch miễn phí trước giờ hẹn ít nhất 2 tiếng ngay trong ứng dụng.",
  },
  {
    q: "Điểm thành viên được tính như thế nào?",
    a: "Mỗi lần sử dụng dịch vụ bạn sẽ được cộng điểm tương ứng với giá trị đơn hàng. Điểm dùng để nâng hạng và nhận ưu đãi.",
  },
  {
    q: "Giá đã bao gồm thuế chưa?",
    a: "Tất cả mức giá hiển thị đều đã bao gồm thuế VAT. Hóa đơn chi tiết được gửi đến bạn sau mỗi lần thanh toán.",
  },
  {
    q: "Tôi có thể thanh toán bằng những hình thức nào?",
    a: "SparkleAI hỗ trợ thanh toán qua thẻ, ví điện tử và tiền mặt tại gara. Mọi giao dịch đều minh bạch và có hóa đơn.",
  },
  {
    q: "Các gói dịch vụ có áp dụng cho mọi loại xe không?",
    a: "Có. Mức giá có thể thay đổi nhẹ tùy theo kích thước xe, hệ thống sẽ hiển thị giá chính xác khi bạn chọn xe.",
  },
];

export function PricingFaq() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Câu hỏi thường gặp"
          title="Bạn còn điều gì băn khoăn?"
          description="Những thắc mắc phổ biến nhất về dịch vụ và bảng giá của chúng tôi."
        />
        <Accordion className="mt-12 w-full">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="mb-3 rounded-2xl border border-border bg-card px-5 shadow-sm last:mb-0"
            >
              <AccordionTrigger className="text-left text-[16px] font-semibold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
